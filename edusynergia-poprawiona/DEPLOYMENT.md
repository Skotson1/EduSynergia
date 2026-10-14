# Instrukcja Wdrożenia Strony do Internetu – EduSynergia

Twoja strona jest już w 100% przygotowana do działania w internecie i pomyślnie się buduje (`npm run build`).

---

## 1. Dostęp natychmiastowy (Już działa na żywo!)
Aplikacja jest już uruchomiona w chmurze Google Cloud Run i ma publiczny adres WWW:
- **Publiczny adres aplikacji**: Sprawdź przycisk **Share** / udostępnij w prawym górnym rogu panelu AI Studio lub skopiuj wygenerowany link produkcyjny. Każdy, komu wyślesz ten link, może natychmiast otworzyć dziennik na komputerze lub telefonie!

---

## 2. Wdrożenie na Vercel (Najszybsza darmowa metoda)
1. Wejdź na stronę [vercel.com](https://vercel.com) i zaloguj się (np. przez GitHub / Google).
2. Kliknij **Add New** -> **Project**.
3. Zaimportuj repozytorium z kodem (lub przeciągnij folder projektu).
4. Vercel automatycznie wykryje Vite:
   - **Framework Preset**: `Vite`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
5. Kliknij **Deploy**. W 30 sekund otrzymasz darmową domenę z certyfikatem SSL `https://twoja-nazwa.vercel.app`.

---

## 3. Wdrożenie na Netlify (Metoda przeciągnij i upuść - 10 sekund)
1. Uruchom polecenie `npm run build` – wygeneruje ono gotowy folder `dist`.
2. Zaloguj się na [netlify.com](https://netlify.com).
3. Przejdź do zakładki **Sites** i przeciągnij folder `dist` w wyznaczone pole.
4. Twoja strona jest natychmiast w sieci z darmowym adresem `https://twoja-nazwa.netlify.app`.

---

## 4. Wdrożenie na GitHub Pages
1. W pliku `vite.config.ts` ustaw `base: './'` (dla ścieżek względnych).
2. Wypchnij projekt na GitHub (`git push`).
3. W ustawieniach repozytorium (**Settings** -> **Pages**) wybierz jako źródło gałąź z folderem `dist` lub skonfiguruj GitHub Actions dla Vite.

---

## 5. Działanie offline i na telefonach (PWA / Mobile)
Strona posiada responsywny interfejs, favicon oraz meta-tagi przystosowane do urządzeń mobilnych. Użytkownicy na telefonach mogą kliknąć w przeglądarce **"Dodaj do ekranu początkowego"** (Add to Home Screen) i używać dziennika jak natywnej aplikacji!
