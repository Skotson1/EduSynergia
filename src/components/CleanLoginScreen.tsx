import React, { useState } from 'react';
import { useJournal } from '../context/JournalContext';
import {
  BookOpen,
  Lock,
  Mail,
  ArrowRight,
  Eye,
  EyeOff,
  AlertCircle,
  CheckCircle2,
  Shield,
  School,
  GraduationCap,
  Sparkles,
  Info,
  ChevronDown,
  ChevronUp,
  X,
  Send,
  KeyRound,
  Search,
  Download,
} from 'lucide-react';

interface CleanLoginScreenProps {
  onSuccess?: () => void;
}

export const CleanLoginScreen: React.FC<CleanLoginScreenProps> = ({ onSuccess }) => {
  const {
    loginWithCredentials,
    systemConfig,
    users,
    passwordResetRequests,
    submitPasswordResetRequest,
  } = useJournal();

  // Login form state
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [showLoginPassword, setShowLoginPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [loginError, setLoginError] = useState('');
  const [loginSuccess, setLoginSuccess] = useState(false);

  // Helper toggle
  const [showHelperInfo, setShowHelperInfo] = useState(false);

  // Password reset request modal
  const [resetModalOpen, setResetModalOpen] = useState(false);
  const [resetModalTab, setResetModalTab] = useState<'submit' | 'status'>('submit');
  const [reqFullName, setReqFullName] = useState('');
  const [reqEmail, setReqEmail] = useState('');
  const [reqRole, setReqRole] = useState<'uczen' | 'nauczyciel' | 'rodzic'>('uczen');
  const [reqClass, setReqClass] = useState('Klasa 4');
  const [reqReason, setReqReason] = useState('');
  const [submitResult, setSubmitResult] = useState<{ message: string; id: string } | null>(null);

  // Status check tab state
  const [statusSearchQuery, setStatusSearchQuery] = useState('');
  const [searchedRequest, setSearchedRequest] = useState<any | null>(null);
  const [statusError, setStatusError] = useState('');

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError('');

    if (!loginEmail.trim()) {
      setLoginError('Wprowadź adres e-mail lub identyfikator użytkownika.');
      return;
    }
    if (!loginPassword) {
      setLoginError('Wprowadź hasło dostępowe.');
      return;
    }

    const success = loginWithCredentials(loginEmail.trim(), loginPassword);
    if (success) {
      setLoginSuccess(true);
      setTimeout(() => {
        if (onSuccess) onSuccess();
      }, 350);
    } else {
      setLoginError(
        'Nieprawidłowy adres e-mail lub hasło. Samodzielna rejestracja jest wyłączona — konta są wydawane i zarządzane wyłącznie przez Administratora Szkoły.'
      );
    }
  };

  const handleFillLogin = (email: string) => {
    setLoginEmail(email);
    setLoginError('');
  };

  const handleResetSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!reqFullName.trim() || !reqEmail.trim()) return;

    const res = submitPasswordResetRequest({
      fullName: reqFullName,
      emailOrLogin: reqEmail,
      roleCandidate: reqRole,
      className: reqClass,
      reasonNote: reqReason,
    });

    setSubmitResult({ message: res.message, id: res.requestId });
    setStatusSearchQuery(reqEmail.trim());
    setReqFullName('');
    setReqReason('');
  };

  const handleCheckStatus = (e: React.FormEvent) => {
    e.preventDefault();
    setStatusError('');
    setSearchedRequest(null);

    const query = statusSearchQuery.trim().toLowerCase();
    if (!query) {
      setStatusError('Wpisz adres e-mail lub kod wniosku (np. RST-1234).');
      return;
    }

    const match = passwordResetRequests.find(
      r =>
        r.emailOrLogin.toLowerCase() === query ||
        r.id.toLowerCase() === query ||
        r.id.toLowerCase() === ('#' + query)
    );

    if (match) {
      setSearchedRequest(match);
    } else {
      setStatusError('Nie znaleziono zgłoszenia dla podanego adresu e-mail lub kodu.');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#061121] via-[#0c2340] to-[#12365e] text-slate-800 flex flex-col justify-between p-4 sm:p-6 font-sans selection:bg-amber-400 selection:text-slate-900">
      {/* Top Header Badge */}
      <header className="w-full max-w-md mx-auto pt-3 text-center flex flex-col items-center">
        <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-white/10 backdrop-blur-xs border border-white/15 text-amber-300 text-xs font-semibold mb-2 shadow-xs">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Oficjalny Portal Edukacyjny Placówki</span>
        </div>
        <a
          href="/edusynergia-projekt.zip"
          download="edusynergia-caly-projekt.zip"
          className="inline-flex items-center space-x-1.5 px-3 py-1 bg-emerald-600/90 hover:bg-emerald-500 text-white rounded-lg text-xs font-bold border border-emerald-400/40 shadow-xs transition-all hover:scale-[1.02] cursor-pointer mb-2"
          title="Pobierz kompletne archiwum z projektem (.ZIP)"
        >
          <Download className="w-3.5 h-3.5" />
          <span>Pobierz cały projekt (.ZIP)</span>
        </a>
      </header>

      {/* Main Login Card */}
      <main className="w-full max-w-md mx-auto my-auto">
        <div className="bg-white rounded-3xl shadow-2xl border border-white/20 p-6 sm:p-8 backdrop-blur-md">
          {/* Institution Header */}
          <div className="text-center mb-6">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#0b192c] to-[#1e3a8a] text-amber-300 flex items-center justify-center mx-auto mb-3 shadow-lg shadow-blue-900/30 border border-blue-800">
              <BookOpen className="w-8 h-8" />
            </div>

            <div className="flex items-center justify-center space-x-1.5 mb-1">
              <span className="text-2xl font-black tracking-tight text-[#0b192c]">
                EduSynergia
              </span>
              <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-amber-100 text-amber-900 border border-amber-300">
                Dziennik
              </span>
            </div>

            <h2 className="text-sm font-bold text-slate-800 leading-snug">
              {systemConfig.schoolName || 'Elektroniczny Dziennik Lekcyjny'}
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              {systemConfig.schoolCity || 'Polska'} · Rok szkolny {systemConfig.academicYear} (Semestr {systemConfig.semester === 1 ? 'I' : 'II'})
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleLoginSubmit} className="space-y-4">
            {loginError && (
              <div className="p-3.5 bg-rose-50 border border-rose-200 text-rose-800 text-xs rounded-xl flex items-start space-x-2.5 shadow-2xs animate-in fade-in duration-150">
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                <span className="font-medium leading-relaxed">{loginError}</span>
              </div>
            )}

            {loginSuccess && (
              <div className="p-3 bg-emerald-50 text-emerald-800 text-xs rounded-xl border border-emerald-200 flex items-center space-x-2">
                <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
                <span className="font-semibold">Logowanie pomyślne! Trwa otwieranie dziennika...</span>
              </div>
            )}

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Adres e-mail lub login
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  required
                  autoComplete="username"
                  value={loginEmail}
                  onChange={e => setLoginEmail(e.target.value)}
                  placeholder="np. admin@szkola.edu.pl lub login nauczyciela/ucznia"
                  className="w-full pl-9 pr-3 py-2 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-700 focus:border-transparent focus:outline-none bg-slate-50 text-slate-900 font-medium"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Hasło dostępowe
                </label>
                <button
                  type="button"
                  onClick={() => {
                    setResetModalOpen(true);
                    setSubmitResult(null);
                    setSearchedRequest(null);
                  }}
                  className="text-[11px] text-blue-700 hover:underline font-semibold cursor-pointer"
                >
                  Nie pamiętasz hasła?
                </button>
              </div>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type={showLoginPassword ? 'text' : 'password'}
                  required
                  autoComplete="current-password"
                  value={loginPassword}
                  onChange={e => setLoginPassword(e.target.value)}
                  placeholder="Wpisz hasło dostępowe..."
                  className="w-full pl-9 pr-10 py-2 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-700 focus:border-transparent focus:outline-none bg-slate-50 text-slate-900 font-medium"
                />
                <button
                  type="button"
                  onClick={() => setShowLoginPassword(!showLoginPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1 cursor-pointer"
                  title={showLoginPassword ? 'Ukryj hasło' : 'Pokaż hasło'}
                >
                  {showLoginPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between text-xs text-slate-600 pt-0.5">
              <label className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={e => setRememberMe(e.target.checked)}
                  className="rounded border-slate-300 text-blue-700 focus:ring-blue-600"
                />
                <span>Zapamiętaj logowanie</span>
              </label>
            </div>

            <button
              type="submit"
              className="w-full py-2.5 px-4 bg-gradient-to-r from-[#0b192c] to-[#1e3a8a] hover:from-[#091524] hover:to-[#172e6d] text-white text-xs font-bold rounded-xl transition-all flex items-center justify-center space-x-2 shadow-md cursor-pointer active:scale-98"
            >
              <span>Zaloguj się do dziennika</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          {/* Notice about Administrator creating all accounts */}
          <div className="mt-5 p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-600 space-y-1">
            <div className="font-bold text-slate-800 flex items-center space-x-1.5">
              <Shield className="w-3.5 h-3.5 text-blue-700" />
              <span>Autoryzowany dostęp placówki</span>
            </div>
            <p className="text-[11px] leading-relaxed text-slate-500">
              Samodzielna rejestracja jest wyłączona. Wszystkie konta dla uczniów, rodziców i nauczycieli są tworzone i przydzielane wyłącznie przez Administratora Szkoły.
            </p>
          </div>

          {/* Helper Info for logins */}
          <div className="mt-4 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setShowHelperInfo(!showHelperInfo)}
              className="w-full flex items-center justify-between text-[11px] text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
            >
              <div className="flex items-center space-x-1.5">
                <Info className="w-3.5 h-3.5" />
                <span>Informacje o kontach systemowych</span>
              </div>
              {showHelperInfo ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
            </button>

            {showHelperInfo && (
              <div className="mt-2.5 p-3 bg-slate-50 rounded-xl border border-slate-200 text-[11px] text-slate-600 space-y-2">
                {users.length > 0 ? (
                  users.slice(0, 4).map(u => (
                    <div key={u.id} className="flex items-center justify-between py-1 border-b border-slate-200/50 last:border-none">
                      <div>
                        <strong className="text-slate-800">{u.roleTitle || u.role}:</strong>{' '}
                        <code className="bg-slate-200 px-1 rounded text-[10px]">{u.email}</code>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleFillLogin(u.email)}
                        className="px-2 py-0.5 bg-blue-50 text-blue-700 hover:bg-blue-100 border border-blue-200 rounded font-bold text-[10px] cursor-pointer"
                      >
                        Wstaw
                      </button>
                    </div>
                  ))
                ) : (
                  <div className="text-slate-500 italic">
                    Brak kont demonstracyjnych. Dziennik czeka na rejestrację pierwszego Administratora.
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Password Reset Modal */}
      {resetModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full overflow-hidden border border-slate-200 animate-in fade-in zoom-in duration-150">
            {/* Modal Header */}
            <div className="bg-gradient-to-r from-[#0b192c] to-[#1a365d] text-white p-4 sm:p-5 flex items-center justify-between">
              <div className="flex items-center space-x-2.5">
                <div className="w-9 h-9 rounded-xl bg-amber-400/20 border border-amber-300/30 flex items-center justify-center text-amber-300">
                  <KeyRound className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-sm">Zgłoszenie do Administratora o Reset Hasła</h3>
                  <p className="text-[11px] text-amber-200/80">
                    Wysyła wiadomość do skrzynki Administratora z prośbą o nowe hasło
                  </p>
                </div>
              </div>
              <button
                onClick={() => setResetModalOpen(false)}
                className="text-slate-300 hover:text-white p-1 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Tabs */}
            <div className="flex border-b border-slate-200 bg-slate-50 text-xs">
              <button
                onClick={() => setResetModalTab('submit')}
                className={`flex-1 py-2.5 font-bold text-center border-b-2 transition-colors cursor-pointer ${
                  resetModalTab === 'submit'
                    ? 'border-blue-900 text-blue-900 bg-white'
                    : 'border-transparent text-slate-500 hover:text-slate-800'
                }`}
              >
                1. Wyślij prośbę o nowe hasło
              </button>
              <button
                onClick={() => setResetModalTab('status')}
                className={`flex-1 py-2.5 font-bold text-center border-b-2 transition-colors cursor-pointer ${
                  resetModalTab === 'status'
                    ? 'border-blue-900 text-blue-900 bg-white'
                    : 'border-transparent text-slate-500 hover:text-slate-800'
                }`}
              >
                2. Sprawdź status i odbierz hasło
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-5 text-xs text-slate-700">
              {resetModalTab === 'submit' ? (
                submitResult ? (
                  <div className="space-y-4 py-2 text-center">
                    <div className="w-12 h-12 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto border border-emerald-200">
                      <CheckCircle2 className="w-6 h-6" />
                    </div>
                    <div>
                      <h4 className="font-bold text-sm text-slate-900">
                        Zgłoszenie zostało pomyślnie wysłane!
                      </h4>
                      <p className="text-xs text-slate-600 mt-1 max-w-sm mx-auto leading-relaxed">
                        Kod Twojego zgłoszenia to: <strong className="font-mono text-blue-800">{submitResult.id}</strong>.
                        Administrator Szkoły otrzymał powiadomienie w swojej skrzynce. Po zresetowaniu hasła przez Administratora możesz odebrać je w zakładce <strong>"Sprawdź status i odbierz hasło"</strong>.
                      </p>
                    </div>
                    <div className="pt-2">
                      <button
                        type="button"
                        onClick={() => setResetModalTab('status')}
                        className="px-4 py-2 bg-[#1a365d] text-white rounded-xl font-bold text-xs shadow-sm cursor-pointer"
                      >
                        Przejdź do sprawdzania statusu
                      </button>
                    </div>
                  </div>
                ) : (
                  <form onSubmit={handleResetSubmit} className="space-y-3">
                    <p className="text-[11px] text-slate-500 leading-relaxed">
                      Wpisz swoje dane. Wniosek trafi bezpośrednio do Panelu Administratora Placówki, który ustawi dla Ciebie nowe hasło i wyśle odpowiedź.
                    </p>

                    <div>
                      <label className="block font-bold text-slate-700 mb-1">
                        Imię i nazwisko <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        value={reqFullName}
                        onChange={e => setReqFullName(e.target.value)}
                        placeholder="np. Jan Kowalski"
                        className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#1a365d] focus:outline-none"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block font-bold text-slate-700 mb-1">
                          Adres e-mail lub login <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          required
                          value={reqEmail}
                          onChange={e => setReqEmail(e.target.value)}
                          placeholder="np. j.kowalski@szkola.edu.pl"
                          className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#1a365d] focus:outline-none"
                        />
                      </div>

                      <div>
                        <label className="block font-bold text-slate-700 mb-1">
                          Rola w szkole
                        </label>
                        <select
                          value={reqRole}
                          onChange={e => setReqRole(e.target.value as any)}
                          className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#1a365d] focus:outline-none bg-white"
                        >
                          <option value="uczen">Uczeń</option>
                          <option value="nauczyciel">Nauczyciel</option>
                          <option value="rodzic">Rodzic</option>
                        </select>
                      </div>
                    </div>

                    {reqRole === 'uczen' && (
                      <div>
                        <label className="block font-bold text-slate-700 mb-1">
                          Oddział / Klasa (np. Klasa 4, Klasa 5)
                        </label>
                        <input
                          type="text"
                          value={reqClass}
                          onChange={e => setReqClass(e.target.value)}
                          placeholder="np. Klasa 4 lub 5A"
                          className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#1a365d] focus:outline-none"
                        />
                      </div>
                    )}

                    <div>
                      <label className="block font-bold text-slate-700 mb-1">
                        Powód zgłoszenia (krótki opis)
                      </label>
                      <textarea
                        rows={2}
                        value={reqReason}
                        onChange={e => setReqReason(e.target.value)}
                        placeholder="np. Zapomniałem hasła po weekendzie / błąd logowania"
                        className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#1a365d] focus:outline-none"
                      />
                    </div>

                    <div className="pt-2 flex justify-end space-x-2">
                      <button
                        type="button"
                        onClick={() => setResetModalOpen(false)}
                        className="px-3 py-1.5 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 cursor-pointer"
                      >
                        Anuluj
                      </button>
                      <button
                        type="submit"
                        className="px-4 py-2 rounded-lg bg-[#1a365d] hover:bg-[#152c4d] text-white font-bold flex items-center space-x-1.5 shadow-sm cursor-pointer"
                      >
                        <Send className="w-3.5 h-3.5 text-amber-300" />
                        <span>Wyślij wniosek do Administratora</span>
                      </button>
                    </div>
                  </form>
                )
              ) : (
                /* Tab 2: Status check and retrieve password */
                <div className="space-y-4">
                  <form onSubmit={handleCheckStatus} className="space-y-3">
                    <label className="block font-bold text-slate-700 mb-1">
                      Wpisz swój adres e-mail lub kod zgłoszenia
                    </label>
                    <div className="flex gap-2">
                      <div className="relative flex-1">
                        <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                        <input
                          type="text"
                          value={statusSearchQuery}
                          onChange={e => setStatusSearchQuery(e.target.value)}
                          placeholder="np. twoj-email@szkola.edu.pl lub RST-1234"
                          className="w-full pl-9 pr-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#1a365d] focus:outline-none"
                        />
                      </div>
                      <button
                        type="submit"
                        className="px-4 py-2 bg-[#1a365d] hover:bg-[#152c4d] text-white font-bold rounded-lg cursor-pointer"
                      >
                        Szukaj
                      </button>
                    </div>
                  </form>

                  {statusError && (
                    <div className="p-3 bg-amber-50 text-amber-900 rounded-lg border border-amber-200 text-xs">
                      {statusError}
                    </div>
                  )}

                  {searchedRequest && (
                    <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-3 animate-in fade-in duration-150">
                      <div className="flex items-center justify-between pb-2 border-b border-slate-200">
                        <div>
                          <span className="font-bold text-slate-900">{searchedRequest.fullName}</span>
                          <span className="text-[11px] text-slate-500 ml-2">({searchedRequest.emailOrLogin})</span>
                        </div>
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                            searchedRequest.status === 'zrealizowane'
                              ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                              : searchedRequest.status === 'odrzucone'
                              ? 'bg-rose-100 text-rose-800 border border-rose-300'
                              : 'bg-amber-100 text-amber-800 border border-amber-300'
                          }`}
                        >
                          {searchedRequest.status === 'zrealizowane'
                            ? 'ZREALIZOWANE'
                            : searchedRequest.status === 'odrzucone'
                            ? 'ODRZUCONE'
                            : 'OCZEKUJE NA DECYZJĘ'}
                        </span>
                      </div>

                      {searchedRequest.status === 'zrealizowane' && searchedRequest.newTemporaryPassword && (
                        <div className="p-3.5 bg-emerald-50 rounded-xl border border-emerald-300 text-emerald-950 space-y-2">
                          <div className="font-bold flex items-center space-x-1.5 text-xs text-emerald-900">
                            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                            <span>Nowe hasło nadane przez Administratora:</span>
                          </div>
                          <div className="flex items-center justify-between bg-white p-2.5 rounded-lg border border-emerald-200">
                            <span className="font-mono font-black text-sm text-slate-900 tracking-wider">
                              {searchedRequest.newTemporaryPassword}
                            </span>
                            <button
                              type="button"
                              onClick={() => {
                                setLoginEmail(searchedRequest.emailOrLogin);
                                setLoginPassword(searchedRequest.newTemporaryPassword);
                                setResetModalOpen(false);
                              }}
                              className="px-3 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded font-bold text-xs cursor-pointer shadow-xs"
                            >
                              Użyj i zaloguj się
                            </button>
                          </div>
                          {searchedRequest.adminResponse && (
                            <div className="text-[11px] text-slate-600 italic">
                              Odpowiedź Administratora: "{searchedRequest.adminResponse}"
                            </div>
                          )}
                        </div>
                      )}

                      {searchedRequest.status === 'oczekujące' && (
                        <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-amber-900 text-xs">
                          Twoja prośba została zarejestrowana i oczekuje na decyzję Administratora Placówki. Administrator wkrótce wygeneruje nowe hasło i odeśle Ci odpowiedź.
                        </div>
                      )}

                      {searchedRequest.status === 'odrzucone' && (
                        <div className="p-3 bg-rose-50 rounded-xl border border-rose-200 text-rose-900 text-xs">
                          Wniosek został odrzucony przez Administratora. Uzasadnienie: {searchedRequest.adminResponse || 'Brak danych w ewidencji szkoły.'}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="text-center text-xs text-slate-400 py-3 flex flex-col sm:flex-row items-center justify-center gap-2">
        <span>EduSynergia © 2026 · Bezpieczny elektroniczny dziennik lekcyjny · {systemConfig.schoolCity || 'Polska'}</span>
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
