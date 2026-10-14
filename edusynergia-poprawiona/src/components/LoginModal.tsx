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
  X,
  Shield,
  CheckCircle2,
  Users,
} from 'lucide-react';

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const LoginModal: React.FC<LoginModalProps> = ({ isOpen, onClose }) => {
  const { loginWithCredentials, loginAs, systemConfig, users } = useJournal();

  const [emailInput, setEmailInput] = useState('');
  const [passwordInput, setPasswordInput] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [loginSuccess, setLoginSuccess] = useState(false);

  if (!isOpen) return null;

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!emailInput.trim() || !passwordInput) {
      setErrorMsg('Wprowadź adres e-mail oraz hasło.');
      return;
    }

    const ok = loginWithCredentials(emailInput.trim(), passwordInput);
    if (ok) {
      setLoginSuccess(true);
      setTimeout(() => {
        setLoginSuccess(false);
        onClose();
      }, 400);
    } else {
      setErrorMsg('Nieprawidłowy adres e-mail lub hasło. Konta w systemie przydziela wyłącznie Administrator.');
    }
  };

  const handleQuickLogin = (userId: string) => {
    loginAs(userId);
    setLoginSuccess(true);
    setTimeout(() => {
      setLoginSuccess(false);
      onClose();
    }, 300);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden border border-slate-200 animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="bg-[#1a365d] text-white p-5 relative border-b border-[#2a4365]">
          <button
            onClick={onClose}
            className="absolute right-4 top-4 text-slate-300 hover:text-white p-1 rounded-lg hover:bg-white/10 transition-colors"
            title="Zamknij"
          >
            <X className="w-5 h-5" />
          </button>
          <div className="flex items-center space-x-3 mb-1">
            <div className="w-10 h-10 rounded-xl bg-amber-400/20 border border-amber-300/30 flex items-center justify-center text-amber-300 shadow-inner">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">Logowanie do Dziennika</h2>
              <p className="text-xs text-amber-200/90 font-medium truncate max-w-[280px]">
                {systemConfig.schoolName}
              </p>
            </div>
          </div>
          <div className="text-[11px] text-slate-300 mt-1">
            {systemConfig.schoolCity} · Rok szkolny {systemConfig.academicYear} · Semestr {systemConfig.semester === 1 ? 'I' : 'II'}
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4">
          {errorMsg && (
            <div className="p-3 bg-red-50 text-red-700 text-xs rounded-xl border border-red-200 flex items-start space-x-2">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{errorMsg}</span>
            </div>
          )}

          {loginSuccess && (
            <div className="p-3 bg-emerald-50 text-emerald-800 text-xs rounded-xl border border-emerald-200 flex items-center space-x-2">
              <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
              <span>Logowanie pomyślne!</span>
            </div>
          )}

          <form onSubmit={handleLoginSubmit} className="space-y-3.5">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Adres e-mail lub identyfikator
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  required
                  value={emailInput}
                  onChange={e => setEmailInput(e.target.value)}
                  placeholder="np. admin@szkola.edu.pl"
                  className="w-full pl-9 pr-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#1a365d] focus:outline-none bg-slate-50 font-medium text-slate-900"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Hasło
                </label>
                <button
                  type="button"
                  onClick={() => alert('W celu zresetowania hasła skontaktuj się z Administratorem Placówki.')}
                  className="text-[11px] text-blue-600 hover:underline"
                >
                  Nie pamiętasz hasła?
                </button>
              </div>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={passwordInput}
                  onChange={e => setPasswordInput(e.target.value)}
                  placeholder="Wpisz hasło"
                  className="w-full pl-9 pr-10 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#1a365d] focus:outline-none bg-slate-50 text-slate-900"
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

            <button
              type="submit"
              className="w-full py-2.5 px-4 bg-[#1a365d] hover:bg-[#152c4d] text-white text-xs font-bold rounded-lg transition-colors flex items-center justify-center space-x-2 shadow-xs cursor-pointer"
            >
              <span>Zaloguj się</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          {/* Registration restriction note */}
          <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-600 space-y-1">
            <div className="font-bold text-slate-800 flex items-center space-x-1.5">
              <Shield className="w-3.5 h-3.5 text-blue-700" />
              <span>Dostęp wyłącznie dla uprawnionych kont</span>
            </div>
            <p className="text-[11px] leading-relaxed text-slate-500">
              Samodzielna rejestracja jest zablokowana. Wszystkie konta uczniów, nauczycieli oraz personelu są tworzone i autoryzowane wyłącznie przez Administratora Szkoły.
            </p>
          </div>

          {/* Quick role-picker for testing in AI Studio */}
          <div className="pt-2 border-t border-slate-100">
            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2 flex items-center space-x-1">
              <Users className="w-3 h-3" />
              <span>Szybkie logowanie testowe:</span>
            </div>
            <div className="grid grid-cols-2 gap-1.5 text-xs">
              {users.slice(0, 4).map(u => (
                <button
                  key={u.id}
                  type="button"
                  onClick={() => handleQuickLogin(u.id)}
                  className="p-2 text-left rounded-lg border border-slate-200 hover:border-blue-400 hover:bg-blue-50/50 transition-all text-slate-700 hover:text-blue-900"
                >
                  <div className="font-bold truncate text-[11px]">{u.name}</div>
                  <div className="text-[10px] text-slate-400 truncate">
                    {u.role === 'admin'
                      ? 'Administrator'
                      : u.role === 'teacher'
                      ? 'Nauczyciel'
                      : u.role === 'parent'
                      ? 'Rodzic'
                      : 'Uczeń'}
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
