import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  User,
  UserRole,
  Grade,
  AttendanceRecord,
  AttendanceStatus,
  TimetableLesson,
  Message,
  Announcement,
  HomeworkTask,
  Student,
  Subject,
  SystemConfig,
  BehaviorPoint,
  LessonPlusMinus,
  PasswordResetRequest,
} from '../types';
import {
  INITIAL_USERS,
  INITIAL_SUBJECTS,
  INITIAL_STUDENTS,
  INITIAL_GRADES,
  INITIAL_ATTENDANCE,
  INITIAL_TIMETABLE,
  INITIAL_MESSAGES,
  INITIAL_ANNOUNCEMENTS,
  INITIAL_HOMEWORK,
  INITIAL_BEHAVIOR_POINTS,
  INITIAL_PLUS_MINUS,
  INITIAL_PASSWORD_RESET_REQUESTS,
} from '../data/initialData';

export interface BehaviorStats {
  basePoints: number;
  positiveTotal: number;
  negativeTotal: number;
  finalPoints: number;
  rankTitle: string;
  rankBadgeColor: string;
  plusCount: number;
  minusCount: number;
}

interface AttendanceStats {
  total: number;
  present: number;
  excused: number;
  unexcused: number;
  late: number;
  rate: number; // percentage
}

interface JournalContextType {
  currentUser: User | null;
  users: User[];
  systemConfig: SystemConfig;
  initializeSystem: (config: {
    schoolName: string;
    schoolCity: string;
    academicYear: string;
    semester: 1 | 2;
    adminName: string;
    adminEmail: string;
    adminPassword?: string;
    includeDemoData?: boolean;
  }) => void;
  updateSystemConfig: (updated: Partial<SystemConfig>) => void;
  resetSystemToInitialWizard: () => void;
  createUserByAdmin: (userData: {
    name: string;
    email: string;
    password?: string;
    role: UserRole;
    className?: string;
    subjectsTaught?: string[];
    parentName?: string;
    parentEmail?: string;
    pesel?: string;
  }) => User;
  updateUserByAdmin: (id: string, updated: Partial<User>) => void;
  deleteUserByAdmin: (id: string) => void;
  loginAs: (userId: string) => void;
  loginWithCredentials: (email: string, password?: string) => boolean;
  logout: () => void;
  resetSystem: () => void;

  grades: Grade[];
  subjects: Subject[];
  students: Student[];
  attendance: AttendanceRecord[];
  timetable: TimetableLesson[];
  messages: Message[];
  announcements: Announcement[];
  homework: HomeworkTask[];
  behaviorPoints: BehaviorPoint[];
  lessonPlusMinus: LessonPlusMinus[];

  // Behavior & Neuroshima Points methods
  addBehaviorPoint: (point: Omit<BehaviorPoint, 'id'>) => void;
  deleteBehaviorPoint: (id: string) => void;
  addLessonPlusMinus: (pm: Omit<LessonPlusMinus, 'id'>) => void;
  deleteLessonPlusMinus: (id: string) => void;
  getBehaviorStats: (studentId: string) => BehaviorStats;

  // Grade methods
  addGrade: (grade: Omit<Grade, 'id'>) => void;
  updateGrade: (id: string, updated: Partial<Grade>) => void;
  deleteGrade: (id: string) => void;
  getSubjectAverage: (studentId: string, subjectId: string, semester?: 1 | 2) => number | null;
  getOverallAverage: (studentId: string, semester?: 1 | 2) => number | null;

  // Attendance methods
  recordAttendance: (records: Array<Omit<AttendanceRecord, 'id'>>) => void;
  saveClassAttendanceRollCall: (params: {
    className: string;
    date: string;
    lessonHour: number;
    subjectName: string;
    teacherName?: string;
    records: Array<{ studentId: string; status: AttendanceStatus; note?: string }>;
  }) => void;
  requestExcuse: (recordId: string, reason: string) => void;
  respondToExcuse: (recordId: string, status: 'accepted' | 'rejected') => void;
  getAttendanceStats: (studentId: string) => AttendanceStats;

  // Timetable methods
  addLesson: (lesson: Omit<TimetableLesson, 'id'>) => void;
  updateLesson: (id: string, updated: Partial<TimetableLesson>) => void;
  deleteLesson: (id: string) => void;

  // Messages methods
  sendMessage: (msg: { recipientId: string; recipientName: string; subject: string; content: string }) => void;
  markMessageAsRead: (id: string) => void;
  toggleMessageStar: (id: string) => void;
  deleteMessage: (id: string) => void;
  unreadCount: number;

  // Announcements & Homework
  addAnnouncement: (ann: Omit<Announcement, 'id' | 'date'>) => void;
  deleteAnnouncement: (id: string) => void;
  addHomework: (hw: Omit<HomeworkTask, 'id'>) => void;
  deleteHomework: (id: string) => void;

  // Student management
  addStudent: (student: Omit<Student, 'id'>) => void;
  updateStudent: (id: string, updated: Partial<Student>) => void;
  deleteStudent: (id: string) => void;

  // Password reset requests
  passwordResetRequests: PasswordResetRequest[];
  submitPasswordResetRequest: (data: {
    fullName: string;
    emailOrLogin: string;
    roleCandidate?: 'uczen' | 'nauczyciel' | 'rodzic';
    className?: string;
    reasonNote?: string;
  }) => { success: boolean; message: string; requestId: string };
  resolvePasswordResetRequest: (
    requestId: string,
    params: { newPassword: string; adminResponse: string; approved: boolean }
  ) => void;

  resetToDefaults: () => void;
}

const JournalContext = createContext<JournalContextType | undefined>(undefined);

const STORAGE_PREFIX = 'edusynergia_v3_clean_';

function loadStorage<T>(key: string, fallback: T): T {
  try {
    const item = localStorage.getItem(STORAGE_PREFIX + key);
    return item ? JSON.parse(item) : fallback;
  } catch {
    return fallback;
  }
}

function saveStorage<T>(key: string, value: T): void {
  try {
    localStorage.setItem(STORAGE_PREFIX + key, JSON.stringify(value));
  } catch (err) {
    console.error('Failed to save to localStorage:', err);
  }
}

const DEFAULT_SYSTEM_CONFIG: SystemConfig = {
  isInitialized: false,
  schoolName: '',
  schoolCity: '',
  academicYear: '2025/2026',
  semester: 2,
  adminName: '',
  adminEmail: '',
};

export const JournalProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [systemConfig, setSystemConfig] = useState<SystemConfig>(() =>
    loadStorage('systemConfig', DEFAULT_SYSTEM_CONFIG)
  );
  const [users, setUsers] = useState<User[]>(() => loadStorage('users', []));
  const [currentUser, setCurrentUser] = useState<User | null>(() => {
    const savedUserId = localStorage.getItem(STORAGE_PREFIX + 'currentUserId');
    if (savedUserId) {
      const savedUsers = loadStorage<User[]>('users', []);
      const match = savedUsers.find(u => u.id === savedUserId);
      if (match) return match;
    }
    return null;
  });

  const [grades, setGrades] = useState<Grade[]>(() => loadStorage('grades', []));
  const [subjects] = useState<Subject[]>(INITIAL_SUBJECTS);
  const [students, setStudents] = useState<Student[]>(() => loadStorage('students', []));
  const [attendance, setAttendance] = useState<AttendanceRecord[]>(() => loadStorage('attendance', []));
  const [timetable, setTimetable] = useState<TimetableLesson[]>(() => loadStorage('timetable', []));
  const [messages, setMessages] = useState<Message[]>(() => loadStorage('messages', []));
  const [announcements, setAnnouncements] = useState<Announcement[]>(() => loadStorage('announcements', []));
  const [homework, setHomework] = useState<HomeworkTask[]>(() => loadStorage('homework', []));
  const [behaviorPoints, setBehaviorPoints] = useState<BehaviorPoint[]>(() =>
    loadStorage('behaviorPoints', [])
  );
  const [lessonPlusMinus, setLessonPlusMinus] = useState<LessonPlusMinus[]>(() =>
    loadStorage('lessonPlusMinus', [])
  );
  const [passwordResetRequests, setPasswordResetRequests] = useState<PasswordResetRequest[]>(() =>
    loadStorage('passwordResetRequests', [])
  );

  useEffect(() => saveStorage('systemConfig', systemConfig), [systemConfig]);
  useEffect(() => saveStorage('users', users), [users]);
  useEffect(() => saveStorage('grades', grades), [grades]);
  useEffect(() => saveStorage('students', students), [students]);
  useEffect(() => saveStorage('attendance', attendance), [attendance]);
  useEffect(() => saveStorage('timetable', timetable), [timetable]);
  useEffect(() => saveStorage('messages', messages), [messages]);
  useEffect(() => saveStorage('announcements', announcements), [announcements]);
  useEffect(() => saveStorage('homework', homework), [homework]);
  useEffect(() => saveStorage('behaviorPoints', behaviorPoints), [behaviorPoints]);
  useEffect(() => saveStorage('lessonPlusMinus', lessonPlusMinus), [lessonPlusMinus]);
  useEffect(() => saveStorage('passwordResetRequests', passwordResetRequests), [passwordResetRequests]);

  useEffect(() => {
    if (currentUser) {
      localStorage.setItem(STORAGE_PREFIX + 'currentUserId', currentUser.id);
    } else {
      localStorage.removeItem(STORAGE_PREFIX + 'currentUserId');
    }
  }, [currentUser]);

  const resetSystemToInitialWizard = () => {
    try {
      localStorage.clear();
    } catch {}
    setSystemConfig({ ...DEFAULT_SYSTEM_CONFIG, isInitialized: false });
    setCurrentUser(null);
    setUsers([]);
    setStudents([]);
    setGrades([]);
    setAttendance([]);
    setTimetable([]);
    setMessages([]);
    setAnnouncements([]);
    setHomework([]);
    setBehaviorPoints([]);
    setLessonPlusMinus([]);
    setPasswordResetRequests([]);
  };

  const initializeSystem = (config: {
    schoolName: string;
    schoolCity: string;
    academicYear: string;
    semester: 1 | 2;
    adminName: string;
    adminEmail: string;
    adminPassword?: string;
    includeDemoData?: boolean;
  }) => {
    // Ochrona jednorazowej konfiguracji w tej przeglądarce.
    // To nie zastępuje serwerowej blokady wspólnej dla wszystkich urządzeń.
    try {
      const alreadyCreated = localStorage.getItem('edusynergia_admin_created_once') === '1';
      if (alreadyCreated || systemConfig.isInitialized || users.some(u => u.role === 'admin')) {
        return;
      }
      localStorage.setItem('edusynergia_admin_created_once', '1');
    } catch {
      if (systemConfig.isInitialized || users.some(u => u.role === 'admin')) return;
    }
    const newConfig: SystemConfig = {
      isInitialized: true,
      schoolName: config.schoolName.trim() || 'Moja Szkoła',
      schoolCity: config.schoolCity.trim() || 'Polska',
      academicYear: config.academicYear.trim() || '2025/2026',
      semester: config.semester,
      adminName: config.adminName.trim() || 'Administrator',
      adminEmail: config.adminEmail.trim() || 'admin@szkola.edu.pl',
    };
    setSystemConfig(newConfig);

    const adminUser: User = {
      id: 'user_admin_' + Date.now(),
      name: config.adminName.trim() || 'Główny Administrator',
      email: config.adminEmail.trim() || 'admin@szkola.edu.pl',
      password: config.adminPassword || 'admin123',
      role: 'admin',
      roleTitle: 'Główny Administrator Systemu',
      createdAt: new Date().toISOString().split('T')[0],
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=256&q=80',
    };

    if (config.includeDemoData) {
      setUsers([adminUser, ...INITIAL_USERS.filter(u => u.role !== 'admin')]);
      setStudents(INITIAL_STUDENTS);
      setGrades(INITIAL_GRADES);
      setAttendance(INITIAL_ATTENDANCE);
      setTimetable(INITIAL_TIMETABLE);
      setBehaviorPoints(INITIAL_BEHAVIOR_POINTS);
      setLessonPlusMinus(INITIAL_PLUS_MINUS);
    } else {
      // Pure clean mode: only the Administrator user created by the user!
      setUsers([adminUser]);
      setStudents([]);
      setGrades([]);
      setAttendance([]);
      setTimetable([]);
      setBehaviorPoints([]);
      setLessonPlusMinus([]);
      setHomework([]);
      setPasswordResetRequests([]);
    }

    // Welcome message for the Administrator
    const welcomeMsg: Message = {
      id: 'msg_welcome_' + Date.now(),
      senderId: 'system',
      senderName: 'System EduSynergia',
      senderRole: 'Powiadomienie powitalne',
      recipientId: adminUser.id,
      recipientName: adminUser.name,
      subject: `Witaj w e-dzienniku szkoły ${newConfig.schoolName}!`,
      content: `Dzień dobry ${adminUser.name}!\n\nTwój elektroniczny dziennik lekcyjny dla szkoły "${newConfig.schoolName}" został pomyślnie uruchomiony w czystej konfiguracji.\n\nJako jedyny Administrator placówki możesz:\n1. Dodać klasy (np. klasa 4, klasa 5) oraz utworzyć konta dla uczniów i nauczycieli w Panelu Administratora.\n2. Samodzielnie ułożyć plan lekcji w zakładce "Plan lekcji" (dostępne sale 1, 2, 3, 4 oraz dowolne sale).\n3. Wpisywać obecności, oceny oraz punkty zachowania (system Neuroshima).\n4. Użytkownicy, którzy zapomną hasła, mogą wysłać do Ciebie wniosek z ekranu logowania, na który odpowiesz nowym hasłem.\n\nŻyczymy owocnej pracy i wspaniałej zabawy z dziennikiem!`,
      date: new Date().toISOString().replace('T', ' ').slice(0, 16),
      isRead: false,
      isStarred: true,
    };
    setMessages([welcomeMsg]);

    const welcomeAnn: Announcement = {
      id: 'ann_welcome_' + Date.now(),
      title: `Inauguracja Dziennika Elektronicznego · ${newConfig.schoolName}`,
      content: `Witamy w roku szkolnym ${newConfig.academicYear}. Dziennik lekcyjny EduSynergia został pomyślnie skonfigurowany. Rejestracja publiczna jest wyłączona — wszystkimi kontami zarządza Administrator.`,
      authorName: adminUser.name,
      authorRole: 'Dyrektor Szkoły / Administrator',
      targetAudience: 'Wszyscy Użytkownicy',
      date: new Date().toISOString().split('T')[0],
      priority: 'important',
      pinned: true,
    };
    setAnnouncements([welcomeAnn]);

    setCurrentUser(adminUser);
  };

  const updateSystemConfig = (updated: Partial<SystemConfig>) => {
    setSystemConfig(prev => ({ ...prev, ...updated }));
  };

  const createUserByAdmin = (params: {
    name: string;
    email: string;
    password?: string;
    role: UserRole;
    className?: string;
    subjectsTaught?: string[];
    parentName?: string;
    parentEmail?: string;
    pesel?: string;
  }): User => {
    const userId = 'user_' + Date.now();
    let studentId: string | undefined = undefined;

    if (params.role === 'student') {
      studentId = 'st_' + Date.now();
      const names = params.name.trim().split(' ');
      const firstName = names[0] || 'Uczeń';
      const lastName = names.slice(1).join(' ') || 'Nowy';
      const newStudent: Student = {
        id: studentId,
        firstName,
        lastName,
        className: params.className || '3A',
        numberInJournal: students.length + 1,
        pesel: params.pesel || ('08' + Math.floor(100000000 + Math.random() * 900000000)),
        parentName: params.parentName || `Rodzic (${lastName})`,
        parentEmail: params.parentEmail || `${lastName.toLowerCase()}@rodzic.szkola.edu.pl`,
      };
      setStudents(prev => [...prev, newStudent]);
    }

    const roleTitles: Record<UserRole, string> = {
      admin: 'Administrator Placówki',
      teacher: params.subjectsTaught?.length ? `Nauczyciel (${params.subjectsTaught.join(', ')})` : 'Nauczyciel',
      student: `Uczeń kl. ${params.className || '3A'}`,
      parent: `Rodzic ucznia ${params.name}`,
    };

    const newUser: User = {
      id: userId,
      name: params.name.trim(),
      email: params.email.trim(),
      password: params.password || 'haslo123',
      role: params.role,
      roleTitle: roleTitles[params.role],
      className: params.className,
      studentId,
      subjectsTaught: params.subjectsTaught,
      createdAt: new Date().toISOString().split('T')[0],
      avatar: params.role === 'admin'
        ? 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=256&q=80'
        : params.role === 'teacher'
        ? 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=256&q=80'
        : 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=256&q=80',
    };

    setUsers(prev => [newUser, ...prev]);
    return newUser;
  };

  const updateUserByAdmin = (id: string, updated: Partial<User>) => {
    setUsers(prev => prev.map(u => (u.id === id ? { ...u, ...updated } : u)));
    if (currentUser?.id === id) {
      setCurrentUser(prev => prev ? { ...prev, ...updated } : null);
    }
  };

  const deleteUserByAdmin = (id: string) => {
    // Głównego administratora nie można usunąć z poziomu aplikacji.
    const target = users.find(u => u.id === id);
    if (!target || target.role === 'admin') return;
    setUsers(prev => prev.filter(u => u.id !== id));
  };

  const resetSystem = () => {
    localStorage.clear();
    setSystemConfig({ ...DEFAULT_SYSTEM_CONFIG, isInitialized: false });
    setUsers(INITIAL_USERS);
    setGrades(INITIAL_GRADES);
    setStudents(INITIAL_STUDENTS);
    setAttendance(INITIAL_ATTENDANCE);
    setTimetable(INITIAL_TIMETABLE);
    setMessages(INITIAL_MESSAGES);
    setAnnouncements(INITIAL_ANNOUNCEMENTS);
    setHomework(INITIAL_HOMEWORK);
    setCurrentUser(null);
  };

  const loginAs = (userId: string) => {
    const user = users.find(u => u.id === userId);
    if (user) {
      setCurrentUser(user);
    }
  };

  const loginWithCredentials = (email: string, password?: string): boolean => {
    const cleaned = email.trim().toLowerCase();
    const match = users.find(
      u => u.email.toLowerCase() === cleaned || u.name.toLowerCase() === cleaned
    );

    if (match) {
      if (password && match.password && match.password !== password) {
        return false;
      }
      setCurrentUser(match);
      return true;
    }

    // Support shortcut usernames like 'admin', 'nauczyciel', 'uczen', 'rodzic'
    const shortcutMap: Record<string, string> = {
      admin: 'user_admin',
      administrator: 'user_admin',
      nauczyciel: 'user_teacher',
      teacher: 'user_teacher',
      uczen: 'user_student',
      student: 'user_student',
      rodzic: 'user_parent',
      parent: 'user_parent',
    };
    const targetId = shortcutMap[cleaned];
    if (targetId) {
      const shortcutUser = users.find(u => u.id === targetId);
      if (shortcutUser) {
        setCurrentUser(shortcutUser);
        return true;
      }
    }
    return false;
  };

  const logout = () => {
    setCurrentUser(null);
  };

  // Grade actions
  const addGrade = (newGrade: Omit<Grade, 'id'>) => {
    const id = 'gr_' + Date.now() + Math.random().toString(36).substring(2, 6);
    setGrades(prev => [
      {
        ...newGrade,
        id,
      },
      ...prev,
    ]);
  };

  const updateGrade = (id: string, updated: Partial<Grade>) => {
    setGrades(prev => prev.map(g => (g.id === id ? { ...g, ...updated } : g)));
  };

  const deleteGrade = (id: string) => {
    setGrades(prev => prev.filter(g => g.id !== id));
  };

  const getSubjectAverage = (studentId: string, subjectId: string, semester?: 1 | 2): number | null => {
    const filtered = grades.filter(
      g =>
        g.studentId === studentId &&
        g.subjectId === subjectId &&
        g.countToAverage &&
        (semester ? g.semester === semester : true)
    );

    if (filtered.length === 0) return null;

    let totalWeight = 0;
    let weightedSum = 0;

    for (const g of filtered) {
      weightedSum += g.numericValue * g.weight;
      totalWeight += g.weight;
    }

    if (totalWeight === 0) return null;
    return Number((weightedSum / totalWeight).toFixed(2));
  };

  const getOverallAverage = (studentId: string, semester?: 1 | 2): number | null => {
    const studentGrades = grades.filter(
      g => g.studentId === studentId && g.countToAverage && (semester ? g.semester === semester : true)
    );
    if (studentGrades.length === 0) return null;

    let totalWeight = 0;
    let weightedSum = 0;

    for (const g of studentGrades) {
      weightedSum += g.numericValue * g.weight;
      totalWeight += g.weight;
    }

    if (totalWeight === 0) return null;
    return Number((weightedSum / totalWeight).toFixed(2));
  };

  // Attendance actions
  const recordAttendance = (records: Array<Omit<AttendanceRecord, 'id'>>) => {
    const newRecords: AttendanceRecord[] = records.map((r, index) => ({
      ...r,
      id: 'att_' + Date.now() + '_' + index,
    }));

    // Replace if record for same student, date and lesson hour exists
    setAttendance(prev => {
      const updated = [...prev];
      for (const rec of newRecords) {
        const existingIdx = updated.findIndex(
          p => p.studentId === rec.studentId && p.date === rec.date && p.lessonHour === rec.lessonHour
        );
        if (existingIdx !== -1) {
          updated[existingIdx] = rec;
        } else {
          updated.push(rec);
        }
      }
      return updated;
    });
  };

  const requestExcuse = (recordId: string, reason: string) => {
    setAttendance(prev =>
      prev.map(r => (r.id === recordId ? { ...r, excuseReason: reason, excuseStatus: 'pending' } : r))
    );
  };

  const respondToExcuse = (recordId: string, status: 'accepted' | 'rejected') => {
    setAttendance(prev =>
      prev.map(r => {
        if (r.id === recordId) {
          return {
            ...r,
            excuseStatus: status,
            status: status === 'accepted' ? 'usprawiedliwiony' : 'nieobecny',
          };
        }
        return r;
      })
    );
  };

  const getAttendanceStats = (studentId: string): AttendanceStats => {
    const records = attendance.filter(r => r.studentId === studentId);
    const total = records.length;
    if (total === 0) {
      return { total: 0, present: 0, excused: 0, unexcused: 0, late: 0, rate: 100 };
    }

    const present = records.filter(r => r.status === 'obecny').length;
    const excused = records.filter(r => r.status === 'usprawiedliwiony').length;
    const unexcused = records.filter(r => r.status === 'nieobecny').length;
    const late = records.filter(r => r.status === 'spozniony').length;

    // In Polish schools: obecny and spóźniony and usprawiedliwiony count towards positive attendance in various formulas;
    // Standard attendance % = (obecny + spozniony + usprawiedliwiony) / total * 100
    // OR unexcused only deducts. Let's calculate:
    const presentAndExcused = present + late + excused;
    const rate = Number(((presentAndExcused / total) * 100).toFixed(1));

    return { total, present, excused, unexcused, late, rate };
  };

  const saveClassAttendanceRollCall = (params: {
    className: string;
    date: string;
    lessonHour: number;
    subjectName: string;
    teacherName?: string;
    records: Array<{ studentId: string; status: AttendanceStatus; note?: string }>;
  }) => {
    setAttendance(prev => {
      const updated = [...prev];
      for (const item of params.records) {
        const existingIdx = updated.findIndex(
          r => r.studentId === item.studentId && r.date === params.date && r.lessonHour === params.lessonHour
        );
        if (existingIdx !== -1) {
          updated[existingIdx] = {
            ...updated[existingIdx],
            status: item.status,
            subjectName: params.subjectName,
            teacherName: params.teacherName || updated[existingIdx].teacherName,
            excuseReason: item.note || updated[existingIdx].excuseReason,
          };
        } else {
          updated.push({
            id: 'att_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6),
            studentId: item.studentId,
            date: params.date,
            lessonHour: params.lessonHour,
            subjectName: params.subjectName,
            status: item.status,
            teacherName: params.teacherName,
            excuseReason: item.note,
          });
        }
      }
      return updated;
    });
  };

  // Behavior & Neuroshima Points
  const addBehaviorPoint = (point: Omit<BehaviorPoint, 'id'>) => {
    const id = 'bp_' + Date.now();
    setBehaviorPoints(prev => [{ ...point, id }, ...prev]);
  };

  const deleteBehaviorPoint = (id: string) => {
    setBehaviorPoints(prev => prev.filter(p => p.id !== id));
  };

  const addLessonPlusMinus = (pm: Omit<LessonPlusMinus, 'id'>) => {
    const id = 'pm_' + Date.now();
    setLessonPlusMinus(prev => [{ ...pm, id }, ...prev]);
  };

  const deleteLessonPlusMinus = (id: string) => {
    setLessonPlusMinus(prev => prev.filter(pm => pm.id !== id));
  };

  const getBehaviorStats = (studentId: string): BehaviorStats => {
    const pts = behaviorPoints.filter(p => p.studentId === studentId);
    const pms = lessonPlusMinus.filter(pm => pm.studentId === studentId);

    const basePoints = 100;
    const positiveTotal = pts.filter(p => p.points > 0).reduce((acc, p) => acc + p.points, 0);
    const negativeTotal = pts.filter(p => p.points < 0).reduce((acc, p) => acc + Math.abs(p.points), 0);
    const plusCount = pms.filter(pm => pm.type === 'plus').length;
    const minusCount = pms.filter(pm => pm.type === 'minus').length;

    // Standard scoring: base 100 + positive - negative + (2 per plus) - (2 per minus)
    const finalPoints = basePoints + positiveTotal - negativeTotal + (plusCount * 2) - (minusCount * 2);

    let rankTitle = 'Dobre';
    let rankBadgeColor = 'bg-emerald-100 text-emerald-900 border-emerald-300';

    if (finalPoints >= 180) {
      rankTitle = 'Wzorowe';
      rankBadgeColor = 'bg-amber-100 text-amber-900 border-amber-300 ring-1 ring-amber-400';
    } else if (finalPoints >= 140) {
      rankTitle = 'Bardzo dobre';
      rankBadgeColor = 'bg-indigo-100 text-indigo-900 border-indigo-300';
    } else if (finalPoints >= 100) {
      rankTitle = 'Dobre';
      rankBadgeColor = 'bg-emerald-100 text-emerald-900 border-emerald-300';
    } else if (finalPoints >= 60) {
      rankTitle = 'Poprawne';
      rankBadgeColor = 'bg-blue-100 text-blue-900 border-blue-300';
    } else if (finalPoints >= 20) {
      rankTitle = 'Nieodpowiednie';
      rankBadgeColor = 'bg-orange-100 text-orange-900 border-orange-300';
    } else {
      rankTitle = 'Naganne';
      rankBadgeColor = 'bg-red-100 text-red-900 border-red-300';
    }

    return {
      basePoints,
      positiveTotal,
      negativeTotal,
      finalPoints,
      rankTitle,
      rankBadgeColor,
      plusCount,
      minusCount,
    };
  };

  // Timetable
  const addLesson = (lesson: Omit<TimetableLesson, 'id'>) => {
    const id = 'tt_' + Date.now();
    setTimetable(prev => [...prev, { ...lesson, id }]);
  };

  const updateLesson = (id: string, updated: Partial<TimetableLesson>) => {
    setTimetable(prev => prev.map(l => (l.id === id ? { ...l, ...updated } : l)));
  };

  const deleteLesson = (id: string) => {
    setTimetable(prev => prev.filter(l => l.id !== id));
  };

  // Messages
  const sendMessage = (msg: { recipientId: string; recipientName: string; subject: string; content: string }) => {
    if (!currentUser) return;
    const now = new Date();
    const dateStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(
      now.getDate()
    ).padStart(2, '0')} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

    const newMsg: Message = {
      id: 'msg_' + Date.now(),
      senderId: currentUser.id,
      senderName: currentUser.name,
      senderRole: currentUser.roleTitle,
      recipientId: msg.recipientId,
      recipientName: msg.recipientName,
      subject: msg.subject,
      content: msg.content,
      date: dateStr,
      isRead: false,
    };
    setMessages(prev => [newMsg, ...prev]);
  };

  const markMessageAsRead = (id: string) => {
    setMessages(prev => prev.map(m => (m.id === id ? { ...m, isRead: true } : m)));
  };

  const toggleMessageStar = (id: string) => {
    setMessages(prev => prev.map(m => (m.id === id ? { ...m, isStarred: !m.isStarred } : m)));
  };

  const deleteMessage = (id: string) => {
    setMessages(prev => prev.filter(m => m.id !== id));
  };

  const unreadCount = currentUser
    ? messages.filter(
        m => (m.recipientId === currentUser.id || m.recipientId === 'all') && !m.isRead
      ).length
    : 0;

  // Announcements
  const addAnnouncement = (ann: Omit<Announcement, 'id' | 'date'>) => {
    const now = new Date();
    const dateStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(
      now.getDate()
    ).padStart(2, '0')}`;
    const id = 'ann_' + Date.now();
    setAnnouncements(prev => [{ ...ann, id, date: dateStr }, ...prev]);
  };

  const deleteAnnouncement = (id: string) => {
    setAnnouncements(prev => prev.filter(a => a.id !== id));
  };

  // Homework
  const addHomework = (hw: Omit<HomeworkTask, 'id'>) => {
    const id = 'hw_' + Date.now();
    setHomework(prev => [{ ...hw, id }, ...prev]);
  };

  const deleteHomework = (id: string) => {
    setHomework(prev => prev.filter(h => h.id !== id));
  };

  // Student management
  const addStudent = (st: Omit<Student, 'id'>) => {
    const id = 'st_' + Date.now();
    setStudents(prev => [...prev, { ...st, id }]);
  };

  const updateStudent = (id: string, updated: Partial<Student>) => {
    setStudents(prev => prev.map(s => (s.id === id ? { ...s, ...updated } : s)));
  };

  const deleteStudent = (id: string) => {
    setStudents(prev => prev.filter(s => s.id !== id));
  };

  const submitPasswordResetRequest = (data: {
    fullName: string;
    emailOrLogin: string;
    roleCandidate?: 'uczen' | 'nauczyciel' | 'rodzic';
    className?: string;
    reasonNote?: string;
  }) => {
    const reqId = 'RST-' + Math.floor(1000 + Math.random() * 9000);
    const nowStr = new Date().toISOString().replace('T', ' ').slice(0, 16);
    const newReq: PasswordResetRequest = {
      id: reqId,
      fullName: data.fullName.trim(),
      emailOrLogin: data.emailOrLogin.trim().toLowerCase(),
      roleCandidate: data.roleCandidate || 'uczen',
      className: data.className?.trim(),
      requestDate: nowStr,
      status: 'oczekujące',
      reasonNote: data.reasonNote?.trim() || 'Prośba o nadanie / zresetowanie hasła dostępowego.',
    };

    setPasswordResetRequests(prev => [newReq, ...prev]);

    // Send alert message to admin
    const admin = users.find(u => u.role === 'admin') || currentUser;
    if (admin) {
      const alertMsg: Message = {
        id: 'msg_req_' + Date.now(),
        senderId: 'system_reset',
        senderName: 'System Resetu Haseł',
        senderRole: 'Formularz Zgłoszeniowy',
        recipientId: admin.id,
        recipientName: admin.name,
        subject: `[Prośba o hasło #${reqId}] ${data.fullName} (${data.emailOrLogin})`,
        content: `Użytkownik złożył wniosek o reset / wydanie hasła:\n\n- Imię i nazwisko: ${data.fullName}\n- E-mail / Login: ${data.emailOrLogin}\n- Rola: ${data.roleCandidate || 'uczeń'}${data.className ? ` (Oddział: ${data.className})` : ''}\n- Powód: ${data.reasonNote || 'Brak uzasadnienia'}\n- Kod zgłoszenia: #${reqId}\n\nPrzejdź do Panelu Administratora (zakładka "Zgłoszenia o reset hasła"), aby wygenerować nowe hasło i odesłać odpowiedź.`,
        date: nowStr,
        isRead: false,
        isStarred: true,
      };
      setMessages(prev => [alertMsg, ...prev]);
    }

    return {
      success: true,
      message: `Zgłoszenie #${reqId} zostało pomyślnie wysłane do Administratora Szkoły. Możesz sprawdzić status i odebrać nowe hasło w zakładce "Sprawdź status zgłoszenia".`,
      requestId: reqId,
    };
  };

  const resolvePasswordResetRequest = (
    requestId: string,
    params: { newPassword: string; adminResponse: string; approved: boolean }
  ) => {
    const nowStr = new Date().toISOString().replace('T', ' ').slice(0, 16);
    setPasswordResetRequests(prev =>
      prev.map(req => {
        if (req.id !== requestId) return req;
        return {
          ...req,
          status: params.approved ? 'zrealizowane' : 'odrzucone',
          adminResponse: params.adminResponse,
          newTemporaryPassword: params.approved ? params.newPassword : undefined,
          resolvedAt: nowStr,
          resolvedBy: currentUser?.name || 'Administrator Placówki',
        };
      })
    );

    if (params.approved) {
      const targetReq = passwordResetRequests.find(r => r.id === requestId);
      if (targetReq) {
        setUsers(prevUsers =>
          prevUsers.map(u => {
            if (u.email.toLowerCase() === targetReq.emailOrLogin.toLowerCase()) {
              return { ...u, password: params.newPassword };
            }
            return u;
          })
        );
      }
    }
  };

  const resetToDefaults = () => {
    resetSystemToInitialWizard();
  };

  return (
    <JournalContext.Provider
      value={{
        currentUser,
        users,
        systemConfig,
        initializeSystem,
        updateSystemConfig,
        resetSystemToInitialWizard,
        createUserByAdmin,
        updateUserByAdmin,
        deleteUserByAdmin,
        loginAs,
        loginWithCredentials,
        logout,
        resetSystem,
        grades,
        subjects,
        students,
        attendance,
        timetable,
        messages,
        announcements,
        homework,
        behaviorPoints,
        lessonPlusMinus,
        addBehaviorPoint,
        deleteBehaviorPoint,
        addLessonPlusMinus,
        deleteLessonPlusMinus,
        getBehaviorStats,
        addGrade,
        updateGrade,
        deleteGrade,
        getSubjectAverage,
        getOverallAverage,
        recordAttendance,
        saveClassAttendanceRollCall,
        requestExcuse,
        respondToExcuse,
        getAttendanceStats,
        addLesson,
        updateLesson,
        deleteLesson,
        sendMessage,
        markMessageAsRead,
        toggleMessageStar,
        deleteMessage,
        unreadCount,
        addAnnouncement,
        deleteAnnouncement,
        addHomework,
        deleteHomework,
        addStudent,
        updateStudent,
        deleteStudent,
        passwordResetRequests,
        submitPasswordResetRequest,
        resolvePasswordResetRequest,
        resetToDefaults,
      }}
    >
      {children}
    </JournalContext.Provider>
  );
};

export const useJournal = () => {
  const context = useContext(JournalContext);
  if (!context) {
    throw new Error('useJournal must be used within a JournalProvider');
  }
  return context;
};
