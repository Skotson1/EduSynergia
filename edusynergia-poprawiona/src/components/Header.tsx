import React, { useState } from 'react';
import { useJournal } from '../context/JournalContext';
import {
  GraduationCap,
  Calendar,
  Clock,
  BookOpen,
  Mail,
  Bell,
  ShieldCheck,
  UserCheck,
  LogOut,
  ChevronDown,
  FileText,
  LayoutDashboard,
  CheckCircle2,
  AlertTriangle,
  RotateCcw,
  Award,
  Sparkles,
  Download,
} from 'lucide-react';

export type ActiveTab =
  | 'dashboard'
  | 'grades'
  | 'attendance'
  | 'behavior'
  | 'timetable'
  | 'schedule'
  | 'messages'
  | 'announcements'
  | 'admin';

interface HeaderProps {
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  onOpenLogin: () => void;
}

export const Header: React.FC<HeaderProps> = ({ activeTab, setActiveTab, onOpenLogin }) => {
  const { currentUser, users, loginAs, logout, unreadCount, resetSystem, systemConfig } = useJournal();
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const [resetConfirmOpen, setResetConfirmOpen] = useState(false);

  const isTeacherOrAdmin = currentUser?.role === 'admin' || currentUser?.role === 'teacher';

  const navItems: { id: ActiveTab; label: string; icon: React.ReactNode; badge?: number }[] = [
    { id: 'dashboard', label: 'Biurko', icon: <LayoutDashboard className="w-4 h-4" /> },
    { id: 'grades', label: 'Oceny', icon: <GraduationCap className="w-4 h-4" /> },
    { id: 'attendance', label: 'Frekwencja & Lista', icon: <Clock className="w-4 h-4" /> },
    { id: 'behavior', label: 'Punkty & Zachowanie', icon: <Award className="w-4 h-4 text-amber-300" /> },
    { id: 'timetable', label: 'Plan lekcji', icon: <Calendar className="w-4 h-4" /> },
    { id: 'schedule', label: 'Terminarz', icon: <FileText className="w-4 h-4" /> },
    {
      id: 'messages',
      label: 'Wiadomości',
      icon: <Mail className="w-4 h-4" />,
      badge: unreadCount > 0 ? unreadCount : undefined,
    },
    { id: 'announcements', label: 'Ogłoszenia', icon: <Bell className="w-4 h-4" /> },
    ...(isTeacherOrAdmin
      ? [
          {
            id: 'admin' as ActiveTab,
            label: currentUser?.role === 'admin' ? 'Panel Dyrekcji' : 'Panel Nauczyciela',
            icon: <ShieldCheck className="w-4 h-4 text-amber-300" />,
          },
        ]
      : []),
  ];

  return (
    <header className="bg-gradient-to-r from-[#0b192c] via-[#102a4e] to-[#1a365d] text-white shadow-md border-b border-blue-900/60 sticky top-0 z-40">
      {/* Top institution bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-14 border-b border-white/10">
          {/* Logo & School Name */}
          <div className="flex items-center space-x-3 cursor-pointer" onClick={() => setActiveTab('dashboard')}>
            <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-amber-400 to-amber-600 text-slate-950 flex items-center justify-center font-black shadow-md shadow-amber-500/20">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-extrabold tracking-tight text-white text-base">EduSynergia</span>
                <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-amber-400/20 text-amber-300 border border-amber-300/40">
                  Dziennik Szkolny
                </span>
              </div>
              <p className="text-[11px] text-slate-300 hidden sm:block truncate max-w-md">
                {systemConfig.schoolName} · {systemConfig.schoolCity} · {systemConfig.academicYear} · Sem. {systemConfig.semester === 1 ? 'I' : 'II'}
              </p>
            </div>
          </div>

          {/* Quick Account Switcher & User Profile */}
          <div className="flex items-center space-x-2 sm:space-x-3">
            {/* Quick Download Zip Button */}
            <a
              href="/edusynergia-projekt.zip"
              download="edusynergia-caly-projekt.zip"
              className="flex items-center space-x-1.5 px-2.5 sm:px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-sm transition-all border border-emerald-400/40 hover:scale-[1.02] cursor-pointer"
              title="Pobierz kompletne archiwum ZIP projektu"
            >
              <Download className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Pobierz projekt (.ZIP)</span>
              <span className="sm:hidden font-mono font-bold">.ZIP</span>
            </a>

            {currentUser ? (
              <>
                <div className="relative">
                <button
                  onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                  className="flex items-center space-x-2.5 px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/15 transition-all border border-white/15 text-left text-sm cursor-pointer shadow-xs"
                  aria-expanded={userDropdownOpen}
                >
                  <img
                    src={currentUser.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=128&q=80'}
                    alt={currentUser.name}
                    className="w-7 h-7 rounded-full object-cover border border-amber-400/50"
                  />
                  <div className="hidden md:block leading-tight">
                    <div className="font-semibold text-xs text-white flex items-center gap-1.5">
                      {currentUser.name}
                      <span className={`text-[10px] px-1.5 py-0.2 rounded font-bold uppercase ${
                        currentUser.role === 'admin'
                          ? 'bg-purple-500/30 text-purple-200 border border-purple-400/40'
                          : currentUser.role === 'teacher'
                          ? 'bg-blue-500/30 text-blue-200 border border-blue-400/40'
                          : 'bg-emerald-500/30 text-emerald-200 border border-emerald-400/40'
                      }`}>
                        {currentUser.role === 'admin' ? 'Admin' : currentUser.role === 'teacher' ? 'Nauczyciel' : currentUser.role === 'parent' ? 'Rodzic' : 'Uczeń'}
                      </span>
                    </div>
                    <div className="text-[11px] text-amber-300/90 truncate max-w-[150px]">
                      {currentUser.roleTitle}
                    </div>
                  </div>
                  <ChevronDown className="w-3.5 h-3.5 text-slate-300" />
                </button>

                {/* Dropdown menu */}
                {userDropdownOpen && (
                  <>
                    <div
                      className="fixed inset-0 z-40"
                      onClick={() => setUserDropdownOpen(false)}
                    />
                    <div className="absolute right-0 mt-2 w-72 bg-white rounded-xl shadow-2xl py-2 z-50 text-slate-800 border border-slate-200 animate-in fade-in zoom-in-95 duration-100">
                      <div className="px-4 py-2.5 border-b border-slate-100 bg-slate-50/60 rounded-t-xl">
                        <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                          Zalogowany użytkownik
                        </div>
                        <div className="font-extrabold text-slate-900 text-sm mt-0.5">{currentUser.name}</div>
                        <div className="text-xs text-slate-500 truncate">{currentUser.email}</div>
                        <div className="text-xs text-blue-800 font-semibold mt-1">
                          {currentUser.roleTitle}
                        </div>
                      </div>

                      {/* Role-based account security */}
                      {currentUser.role === 'admin' ? (
                        <div className="px-3 py-2 border-b border-slate-100">
                          <div className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-1.5 flex items-center justify-between">
                            <span>Podgląd jako użytkownik:</span>
                            <span className="text-[10px] text-purple-700 bg-purple-50 px-1.5 py-0.5 rounded font-bold border border-purple-200">
                              Admin
                            </span>
                          </div>
                          <div className="space-y-1">
                            {users.map(u => (
                              <button
                                key={u.id}
                                onClick={() => {
                                  loginAs(u.id);
                                  setUserDropdownOpen(false);
                                }}
                                className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs transition-colors text-left ${
                                  u.id === currentUser.id
                                    ? 'bg-blue-50 text-blue-700 font-medium'
                                    : 'hover:bg-slate-100 text-slate-700'
                                }`}
                              >
                                <div className="flex items-center space-x-2 truncate">
                                  <span className={`w-2 h-2 rounded-full ${u.id === currentUser.id ? 'bg-blue-600' : 'bg-slate-300'}`} />
                                  <span className="truncate">{u.name}</span>
                                </div>
                                <span className="text-[10px] uppercase font-semibold text-slate-400 ml-1">
                                  {u.role === 'admin' ? 'Admin' : u.role === 'teacher' ? 'Nauczyciel' : u.role === 'student' ? 'Uczeń' : 'Rodzic'}
                                </span>
                              </button>
                            ))}
                          </div>
                        </div>
                      ) : (
                        <div className="px-4 py-3 border-b border-slate-100 bg-slate-50/70 text-xs">
                          <div className="flex items-center space-x-1.5 text-[#0b192c] font-bold mb-1">
                            <ShieldCheck className="w-4 h-4 text-emerald-600" />
                            <span>Konto zabezpieczone</span>
                          </div>
                          <p className="text-[11px] text-slate-500 leading-relaxed">
                            Jesteś zalogowany jako uczeń/rodzic. Dostęp do uprawnień administracyjnych oraz oceniania wymaga zalogowania kontem dyrekcji placówki.
                          </p>
                        </div>
                      )}

                      {/* Project Download & Actions */}
                      <div className="px-2 pt-1 pb-1">
                        <a
                          href="/edusynergia-projekt.zip"
                          download="edusynergia-caly-projekt.zip"
                          className="w-full flex items-center space-x-2 px-3 py-1.5 rounded-lg text-xs text-emerald-800 bg-emerald-50 hover:bg-emerald-100 transition-colors font-bold mb-1 border border-emerald-200 cursor-pointer"
                        >
                          <Download className="w-3.5 h-3.5 text-emerald-600" />
                          <span>Pobierz cały projekt (.ZIP)</span>
                        </a>
                        {currentUser.role === 'admin' && (
                          <button
                            onClick={() => {
                              setUserDropdownOpen(false);
                              setResetConfirmOpen(true);
                            }}
                            className="w-full flex items-center space-x-2 px-3 py-1.5 rounded-lg text-xs text-slate-600 hover:text-red-700 hover:bg-red-50 transition-colors"
                          >
                            <RotateCcw className="w-3.5 h-3.5 text-slate-400" />
                            <span>Resetuj dane dziennika</span>
                          </button>
                        )}
                        <button
                          onClick={() => {
                            logout();
                            setUserDropdownOpen(false);
                          }}
                          className="w-full flex items-center space-x-2 px-3 py-1.5 rounded-lg text-xs text-red-600 hover:bg-red-50 transition-colors font-semibold mt-0.5 cursor-pointer"
                        >
                          <LogOut className="w-3.5 h-3.5" />
                          <span>Wyloguj się</span>
                        </button>
                      </div>
                    </div>
                  </>
                )}
              </div>
              <button
                onClick={logout}
                className="hidden sm:flex items-center space-x-1 px-2.5 py-1.5 rounded-md bg-white/10 hover:bg-red-500/20 hover:text-red-300 text-slate-200 border border-white/15 text-xs font-semibold transition-colors cursor-pointer"
                title="Wyloguj się i przejdź do ekranu logowania"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Wyloguj</span>
              </button>
              </>
            ) : (
              <button
                onClick={onOpenLogin}
                className="flex items-center space-x-1.5 px-3 py-1.5 rounded bg-amber-500 hover:bg-amber-400 text-slate-900 font-semibold text-xs transition-colors shadow-sm"
              >
                <UserCheck className="w-3.5 h-3.5" />
                <span>Zaloguj się do dziennika</span>
              </button>
            )}
          </div>
        </div>

        {/* Secondary navigation tab bar */}
        <nav className="flex space-x-1 overflow-x-auto py-1 scrollbar-none text-xs sm:text-sm font-medium">
          {navItems.map(item => {
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`flex items-center space-x-2 px-3 py-2 rounded-t-md transition-colors whitespace-nowrap relative ${
                  isActive
                    ? 'bg-[#0f233d] text-white font-semibold border-b-2 border-amber-400 shadow-sm'
                    : 'text-slate-200 hover:bg-white/10 hover:text-white'
                }`}
              >
                <span>{item.icon}</span>
                <span>{item.label}</span>
                {item.badge !== undefined && (
                  <span className="ml-1 bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.2 rounded-full">
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Reset Confirmation Dialog */}
      {resetConfirmOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6 text-slate-800">
            <div className="flex items-center space-x-3 text-red-600 mb-3">
              <AlertTriangle className="w-6 h-6 flex-shrink-0" />
              <h3 className="text-base font-bold text-slate-900">Resetowanie danych dziennika</h3>
            </div>
            <p className="text-sm text-slate-600 mb-5 leading-relaxed">
              Czy na pewno chcesz przywrócić pierwotne dane demonstracyjne (oceny, obecności, plan lekcji, wiadomości)? Wszystkie wprowadzone zmiany zostaną zastąpione danymi domyślnymi.
            </p>
            <div className="flex justify-end space-x-2">
              <button
                onClick={() => setResetConfirmOpen(false)}
                className="px-4 py-2 text-sm text-slate-600 hover:bg-slate-100 rounded font-medium transition-colors"
              >
                Anuluj
              </button>
              <button
                onClick={() => {
                  resetSystem();
                  setResetConfirmOpen(false);
                }}
                className="px-4 py-2 text-sm bg-red-600 hover:bg-red-700 text-white rounded font-medium transition-colors"
              >
                Zresetuj system i uruchom kreator
              </button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};
