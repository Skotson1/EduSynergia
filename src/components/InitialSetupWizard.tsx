import React, { useState } from 'react';
import { useJournal } from '../context/JournalContext';
import {
  BookOpen,
  ShieldCheck,
  Building2,
  Calendar,
  Lock,
  Mail,
  User,
  ArrowRight,
  Sparkles,
  CheckCircle2,
  Check,
  Eye,
  EyeOff,
  MapPin,
  School,
  Award,
  AlertCircle,
  HelpCircle,
  Download,
} from 'lucide-react';

export const InitialSetupWizard: React.FC = () => {
  const { initializeSystem, systemConfig } = useJournal();

  // School configuration
  const [schoolName, setSchoolName] = useState(systemConfig.schoolName || 'Szkoła Podstawowa nr 4');
  const [schoolCity, setSchoolCity] = useState(systemConfig.schoolCity || 'Warszawa');
  const [academicYear, setAcademicYear] = useState(systemConfig.academicYear || '2025/2026');
  const [semester, setSemester] = useState<1 | 2>(2);

  // Admin configuration (clean for the user to create their own)
  const [adminName, setAdminName] = useState('');
  const [adminEmail, setAdminEmail] = useState('');
  const [adminPassword, setAdminPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // Options: default false (clean mode, no ready-made accounts)
  const [includeDemoClasses, setIncludeDemoClasses] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // Preset schools for quick 1-click selection
  const schoolPresets = [
    { name: 'Szkoła Podstawowa nr 4', city: 'Warszawa' },
    { name: 'Szkoła Podstawowa nr 5 z Oddziałami Sportowymi', city: 'Kraków' },
    { name: 'Zespół Szkolno-Przedszkolny nr 1', city: 'Gdańsk' },
    { name: 'XIV Liceum Ogólnokształcące', city: 'Wrocław' },
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    if (!schoolName.trim()) {
      setErrorMessage('Wprowadź pełną nazwę szkoły.');
      return;
    }
    if (!adminName.trim() || !adminEmail.trim()) {
      setErrorMessage('Wprowadź swoje imię, nazwisko oraz adres e-mail / login Administratora.');
      return;
    }
    if (!adminPassword || adminPassword.length < 4) {
      setErrorMessage('Hasło Administratora musi mieć co najmniej 4 znaki.');
      return;
    }
    if (adminPassword !== confirmPassword) {
      setErrorMessage('Wpisane hasła nie są identyczne.');
      return;
    }

    setIsSubmitting(true);

    const result = await initializeSystem({
      schoolName: schoolName.trim(),
      schoolCity: schoolCity.trim() || 'Warszawa',
      academicYear: academicYear.trim() || '2025/2026',
      semester,
      adminName: adminName.trim(),
      adminEmail: adminEmail.trim(),
      adminPassword,
        includeDemoData: includeDemoClasses,
    });
    if (!result.success) {
      setIsSubmitting(false);
      setErrorMessage(result.message || 'Nie udało się zapisać konfiguracji. Spróbuj ponownie.');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#09182b] via-[#102a4a] to-[#1a365d] text-slate-100 flex flex-col justify-between p-4 sm:p-6 lg:p-8 font-sans selection:bg-amber-400 selection:text-slate-900">
      {/* Top Banner */}
      <header className="max-w-3xl w-full mx-auto text-center pt-3 pb-6">
        <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-amber-400/15 border border-amber-300/30 text-amber-300 text-xs font-bold tracking-wide uppercase shadow-sm mb-3">
          <Sparkles className="w-3.5 h-3.5 text-amber-300" />
          <span>Pierwsze Uruchomienie · Jednorazowa Konfiguracja</span>
        </div>
        <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight text-white">
          Witaj w Dzienniku Szkolnym EduSynergia
        </h1>
        <p className="text-xs sm:text-sm text-slate-300 mt-2 max-w-xl mx-auto leading-relaxed">
          Skonfiguruj nazwę swojej placówki oświatowej oraz utwórz konto Głównego Administratora. 
          Rejestracja publiczna zostanie zablokowana — tylko Administrator będzie mógł tworzyć konta dla uczniów i nauczycieli.
        </p>
      </header>

      {/* Main Wizard Card */}
      <main className="max-w-3xl w-full mx-auto bg-white text-slate-900 rounded-2xl shadow-2xl border border-slate-200/80 overflow-hidden mb-8">
        {/* Wizard Header Bar */}
        <div className="bg-[#1a365d] text-white p-6 border-b border-[#2a4365] flex items-center justify-between">
          <div className="flex items-center space-x-3.5">
            <div className="w-12 h-12 rounded-xl bg-amber-400/20 border border-amber-300/30 flex items-center justify-center text-amber-300 shadow-inner">
              <School className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-lg font-bold">Kreator Inicjalizacji Dziennika</h2>
              <p className="text-xs text-amber-200/80 font-medium">
                Profil placówki & Konto nadrzędne
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <a
              href="/edusynergia-projekt.zip"
              download="edusynergia-caly-projekt.zip"
              className="flex items-center space-x-1.5 bg-emerald-600 hover:bg-emerald-500 text-white px-3 py-1.5 rounded-lg border border-emerald-400/40 text-xs font-bold shadow-xs transition-colors cursor-pointer"
              title="Pobierz kompletne archiwum z projektem (.ZIP)"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Pobierz projekt (.ZIP)</span>
            </a>
            <div className="hidden sm:flex items-center space-x-1.5 bg-white/10 px-3 py-1.5 rounded-lg border border-white/15 text-xs text-amber-200 font-semibold">
              <ShieldCheck className="w-4 h-4" />
              <span>Konto Głównego Administratora</span>
            </div>
          </div>
        </div>

        {/* Wizard Form */}
        <form onSubmit={handleSubmit} className="p-6 sm:p-8 space-y-6">
          {errorMessage && (
            <div className="p-3.5 bg-red-50 text-red-700 text-xs rounded-xl border border-red-200 flex items-start space-x-2.5">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span className="font-medium">{errorMessage}</span>
            </div>
          )}

          {/* SECTION 1: DANE SZKOŁY */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2 pb-2 border-b border-slate-100">
              <Building2 className="w-4 h-4 text-blue-700" />
              <h3 className="font-bold text-sm text-slate-900 uppercase tracking-wider">
                1. Dane Szkoły / Placówki Oświatowej
              </h3>
            </div>

            {/* Quick Presets */}
            <div>
              <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                Szybki wybór przykładowej szkoły:
              </div>
              <div className="flex flex-wrap gap-1.5">
                {schoolPresets.map((preset, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => {
                      setSchoolName(preset.name);
                      setSchoolCity(preset.city);
                    }}
                    className={`text-[11px] px-2.5 py-1 rounded-lg border transition-all text-left ${
                      schoolName === preset.name
                        ? 'bg-blue-50 border-blue-600 text-blue-900 font-bold'
                        : 'border-slate-200 bg-slate-50 text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    {preset.city} · {preset.name.split(' ')[0]} {preset.name.split(' ')[1]}...
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="sm:col-span-2">
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Pełna nazwa szkoły <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={schoolName}
                  onChange={e => setSchoolName(e.target.value)}
                  placeholder="np. XIV Liceum Ogólnokształcące im. Stanisława Staszica"
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#1a365d] focus:outline-none bg-slate-50 font-semibold text-slate-900"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Miejscowość / Miasto <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <MapPin className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    required
                    value={schoolCity}
                    onChange={e => setSchoolCity(e.target.value)}
                    placeholder="np. Warszawa"
                    className="w-full pl-8 pr-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#1a365d] focus:outline-none bg-slate-50 text-slate-900 font-medium"
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Rok szkolny
                </label>
                <input
                  type="text"
                  required
                  value={academicYear}
                  onChange={e => setAcademicYear(e.target.value)}
                  placeholder="2025/2026"
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#1a365d] focus:outline-none bg-slate-50 text-slate-900 font-medium"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Bieżący semestr
                </label>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <button
                    type="button"
                    onClick={() => setSemester(1)}
                    className={`py-2 rounded-lg border font-bold transition-all ${
                      semester === 1
                        ? 'bg-blue-50 border-blue-600 text-blue-900 shadow-2xs'
                        : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    Semestr I
                  </button>
                  <button
                    type="button"
                    onClick={() => setSemester(2)}
                    className={`py-2 rounded-lg border font-bold transition-all ${
                      semester === 2
                        ? 'bg-blue-50 border-blue-600 text-blue-900 shadow-2xs'
                        : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    Semestr II (bieżący)
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* SECTION 2: GŁÓWNY ADMINISTRATOR */}
          <div className="space-y-4 pt-2">
            <div className="flex items-center space-x-2 pb-2 border-b border-slate-100">
              <ShieldCheck className="w-4 h-4 text-purple-700" />
              <h3 className="font-bold text-sm text-slate-900 uppercase tracking-wider">
                2. Konto Głównego Administratora (Dyrektor Szkoły)
              </h3>
            </div>

            <div className="p-3 bg-purple-50/60 border border-purple-200 rounded-xl text-xs text-purple-900 flex items-start space-x-2">
              <Award className="w-4 h-4 shrink-0 text-purple-700 mt-0.5" />
              <span>
                To konto będzie miało pełne uprawnienia do zarządzania szkołą. <strong>Zwykła rejestracja jest wyłączona</strong> — tylko to konto Administratora będzie mogło dodawać nowych uczniów, rodziców i nauczycieli.
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Imię i nazwisko Administratora <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <User className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    required
                    value={adminName}
                    onChange={e => setAdminName(e.target.value)}
                    placeholder="np. dr Janusz Wiśniewski"
                    className="w-full pl-8 pr-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#1a365d] focus:outline-none bg-slate-50 font-semibold text-slate-900"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Adres e-mail / Login Administratora <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <Mail className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    required
                    value={adminEmail}
                    onChange={e => setAdminEmail(e.target.value)}
                    placeholder="admin@szkola.edu.pl"
                    className="w-full pl-8 pr-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#1a365d] focus:outline-none bg-slate-50 font-semibold text-slate-900"
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Hasło Administratora <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <Lock className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={adminPassword}
                    onChange={e => setAdminPassword(e.target.value)}
                    placeholder="Wpisz hasło..."
                    className="w-full pl-8 pr-10 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#1a365d] focus:outline-none bg-slate-50 font-medium text-slate-900"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Powtórz hasło <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <Lock className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={confirmPassword}
                    onChange={e => setConfirmPassword(e.target.value)}
                    placeholder="Powtórz hasło..."
                    className="w-full pl-8 pr-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#1a365d] focus:outline-none bg-slate-50 font-medium text-slate-900"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* SECTION 3: TRYB CZYSTY BEZ GOTOWYCH KONT */}
          <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-3">
            <div className="flex items-center space-x-2 text-xs font-bold text-slate-800 uppercase tracking-wide">
              <Sparkles className="w-4 h-4 text-amber-500" />
              <span>3. Przygotowanie Dziennika do Pracy i Zabawy</span>
            </div>

            <div className="p-3 bg-white rounded-lg border border-slate-200 text-xs text-slate-600 space-y-1.5">
              <div className="font-bold text-slate-800 flex items-center space-x-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                <span>Tryb czysty: zero gotowych kont (Zalecany)</span>
              </div>
              <p className="text-[11px] leading-relaxed text-slate-500">
                Po utworzeniu konta Administratora dziennik uruchomi się w stanie czystym. Samodzielnie utworzysz klasy (np. <strong>klasa 4</strong>, <strong>klasa 5</strong>), dodasz uczniów i ułożysz swój własny plan lekcji (<strong>sale 1-4</strong>). Samodzielna rejestracja z zewnątrz jest wyłączona.
              </p>
            </div>

            <label className="flex items-start space-x-3 cursor-pointer pt-1">
              <input
                type="checkbox"
                checked={includeDemoClasses}
                onChange={e => setIncludeDemoClasses(e.target.checked)}
                className="mt-1 rounded border-slate-300 text-[#1a365d] focus:ring-blue-500"
              />
              <div className="text-xs">
                <span className="font-semibold text-slate-700">
                  (Opcjonalnie) Załaduj przykładowe dane demonstracyjne (klasa 3A)
                </span>
                <p className="text-[10px] text-slate-400 mt-0.5">
                  Pozostaw odznaczone, aby rozpocząć całkowicie od zera i samemu stworzyć wszystkie konta i plan lekcji.
                </p>
              </div>
            </label>
          </div>

          {/* Submit Action */}
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-3.5 px-6 bg-gradient-to-r from-[#1a365d] to-[#2b5384] hover:from-[#152c4d] hover:to-[#224268] text-white font-bold text-sm rounded-xl transition-all shadow-md flex items-center justify-center space-x-2 cursor-pointer active:scale-98 disabled:opacity-70"
          >
            {isSubmitting ? (
              <span className="flex items-center space-x-2">
                <CheckCircle2 className="w-4 h-4 animate-spin text-amber-300" />
                <span>Inicjalizowanie systemu dziennika...</span>
              </span>
            ) : (
              <>
                <Check className="w-4 h-4 text-amber-300" />
                <span>Utwórz Szkołę, Zapisz Administratora i Uruchom Dziennik</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>
      </main>

      {/* Footer */}
      <footer className="text-center text-xs text-slate-400 py-3 flex flex-col sm:flex-row items-center justify-center gap-2">
        <span>Dziennik Szkolny EduSynergia © 2026 · Bezpieczny system e-dziennika</span>
        <span className="hidden sm:inline">·</span>
        <a
          href="/edusynergia-projekt.zip"
          download="edusynergia-caly-projekt.zip"
          className="text-emerald-400 hover:text-emerald-300 font-bold inline-flex items-center space-x-1 cursor-pointer"
        >
          <Download className="w-3.5 h-3.5" />
          <span>Pobierz cały projekt (.ZIP)</span>
        </a>
      </footer>
    </div>
  );
};
