import type { Config } from "@netlify/functions";
import { eq, lt } from "drizzle-orm";
import { randomBytes } from "node:crypto";
import { db } from "../../db/index.js";
import { journalState, sessions } from "../../db/schema.js";

type Item = { id: string; [key: string]: unknown };
type StoredUser = Item & { email: string; name: string; password?: string; role: string };

const ARRAY_KEYS = [
  "users",
  "grades",
  "students",
  "attendance",
  "timetable",
  "messages",
  "announcements",
  "homework",
  "behaviorPoints",
  "lessonPlusMinus",
  "passwordResetRequests",
] as const;
const ALL_KEYS = ["systemConfig", ...ARRAY_KEYS] as const;
type StateKey = (typeof ALL_KEYS)[number];

// Collections that only the school administrator may modify
const ADMIN_ONLY_KEYS: StateKey[] = ["systemConfig", "users", "passwordResetRequests"];

const SESSION_MAX_AGE_MS = 30 * 24 * 60 * 60 * 1000;

const json = (data: unknown, status = 200) => Response.json(data, { status });
const error = (message: string, status: number) => json({ error: message }, status);

async function readState(keys: readonly StateKey[] = ALL_KEYS): Promise<Record<string, unknown>> {
  const rows = await db.select().from(journalState);
  const state: Record<string, unknown> = {};
  for (const key of keys) state[key] = key === "systemConfig" ? null : [];
  for (const row of rows) {
    if ((keys as readonly string[]).includes(row.key)) state[row.key] = row.data;
  }
  return state;
}

async function readKey<T>(key: StateKey, fallback: T): Promise<T> {
  const [row] = await db.select().from(journalState).where(eq(journalState.key, key));
  return row ? (row.data as T) : fallback;
}

function publicConfig(config: any) {
  if (!config?.isInitialized) return { isInitialized: false };
  return {
    isInitialized: true,
    schoolName: config.schoolName,
    schoolCity: config.schoolCity,
    academicYear: config.academicYear,
    semester: config.semester,
  };
}

function stripPasswords(users: StoredUser[]) {
  return users.map(({ password: _password, ...rest }) => rest);
}

async function createSession(userId: string) {
  const token = randomBytes(32).toString("hex");
  await db.insert(sessions).values({ token, userId });
  // Opportunistically clean up expired sessions
  await db.delete(sessions).where(lt(sessions.createdAt, new Date(Date.now() - SESSION_MAX_AGE_MS)));
  return token;
}

async function authenticate(req: Request): Promise<StoredUser | null> {
  const header = req.headers.get("authorization") || "";
  const token = header.startsWith("Bearer ") ? header.slice(7) : "";
  if (!token) return null;
  const [session] = await db.select().from(sessions).where(eq(sessions.token, token));
  if (!session || Date.now() - session.createdAt.getTime() > SESSION_MAX_AGE_MS) return null;
  const users = await readKey<StoredUser[]>("users", []);
  return users.find(u => u.id === session.userId) ?? null;
}

async function stateForUser(user: StoredUser) {
  const state = await readState();
  if (user.role !== "admin") {
    state.users = stripPasswords(state.users as StoredUser[]);
    delete state.passwordResetRequests;
  }
  return state;
}

function findUserByLogin(users: StoredUser[], login: string) {
  const cleaned = login.trim().toLowerCase();
  return users.find(u => u.email.toLowerCase() === cleaned || u.name.toLowerCase() === cleaned);
}

type Change = { value: unknown } | { upserts?: Item[]; deletes?: string[] };

function applyChange(current: unknown, change: Change): unknown {
  if ("value" in change) return change.value;
  const list = Array.isArray(current) ? [...(current as Item[])] : [];
  const deletes = new Set(change.deletes ?? []);
  let result = list.filter(item => !deletes.has(item.id));
  const newItems: Item[] = [];
  for (const item of change.upserts ?? []) {
    const index = result.findIndex(existing => existing.id === item.id);
    if (index >= 0) result[index] = item;
    else newItems.push(item);
  }
  return [...newItems, ...result];
}

export default async (req: Request) => {
  const url = new URL(req.url);
  const route = url.pathname.replace(/^\/api\/?/, "");
  const method = req.method;

  try {
    // Public: school info and whether the journal has been set up already
    if (route === "public" && method === "GET") {
      const config = await readKey("systemConfig", null);
      return json(publicConfig(config));
    }

    // One-time setup of the school and its main administrator. Once done, it can never be repeated
    // from another device – only the administrator can reset the journal.
    if (route === "setup" && method === "POST") {
      const { state } = await req.json();
      const config = state?.systemConfig;
      const users: StoredUser[] = Array.isArray(state?.users) ? state.users : [];
      const admin = users.find(u => u.role === "admin");
      if (!config || !admin || !admin.password) return error("Nieprawidłowe dane konfiguracji.", 400);

      const created = await db.transaction(async tx => {
        const inserted = await tx
          .insert(journalState)
          .values({ key: "systemConfig", data: { ...config, isInitialized: true } })
          .onConflictDoNothing()
          .returning();
        if (inserted.length === 0) return false;
        for (const key of ARRAY_KEYS) {
          await tx
            .insert(journalState)
            .values({ key, data: Array.isArray(state[key]) ? state[key] : [] })
            .onConflictDoUpdate({ target: journalState.key, set: { data: Array.isArray(state[key]) ? state[key] : [], updatedAt: new Date() } });
        }
        return true;
      });

      if (!created) return error("Dziennik został już skonfigurowany. Zaloguj się kontem Administratora.", 409);
      const token = await createSession(admin.id);
      return json({ token, userId: admin.id, state: await stateForUser(admin) });
    }

    if (route === "login" && method === "POST") {
      const { login, password } = await req.json();
      if (typeof login !== "string" || typeof password !== "string" || !login.trim() || !password) {
        return error("Wprowadź login i hasło.", 400);
      }
      const users = await readKey<StoredUser[]>("users", []);
      const user = findUserByLogin(users, login);
      if (!user || !user.password || user.password !== password) {
        return error("Nieprawidłowy login lub hasło.", 401);
      }
      const token = await createSession(user.id);
      return json({ token, userId: user.id, state: await stateForUser(user) });
    }

    if (route === "logout" && method === "POST") {
      const header = req.headers.get("authorization") || "";
      if (header.startsWith("Bearer ")) await db.delete(sessions).where(eq(sessions.token, header.slice(7)));
      return json({ ok: true });
    }

    // Public: forgotten-password requests sent from the login screen
    if (route === "reset-requests" && method === "POST") {
      const { request } = await req.json();
      if (!request?.fullName || !request?.emailOrLogin) return error("Niepełny wniosek.", 400);
      const nowStr = new Date().toISOString().replace("T", " ").slice(0, 16);
      const id = "RST-" + Math.floor(1000 + Math.random() * 9000);
      const fullName = String(request.fullName).trim().slice(0, 200);
      const emailOrLogin = String(request.emailOrLogin).trim().toLowerCase().slice(0, 200);
      const roleCandidate = ["uczen", "nauczyciel", "rodzic"].includes(request.roleCandidate) ? request.roleCandidate : "uczen";
      const className = request.className ? String(request.className).trim().slice(0, 50) : undefined;
      const reasonNote =
        String(request.reasonNote || "").trim().slice(0, 1000) || "Prośba o nadanie / zresetowanie hasła dostępowego.";
      const newRequest = { id, fullName, emailOrLogin, roleCandidate, className, requestDate: nowStr, status: "oczekujące", reasonNote };

      await db.transaction(async tx => {
        const [requestsRow] = await tx.select().from(journalState).where(eq(journalState.key, "passwordResetRequests")).for("update");
        const requests = applyChange(requestsRow?.data ?? [], { upserts: [newRequest] });
        await tx
          .insert(journalState)
          .values({ key: "passwordResetRequests", data: requests })
          .onConflictDoUpdate({ target: journalState.key, set: { data: requests, updatedAt: new Date() } });

        // Notify the administrator in their inbox
        const [usersRow] = await tx.select().from(journalState).where(eq(journalState.key, "users"));
        const admin = ((usersRow?.data as StoredUser[]) ?? []).find(u => u.role === "admin");
        if (!admin) return;
        const alertMsg = {
          id: "msg_req_" + Date.now(),
          senderId: "system_reset",
          senderName: "System Resetu Haseł",
          senderRole: "Formularz Zgłoszeniowy",
          recipientId: admin.id,
          recipientName: admin.name,
          subject: `[Prośba o hasło #${id}] ${fullName} (${emailOrLogin})`,
          content: `Użytkownik złożył wniosek o reset / wydanie hasła:\n\n- Imię i nazwisko: ${fullName}\n- E-mail / Login: ${emailOrLogin}\n- Rola: ${roleCandidate}${className ? ` (Oddział: ${className})` : ""}\n- Powód: ${reasonNote}\n- Kod zgłoszenia: #${id}\n\nPrzejdź do Panelu Administratora (zakładka "Zgłoszenia o reset hasła"), aby wygenerować nowe hasło i odesłać odpowiedź.`,
          date: nowStr,
          isRead: false,
          isStarred: true,
        };
        const [messagesRow] = await tx.select().from(journalState).where(eq(journalState.key, "messages")).for("update");
        const messages = applyChange(messagesRow?.data ?? [], { upserts: [alertMsg] });
        await tx
          .insert(journalState)
          .values({ key: "messages", data: messages })
          .onConflictDoUpdate({ target: journalState.key, set: { data: messages, updatedAt: new Date() } });
      });
      return json({ ok: true, requestId: id });
    }

    if (route === "reset-requests" && method === "GET") {
      const query = (url.searchParams.get("q") || "").trim().toLowerCase();
      if (!query) return json({ request: null });
      const requests = await readKey<Item[]>("passwordResetRequests", []);
      const match = requests.find(
        (r: any) =>
          r.emailOrLogin?.toLowerCase() === query || r.id.toLowerCase() === query || r.id.toLowerCase() === "#" + query
      );
      return json({ request: match ?? null });
    }

    // Everything below requires a logged-in user
    const user = await authenticate(req);
    if (!user) return error("Sesja wygasła. Zaloguj się ponownie.", 401);

    if (route === "state" && method === "GET") {
      return json({ userId: user.id, state: await stateForUser(user) });
    }

    if (route === "sync" && method === "POST") {
      const { changes } = (await req.json()) as { changes: Partial<Record<StateKey, Change>> };
      const keys = Object.keys(changes || {}).filter((k): k is StateKey => (ALL_KEYS as readonly string[]).includes(k));
      if (user.role !== "admin" && keys.some(k => ADMIN_ONLY_KEYS.includes(k))) {
        return error("Tylko Administrator może zmieniać konta i ustawienia szkoły.", 403);
      }
      if (keys.includes("systemConfig")) {
        const change = changes.systemConfig as { value: any };
        if (!change?.value?.isInitialized) return error("Nie można cofnąć konfiguracji szkoły.", 400);
      }
      await db.transaction(async tx => {
        for (const key of keys) {
          const [row] = await tx.select().from(journalState).where(eq(journalState.key, key)).for("update");
          const data = applyChange(row?.data, changes[key]!);
          await tx
            .insert(journalState)
            .values({ key, data })
            .onConflictDoUpdate({ target: journalState.key, set: { data, updatedAt: new Date() } });
        }
      });
      return json({ ok: true });
    }

    // Full wipe – only the administrator can send the journal back to the first-run wizard
    if (route === "reset" && method === "POST") {
      if (user.role !== "admin") return error("Tylko Administrator może zresetować dziennik.", 403);
      await db.transaction(async tx => {
        await tx.delete(journalState);
        await tx.delete(sessions);
      });
      return json({ ok: true });
    }

    return error("Nie znaleziono.", 404);
  } catch (err) {
    console.error(err);
    return error("Błąd serwera.", 500);
  }
};

export const config: Config = {
  path: "/api/*",
};
