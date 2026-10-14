import React, { useState } from 'react';
import { useJournal } from '../context/JournalContext';
import { AttendanceStatus, Student, UserRole, User } from '../types';
import { LESSON_BELLS } from '../data/initialData';
import { AddGradeModal } from './AddGradeModal';
import {
  ShieldCheck,
  GraduationCap,
  Clock,
  Users,
  FileCheck,
  Plus,
  Trash2,
  CheckCircle,
  XCircle,
  AlertTriangle,
  RotateCcw,
  Sparkles,
  BarChart3,
  Calendar,
  Save,
  Search,
  KeyRound,
  Building2,
  Mail,
  Lock,
  UserPlus,
  BookOpen,
  MapPin,
  Check,
  Award,
  Layers,
  Settings,
  Shield,
  Eye,
  LogOut,
  RefreshCw,
  Download,
} from 'lucide-react';

export const AdminPanelView: React.FC = () => {
  const {
    currentUser,
    users,
    students,
    subjects,
    grades,
    attendance,
    systemConfig,
    passwordResetRequests,
    resolvePasswordResetRequest,
    resetSystemToInitialWizard,
    updateSystemConfig,
    createUserByAdmin,
    updateUserByAdmin,
    deleteUserByAdmin,
    loginAs,
    recordAttendance,
    respondToExcuse,
    addStudent,
    deleteStudent,
    resetSystem,
    resetToDefaults,
  } = useJournal();

  // Strict Admin Guard: Non-admins cannot access or tamper with the administration panel
  if (currentUser?.role !== 'admin') {
    return (
      <div className="bg-white rounded-3xl border border-rose-200 p-8 sm:p-12 text-center max-w-lg mx-auto my-12 shadow-md">
        <div className="w-16 h-16 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center mx-auto mb-4 border border-rose-200 shadow-sm">
          <Shield className="w-8 h-8 text-rose-600" />
        </div>
        <h2 className="text-xl font-black text-slate-900 mb-2">Strefa Dyrekcji: Dostęp Zablokowany</h2>
        <p className="text-xs text-slate-600 mb-6 leading-relaxed">
          Panel Dyrekcji i Zarządzania Placówką wymaga uprawnień <strong>Administratora Szkoły</strong>.
          Zalogowano na konto: <strong className="text-slate-800">{currentUser?.name}</strong> ({currentUser?.roleTitle}).
          Próba nieautoryzowanej modyfikacji parametrów szkoły lub użytkowników została zablokowana przez system bezpieczeństwa.
        </p>
        <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-[11px] text-slate-500 mb-6">
          W celu zarządzania placówką wyloguj się i wprowadź dane uwierzytelniające Administratora.
        </div>
      </div>
    );
  }

  const [adminTab, setAdminTab] = useState<
    'users' | 'school' | 'attendance' | 'grades' | 'excuses' | 'students' | 'stats' | 'resets'
  >('users');

  // Reset requests state
  const [resetNewPassMap, setResetNewPassMap] = useState<Record<string, string>>({});
  const [resetNoteMap, setResetNoteMap] = useState<Record<string, string>>({});
  const pendingResets = passwordResetRequests.filter(r => r.status === 'oczekujące');

  // --- USER MANAGEMENT STATE ---
  const [userRoleFilter, setUserRoleFilter] = useState<UserRole | 'all'>('all');
  const [userSearchQuery, setUserSearchQuery] = useState('');
  const [showCreateUserForm, setShowCreateUserForm] = useState(false);

  // New User Form State
  const [newUserName, setNewUserName] = useState('');
  const [newUserEmail, setNewUserEmail] = useState('');
  const [newUserPassword, setNewUserPassword] = useState('haslo123');
  const [newUserRole, setNewUserRole] = useState<UserRole>('student');
  const [newUserClass, setNewUserClass] = useState('3A');
  const [newUserPesel, setNewUserPesel] = useState('');
  const [newUserParentName, setNewParentName] = useState('');
  const [newUserParentEmail, setNewParentEmail] = useState('');
  const [selectedSubjectsTaught, setSelectedSubjectsTaught] = useState<string[]>(['Matematyka']);
  const [userToast, setUserToast] = useState<{ message: string; type: 'success' | 'info' } | null>(null);

  // --- SCHOOL PROFILE SETTINGS STATE ---
  const [schoolNameInput, setSchoolNameInput] = useState(systemConfig.schoolName);
  const [schoolCityInput, setSchoolCityInput] = useState(systemConfig.schoolCity);
  const [schoolYearInput, setSchoolYearInput] = useState(systemConfig.academicYear);
  const [schoolSemesterInput, setSchoolSemesterInput] = useState<1 | 2>(systemConfig.semester);
  const [schoolSettingsSaved, setSchoolSettingsSaved] = useState(false);
  const [showResetConfirmModal, setShowResetConfirmModal] = useState(false);

  // --- ATTENDANCE STATE ---
  const [attDate, setAttDate] = useState('2026-04-10');
  const [attHour, setAttHour] = useState(1);
  const [attSubject, setAttSubject] = useState('Matematyka');
  const [attStatusMap, setAttStatusMap] = useState<Record<string, AttendanceStatus>>(() => {
    const map: Record<string, AttendanceStatus> = {};
    for (const s of students) {
      map[s.id] = 'obecny';
    }
    return map;
  });
  const [attendanceSavedNotice, setAttendanceSavedNotice] = useState(false);

  // --- GRADE MODAL STATE ---
  const [selectedStudentForGrade, setSelectedStudentForGrade] = useState<string | undefined>(undefined);
  const [selectedSubjectForGrade, setSelectedSubjectForGrade] = useState<string | undefined>(undefined);
  const [addGradeModalOpen, setAddGradeModalOpen] = useState(false);

  // --- STUDENTS ROSTER STATE ---
  const [newFirstName, setNewFirstName] = useState('');
  const [newLastName, setNewLastName] = useState('');
  const [newPesel, setNewPesel] = useState('');
  const [newParentNameRoster, setNewParentNameRoster] = useState('');
  const [newParentEmailRoster, setNewParentEmailRoster] = useState('');
  const [studentSearch, setStudentSearch] = useState('');

  // Excuses
  const pendingExcuses = attendance.filter(r => r.excuseStatus === 'pending');

  // Stats calculation
  const totalGradesCount = grades.length;
  const totalExcusesPending = pendingExcuses.length;

  const showNotification = (message: string, type: 'success' | 'info' = 'success') => {
    setUserToast({ message, type });
    setTimeout(() => setUserToast(null), 4000);
  };

  // Helper: Auto generate email based on name
  const handleGenerateEmail = () => {
    if (!newUserName.trim()) return;
    const parts = newUserName.trim().toLowerCase().split(' ');
    const first = parts[0] || 'konto';
    const last = parts[1] || 'uzytkownik';
    const domain = newUserRole === 'student' ? 'uczen.szkola.edu.pl' : 'szkola.edu.pl';
    const cleanFirst = first.normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z]/g, '');
    const cleanLast = last.normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z]/g, '');
    setNewUserEmail(`${cleanFirst.charAt(0)}.${cleanLast}@${domain}`);
  };

  // Helper: Generate random strong password
  const handleGeneratePassword = () => {
    const chars = 'abcdefghjkmnpqrstuvwxyz23456789ABCDEFGHJKMNPQRSTUVWXYZ';
    let res = '';
    for (let i = 0; i < 8; i++) {
      res += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setNewUserPassword(res);
  };

  // Submit create user
  const handleCreateUserSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUserName.trim() || !newUserEmail.trim()) {
      alert('Wprowadź imię i nazwisko oraz adres e-mail.');
      return;
    }

    const created = createUserByAdmin({
      name: newUserName.trim(),
      email: newUserEmail.trim(),
      password: newUserPassword.trim() || 'haslo123',
      role: newUserRole,
      className: newUserRole === 'student' ? newUserClass : undefined,
      subjectsTaught: newUserRole === 'teacher' ? selectedSubjectsTaught : undefined,
      parentName: newUserRole === 'student' ? newUserParentName.trim() : undefined,
      parentEmail: newUserRole === 'student' ? newUserParentEmail.trim() : undefined,
      pesel: newUserRole === 'student' ? newUserPesel.trim() : undefined,
    });

    showNotification(
      `Utworzono konto: ${created.name} (${created.roleTitle}). Login: ${created.email}, Hasło: ${created.password}`
    );

    // Reset form
    setNewUserName('');
    setNewUserEmail('');
    setNewUserPassword('haslo123');
    setNewUserPesel('');
    setNewParentName('');
    setNewParentEmail('');
    setShowCreateUserForm(false);
  };

  // Reset user password by admin
  const handleResetUserPassword = (user: User) => {
    const chars = 'abcdefghjkmnpqrstuvwxyz23456789ABCDEFGHJKMNPQRSTUVWXYZ';
    let newPass = '';
    for (let i = 0; i < 8; i++) newPass += chars.charAt(Math.floor(Math.random() * chars.length));
    updateUserByAdmin(user.id, { password: newPass });
    showNotification(
      `Wygenerowano nowe hasło dla ${user.name}: "${newPass}" (zapisano w systemie).`,
      'info'
    );
  };

  // Save school configuration
  const handleSaveSchoolSettings = (e: React.FormEvent) => {
    e.preventDefault();
    if (!schoolNameInput.trim()) {
      alert('Nazwa szkoły nie może być pusta.');
      return;
    }
    updateSystemConfig({
      schoolName: schoolNameInput.trim(),
      schoolCity: schoolCityInput.trim(),
      academicYear: schoolYearInput.trim(),
      semester: schoolSemesterInput,
    });
    setSchoolSettingsSaved(true);
    setTimeout(() => setSchoolSettingsSaved(false), 3500);
  };

  // Attendance handlers
  const handleSaveWholeClassAttendance = (e: React.FormEvent) => {
    e.preventDefault();
    const recordsToSave = students.map(st => ({
      studentId: st.id,
      date: attDate,
      lessonHour: attHour,
      subjectName: attSubject,
      status: attStatusMap[st.id] || 'obecny',
    }));

    recordAttendance(recordsToSave);
    setAttendanceSavedNotice(true);
    setTimeout(() => setAttendanceSavedNotice(false), 3000);
  };

  const handleMarkAllPresent = () => {
    const map: Record<string, AttendanceStatus> = {};
    for (const s of students) {
      map[s.id] = 'obecny';
    }
    setAttStatusMap(map);
  };

  const handleCreateStudentRoster = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newFirstName.trim() || !newLastName.trim()) return;

    addStudent({
      firstName: newFirstName.trim(),
      lastName: newLastName.trim(),
      className: '3A',
      numberInJournal: students.length + 1,
      pesel: newPesel.trim() || '08250000000',
      parentName: newParentNameRoster.trim() || 'Rodzic ucznia',
      parentEmail: newParentEmailRoster.trim() || `${newLastName.toLowerCase()}@rodzic.szkola.edu.pl`,
    });

    setNewFirstName('');
    setNewLastName('');
    setNewPesel('');
    setNewParentNameRoster('');
    setNewParentEmailRoster('');
    showNotification(`Dodano ucznia ${newFirstName} ${newLastName} do oddziału 3A.`);
  };

  // Filtered users list
  const filteredUsers = users.filter(u => {
    const matchesRole = userRoleFilter === 'all' || u.role === userRoleFilter;
    const matchesSearch =
      u.name.toLowerCase().includes(userSearchQuery.toLowerCase()) ||
      u.email.toLowerCase().includes(userSearchQuery.toLowerCase()) ||
      u.roleTitle.toLowerCase().includes(userSearchQuery.toLowerCase());
    return matchesRole && matchesSearch;
  });

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
      {userToast && (
        <div
          className={`p-3.5 rounded-xl border text-xs font-semibold flex items-center justify-between shadow-md transition-all animate-in fade-in duration-150 ${
            userToast.type === 'success'
              ? 'bg-emerald-50 border-emerald-300 text-emerald-900'
              : 'bg-blue-50 border-blue-300 text-blue-900'
          }`}
        >
          <div className="flex items-center space-x-2.5">
            <CheckCircle className="w-4 h-4 shrink-0 text-emerald-600" />
            <span>{userToast.message}</span>
          </div>
          <button
            onClick={() => setUserToast(null)}
            className="text-slate-400 hover:text-slate-700 ml-4 font-bold"
          >
            ✕
          </button>
        </div>
      )}

      {/* Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-[#1a365d] to-[#142d50] text-white p-6 rounded-2xl shadow-md flex flex-col md:flex-row md:items-center justify-between gap-4 border border-slate-700/50">
        <div>
          <div className="flex items-center space-x-2 text-xs text-amber-300 font-semibold uppercase tracking-wider mb-1">
            <ShieldCheck className="w-4 h-4" />
            <span>Nadrzędny Panel Zarządzania Placówką</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-white">
            Panel Administratora i Dyrekcji Szkoły
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 mt-1">
            Placówka: <strong className="text-white">{systemConfig.schoolName}</strong> ({systemConfig.schoolCity}) ·
            Zalogowany jako: <strong className="text-white">{currentUser?.name}</strong> ({currentUser?.roleTitle})
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* Quick summary counters */}
          <div className="flex items-center space-x-4 bg-white/10 px-4 py-2.5 rounded-xl border border-white/10 text-xs backdrop-blur-xs">
            <div>
              <div className="text-slate-300">Wszystkich kont</div>
              <div className="text-base font-bold text-white">{users.length}</div>
            </div>
            <div className="w-px h-7 bg-white/20" />
            <div>
              <div className="text-slate-300">Uczniów</div>
              <div className="text-base font-bold text-amber-300">{students.length}</div>
            </div>
            <div className="w-px h-7 bg-white/20" />
            <div>
              <div className="text-slate-300">Wpisanych ocen</div>
              <div className="text-base font-bold text-white">{totalGradesCount}</div>
            </div>
          </div>

          {/* Download Entire Project ZIP */}
          <a
            href="/edusynergia-projekt.zip"
            download="edusynergia-caly-projekt.zip"
            className="flex items-center space-x-2 px-3.5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-md transition-all border border-emerald-400/40 hover:scale-[1.02] cursor-pointer"
            title="Pobierz kompletny projekt w pliku ZIP (kod źródłowy, panel, plan lekcji)"
          >
            <Download className="w-4 h-4" />
            <span>Pobierz projekt (.ZIP)</span>
          </a>
        </div>
      </div>

      {/* Segmented Sub-Navigation for Admin View */}
      <div className="bg-white p-1.5 rounded-xl border border-slate-200 shadow-2xs flex flex-wrap gap-1 text-xs font-semibold">
        <button
          onClick={() => setAdminTab('users')}
          className={`flex items-center space-x-2 px-3.5 py-2 rounded-lg transition-colors cursor-pointer ${
            adminTab === 'users'
              ? 'bg-[#1a365d] text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <UserPlus className="w-4 h-4 text-amber-300" />
          <span>Konta i Użytkownicy</span>
          <span className="ml-1 px-1.5 py-0.5 rounded-full text-[10px] font-extrabold bg-white/20 text-white">
            {users.length}
          </span>
        </button>

        <button
          onClick={() => setAdminTab('school')}
          className={`flex items-center space-x-2 px-3.5 py-2 rounded-lg transition-colors cursor-pointer ${
            adminTab === 'school'
              ? 'bg-[#1a365d] text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Building2 className="w-4 h-4" />
          <span>Ustawienia Szkoły i Placówki</span>
        </button>

        <button
          onClick={() => setAdminTab('attendance')}
          className={`flex items-center space-x-2 px-3.5 py-2 rounded-lg transition-colors cursor-pointer ${
            adminTab === 'attendance'
              ? 'bg-[#1a365d] text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Clock className="w-4 h-4" />
          <span>Frekwencja lekcyjna</span>
        </button>

        <button
          onClick={() => setAdminTab('grades')}
          className={`flex items-center space-x-2 px-3.5 py-2 rounded-lg transition-colors cursor-pointer ${
            adminTab === 'grades'
              ? 'bg-[#1a365d] text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <GraduationCap className="w-4 h-4" />
          <span>Wpisy ocen</span>
        </button>

        <button
          onClick={() => setAdminTab('excuses')}
          className={`flex items-center space-x-2 px-3.5 py-2 rounded-lg transition-colors relative cursor-pointer ${
            adminTab === 'excuses'
              ? 'bg-[#1a365d] text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <FileCheck className="w-4 h-4" />
          <span>Usprawiedliwienia</span>
          {pendingExcuses.length > 0 && (
            <span className="bg-amber-400 text-slate-900 text-[10px] font-extrabold px-1.5 py-0.2 rounded-full">
              {pendingExcuses.length}
            </span>
          )}
        </button>

        <button
          onClick={() => setAdminTab('students')}
          className={`flex items-center space-x-2 px-3.5 py-2 rounded-lg transition-colors cursor-pointer ${
            adminTab === 'students'
              ? 'bg-[#1a365d] text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Users className="w-4 h-4" />
          <span>Oddział 3A</span>
        </button>

        <button
          onClick={() => setAdminTab('stats')}
          className={`flex items-center space-x-2 px-3.5 py-2 rounded-lg transition-colors cursor-pointer ${
            adminTab === 'stats'
              ? 'bg-[#1a365d] text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <BarChart3 className="w-4 h-4" />
          <span>Statystyki</span>
        </button>

        <button
          onClick={() => setAdminTab('resets')}
          className={`flex items-center space-x-2 px-3.5 py-2 rounded-lg transition-colors cursor-pointer ${
            adminTab === 'resets'
              ? 'bg-[#1a365d] text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <KeyRound className="w-4 h-4 text-amber-300" />
          <span>Zgłoszenia o reset hasła</span>
          {pendingResets.length > 0 && (
            <span className="bg-amber-400 text-slate-900 text-[10px] font-extrabold px-1.5 py-0.2 rounded-full">
              {pendingResets.length}
            </span>
          )}
        </button>
      </div>

      {/* =========================================================================
          TAB 1: ZARZĄDZANIE KONTAMI I TWORZENIE UŻYTKOWNIKÓW (GŁÓWNY WYMÓG)
         ========================================================================= */}
      {adminTab === 'users' && (
        <div className="space-y-6">
          {/* Quick Notice Banner */}
          <div className="p-4 bg-blue-50 border border-blue-200 rounded-xl text-xs text-blue-900 flex items-start justify-between gap-4">
            <div className="flex items-start space-x-3">
              <Shield className="w-5 h-5 text-blue-700 shrink-0 mt-0.5" />
              <div>
                <strong className="text-sm font-bold text-blue-950">
                  Wyłączna autoryzacja Administratora Placówki
                </strong>
                <p className="mt-0.5 leading-relaxed text-blue-800">
                  Zgodnie z polityką bezpieczeństwa, samodzielna rejestracja użytkowników na stronie głównej jest wyłączona. 
                  Nowe konta dla <strong>uczniów, nauczycieli, rodziców i administratorów</strong> tworzy wyłącznie Administrator w tym module.
                </p>
              </div>
            </div>
            <button
              onClick={() => setShowCreateUserForm(!showCreateUserForm)}
              className="px-4 py-2 bg-[#1a365d] hover:bg-[#152c4d] text-white text-xs font-bold rounded-lg transition-colors shrink-0 flex items-center space-x-1.5 shadow-xs cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>{showCreateUserForm ? 'Ukryj formularz' : 'Utwórz nowe konto'}</span>
            </button>
          </div>

          {/* Quick Role Counts */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div
              onClick={() => setUserRoleFilter('all')}
              className={`p-3.5 rounded-xl border transition-all cursor-pointer ${
                userRoleFilter === 'all'
                  ? 'bg-blue-50 border-blue-500 shadow-2xs'
                  : 'bg-white border-slate-200 hover:border-slate-300'
              }`}
            >
              <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                Wszyscy użytkownicy
              </div>
              <div className="text-2xl font-black text-slate-900 mt-1">{users.length}</div>
            </div>

            <div
              onClick={() => setUserRoleFilter('student')}
              className={`p-3.5 rounded-xl border transition-all cursor-pointer ${
                userRoleFilter === 'student'
                  ? 'bg-blue-50 border-blue-500 shadow-2xs'
                  : 'bg-white border-slate-200 hover:border-slate-300'
              }`}
            >
              <div className="text-[11px] font-bold text-blue-700 uppercase tracking-wider">
                Uczniowie
              </div>
              <div className="text-2xl font-black text-blue-900 mt-1">
                {users.filter(u => u.role === 'student').length}
              </div>
            </div>

            <div
              onClick={() => setUserRoleFilter('teacher')}
              className={`p-3.5 rounded-xl border transition-all cursor-pointer ${
                userRoleFilter === 'teacher'
                  ? 'bg-emerald-50 border-emerald-500 shadow-2xs'
                  : 'bg-white border-slate-200 hover:border-slate-300'
              }`}
            >
              <div className="text-[11px] font-bold text-emerald-700 uppercase tracking-wider">
                Nauczyciele
              </div>
              <div className="text-2xl font-black text-emerald-900 mt-1">
                {users.filter(u => u.role === 'teacher').length}
              </div>
            </div>

            <div
              onClick={() => setUserRoleFilter('admin')}
              className={`p-3.5 rounded-xl border transition-all cursor-pointer ${
                userRoleFilter === 'admin'
                  ? 'bg-purple-50 border-purple-500 shadow-2xs'
                  : 'bg-white border-slate-200 hover:border-slate-300'
              }`}
            >
              <div className="text-[11px] font-bold text-purple-700 uppercase tracking-wider">
                Administratorzy
              </div>
              <div className="text-2xl font-black text-purple-900 mt-1">
                {users.filter(u => u.role === 'admin').length}
              </div>
            </div>
          </div>

          {/* CREATE USER FORM ACCORDION */}
          {showCreateUserForm && (
            <div className="bg-white rounded-2xl border-2 border-blue-600/40 shadow-lg p-6 animate-in fade-in duration-200">
              <div className="flex items-center justify-between pb-4 mb-4 border-b border-slate-100">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 rounded-xl bg-blue-50 border border-blue-200 flex items-center justify-center text-blue-700">
                    <UserPlus className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-bold text-base text-slate-900">
                      Utwórz nowe konto w systemie dziennika
                    </h3>
                    <p className="text-xs text-slate-500">
                      Dane logowania zostaną natychmiast przypisane do nowego profilu.
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setShowCreateUserForm(false)}
                  className="text-slate-400 hover:text-slate-600 p-1"
                >
                  ✕
                </button>
              </div>

              <form onSubmit={handleCreateUserSubmit} className="space-y-4 text-xs">
                {/* Role Selector Pills */}
                <div>
                  <label className="block font-bold text-slate-700 uppercase tracking-wider mb-2">
                    Wybierz rolę użytkownika:
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {[
                      { role: 'student' as UserRole, label: 'Uczeń', desc: 'Dostęp do ocen i planu' },
                      { role: 'teacher' as UserRole, label: 'Nauczyciel', desc: 'Wpisywanie ocen i frekwencji' },
                      { role: 'admin' as UserRole, label: 'Administrator', desc: 'Pełne zarządzanie placówką' },
                      { role: 'parent' as UserRole, label: 'Rodzic', desc: 'Wgląd w oceny i usprawiedliwienia' },
                    ].map(item => (
                      <button
                        key={item.role}
                        type="button"
                        onClick={() => setNewUserRole(item.role)}
                        className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                          newUserRole === item.role
                            ? 'bg-[#1a365d] text-white border-[#1a365d] shadow-sm'
                            : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                        }`}
                      >
                        <div className="font-bold text-xs">{item.label}</div>
                        <div
                          className={`text-[10px] mt-0.5 ${
                            newUserRole === item.role ? 'text-slate-200' : 'text-slate-400'
                          }`}
                        >
                          {item.desc}
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Common Fields */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">
                      Imię i nazwisko <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={newUserName}
                      onChange={e => setNewUserName(e.target.value)}
                      placeholder="np. Piotr Zieliński"
                      className="w-full p-2.5 border border-slate-300 rounded-lg bg-slate-50 font-medium text-slate-900"
                    />
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="font-bold text-slate-700">
                        Adres e-mail / Login <span className="text-red-500">*</span>
                      </label>
                      <button
                        type="button"
                        onClick={handleGenerateEmail}
                        className="text-[10px] text-blue-600 hover:underline font-bold"
                      >
                        Generuj z imienia
                      </button>
                    </div>
                    <div className="relative">
                      <Mail className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                      <input
                        type="email"
                        required
                        value={newUserEmail}
                        onChange={e => setNewUserEmail(e.target.value)}
                        placeholder="p.zielinski@szkola.edu.pl"
                        className="w-full pl-8 pr-3 py-2 border border-slate-300 rounded-lg bg-slate-50 font-medium text-slate-900"
                      />
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="font-bold text-slate-700">
                        Hasło startowe <span className="text-red-500">*</span>
                      </label>
                      <button
                        type="button"
                        onClick={handleGeneratePassword}
                        className="text-[10px] text-blue-600 hover:underline font-bold"
                      >
                        Losowe hasło
                      </button>
                    </div>
                    <div className="relative">
                      <Lock className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        required
                        value={newUserPassword}
                        onChange={e => setNewUserPassword(e.target.value)}
                        placeholder="haslo123"
                        className="w-full pl-8 pr-3 py-2 border border-slate-300 rounded-lg bg-slate-50 font-mono text-slate-900"
                      />
                    </div>
                  </div>
                </div>

                {/* Role Specific Fields: Student */}
                {newUserRole === 'student' && (
                  <div className="p-4 bg-blue-50/50 rounded-xl border border-blue-200/80 space-y-3">
                    <div className="font-bold text-blue-900 flex items-center space-x-1.5">
                      <GraduationCap className="w-4 h-4 text-blue-700" />
                      <span>Dane ucznia i oddziału klasowego (automatyczny wpis do dziennika lekcyjnego)</span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                      <div>
                        <label className="block text-[11px] font-bold text-slate-600 mb-1">Klasa</label>
                        <select
                          value={newUserClass}
                          onChange={e => setNewUserClass(e.target.value)}
                          className="w-full p-2 border border-slate-300 rounded-lg bg-white"
                        >
                          <option value="3A">Klasa 3A (Profil Mat-Fiz)</option>
                          <option value="3B">Klasa 3B (Profil Humanistyczny)</option>
                          <option value="2A">Klasa 2A</option>
                          <option value="1A">Klasa 1A</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-[11px] font-bold text-slate-600 mb-1">PESEL (opcjonalnie)</label>
                        <input
                          type="text"
                          value={newUserPesel}
                          onChange={e => setNewUserPesel(e.target.value)}
                          placeholder="08250000000"
                          className="w-full p-2 border border-slate-300 rounded-lg bg-white font-mono"
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] font-bold text-slate-600 mb-1">Imię i nazwisko rodzica</label>
                        <input
                          type="text"
                          value={newUserParentName}
                          onChange={e => setNewParentName(e.target.value)}
                          placeholder="np. Anna Zielińska"
                          className="w-full p-2 border border-slate-300 rounded-lg bg-white"
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] font-bold text-slate-600 mb-1">E-mail rodzica</label>
                        <input
                          type="email"
                          value={newUserParentEmail}
                          onChange={e => setNewParentEmail(e.target.value)}
                          placeholder="rodzic@poczta.pl"
                          className="w-full p-2 border border-slate-300 rounded-lg bg-white"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* Role Specific Fields: Teacher */}
                {newUserRole === 'teacher' && (
                  <div className="p-4 bg-emerald-50/50 rounded-xl border border-emerald-200/80 space-y-2">
                    <div className="font-bold text-emerald-900 flex items-center space-x-1.5">
                      <BookOpen className="w-4 h-4 text-emerald-700" />
                      <span>Nauczane przedmioty:</span>
                    </div>
                    <div className="flex flex-wrap gap-2 pt-1">
                      {['Matematyka', 'Język polski', 'Język angielski', 'Fizyka', 'Chemia', 'Biologia', 'Historia', 'Informatyka', 'Geografia', 'Wychowanie fizyczne'].map(sub => (
                        <label
                          key={sub}
                          className={`px-2.5 py-1 rounded-lg border text-xs cursor-pointer transition-all flex items-center space-x-1.5 ${
                            selectedSubjectsTaught.includes(sub)
                              ? 'bg-emerald-600 text-white border-emerald-600 font-bold'
                              : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                          }`}
                        >
                          <input
                            type="checkbox"
                            className="hidden"
                            checked={selectedSubjectsTaught.includes(sub)}
                            onChange={() => {
                              setSelectedSubjectsTaught(prev =>
                                prev.includes(sub) ? prev.filter(s => s !== sub) : [...prev, sub]
                              );
                            }}
                          />
                          <span>{sub}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                )}

                {/* Form Buttons */}
                <div className="flex items-center justify-end space-x-3 pt-3 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setShowCreateUserForm(false)}
                    className="px-4 py-2 border border-slate-300 rounded-lg text-slate-600 hover:bg-slate-50 font-semibold cursor-pointer"
                  >
                    Anuluj
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 bg-[#1a365d] hover:bg-[#152c4d] text-white font-bold rounded-lg transition-colors flex items-center space-x-2 shadow-xs cursor-pointer"
                  >
                    <Check className="w-4 h-4 text-amber-300" />
                    <span>Zapisz i Utwórz Konto</span>
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* USERS LIST TABLE */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-6 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
              <div>
                <h3 className="font-bold text-base text-slate-900">
                  Lista użytkowników dziennika ({filteredUsers.length})
                </h3>
                <p className="text-xs text-slate-500">
                  Wszystkie konta zarejestrowane w instancji placówki
                </p>
              </div>

              <div className="flex items-center space-x-2">
                <div className="relative">
                  <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={userSearchQuery}
                    onChange={e => setUserSearchQuery(e.target.value)}
                    placeholder="Szukaj po nazwisku lub e-mailu..."
                    className="pl-8 pr-3 py-1.5 text-xs border border-slate-300 rounded-lg bg-slate-50 text-slate-900 w-56 sm:w-64"
                  />
                </div>
              </div>
            </div>

            {/* Table */}
            <div className="border border-slate-200 rounded-xl overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="bg-[#1a365d] text-white">
                    <th className="py-2.5 px-4">Użytkownik</th>
                    <th className="py-2.5 px-3">Rola w systemie</th>
                    <th className="py-2.5 px-4">Login / E-mail</th>
                    <th className="py-2.5 px-3">Hasło dostępowe</th>
                    <th className="py-2.5 px-3">Szczegóły</th>
                    <th className="py-2.5 px-3 text-right">Zarządzanie</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredUsers.map(user => {
                    const isCurrent = currentUser?.id === user.id;
                    return (
                      <tr key={user.id} className="hover:bg-slate-50/80 transition-colors">
                        <td className="py-3 px-4">
                          <div className="flex items-center space-x-2.5">
                            <img
                              src={
                                user.avatar ||
                                'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=128&q=80'
                              }
                              alt={user.name}
                              className="w-7 h-7 rounded-full object-cover border border-slate-200 shrink-0"
                            />
                            <div>
                              <div className="font-bold text-slate-900 flex items-center gap-1.5">
                                <span>{user.name}</span>
                                {isCurrent && (
                                  <span className="text-[10px] bg-amber-100 text-amber-800 px-1.5 py-0.2 rounded font-bold">
                                    Ty
                                  </span>
                                )}
                              </div>
                              <div className="text-[10px] text-slate-400">{user.roleTitle}</div>
                            </div>
                          </div>
                        </td>

                        <td className="py-3 px-3">
                          <span
                            className={`px-2 py-0.5 rounded-full text-[11px] font-bold uppercase tracking-wider ${
                              user.role === 'admin'
                                ? 'bg-purple-100 text-purple-800'
                                : user.role === 'teacher'
                                ? 'bg-emerald-100 text-emerald-800'
                                : user.role === 'parent'
                                ? 'bg-amber-100 text-amber-800'
                                : 'bg-blue-100 text-blue-800'
                            }`}
                          >
                            {user.role === 'admin'
                              ? 'Admin'
                              : user.role === 'teacher'
                              ? 'Nauczyciel'
                              : user.role === 'parent'
                              ? 'Rodzic'
                              : 'Uczeń'}
                          </span>
                        </td>

                        <td className="py-3 px-4 font-mono text-[11px] text-slate-700">
                          {user.email}
                        </td>

                        <td className="py-3 px-3">
                          <span className="font-mono text-[11px] bg-slate-100 px-1.5 py-0.5 rounded text-slate-600 border border-slate-200">
                            {user.password || '••••••••'}
                          </span>
                        </td>

                        <td className="py-3 px-3 text-slate-600 text-[11px]">
                          {user.className && <div>Klasa: {user.className}</div>}
                          {user.subjectsTaught && user.subjectsTaught.length > 0 && (
                            <div className="truncate max-w-[140px] text-[10px] text-slate-500">
                              {user.subjectsTaught.join(', ')}
                            </div>
                          )}
                        </td>

                        <td className="py-3 px-3 text-right">
                          <div className="flex items-center justify-end space-x-1.5">
                            <button
                              onClick={() => handleResetUserPassword(user)}
                              className="px-2 py-1 text-[11px] bg-slate-100 hover:bg-slate-200 text-slate-700 rounded border border-slate-200 font-semibold cursor-pointer"
                              title="Zresetuj hasło"
                            >
                              Reset hasła
                            </button>

                            <button
                              onClick={() => {
                                loginAs(user.id);
                                showNotification(`Zalogowano jako: ${user.name}`);
                              }}
                              className="px-2 py-1 text-[11px] bg-blue-50 hover:bg-blue-100 text-blue-700 rounded border border-blue-200 font-semibold cursor-pointer"
                              title="Przełącz na to konto"
                            >
                              Zaloguj
                            </button>

                            {!isCurrent && (
                              <button
                                onClick={() => {
                                  if (window.confirm(`Czy na pewno usunąć konto użytkownika ${user.name}?`)) {
                                    deleteUserByAdmin(user.id);
                                    showNotification(`Usunięto konto ${user.name}.`, 'info');
                                  }
                                }}
                                className="p-1 text-slate-300 hover:text-red-600 rounded cursor-pointer"
                                title="Usuń konto"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          TAB 2: USTAWIENIA SZKOŁY I PLACÓWKI (ZMIANA NAZWY, ROKU, RESET)
         ========================================================================= */}
      {adminTab === 'school' && (
        <div className="space-y-6">
          <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-6 space-y-6">
            <div className="border-b border-slate-200 pb-3 flex items-center justify-between">
              <div>
                <h3 className="font-bold text-base text-slate-900">
                  Konfiguracja Szkoły i Placówki Oświatowej
                </h3>
                <p className="text-xs text-slate-500">
                  Zmiany zapisane w tym formularzu są natychmiast widoczne w nagłówku, ekranie logowania oraz na oficjalnych wydrukach PDF ocen.
                </p>
              </div>
              <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center">
                <Building2 className="w-5 h-5" />
              </div>
            </div>

            {schoolSettingsSaved && (
              <div className="p-3.5 bg-emerald-50 border border-emerald-300 text-emerald-900 rounded-xl text-xs font-semibold flex items-center space-x-2">
                <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Pomyślnie zaktualizowano dane placówki i rok szkolny!</span>
              </div>
            )}

            <form onSubmit={handleSaveSchoolSettings} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="sm:col-span-2">
                  <label className="block font-bold text-slate-700 mb-1">
                    Pełna nazwa szkoły / placówki
                  </label>
                  <input
                    type="text"
                    required
                    value={schoolNameInput}
                    onChange={e => setSchoolNameInput(e.target.value)}
                    placeholder="np. XIV Liceum Ogólnokształcące im. Stanisława Staszica"
                    className="w-full p-2.5 border border-slate-300 rounded-lg bg-slate-50 text-slate-900 font-semibold"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Miejscowość / Miasto
                  </label>
                  <div className="relative">
                    <MapPin className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      required
                      value={schoolCityInput}
                      onChange={e => setSchoolCityInput(e.target.value)}
                      placeholder="np. Warszawa"
                      className="w-full pl-8 pr-3 py-2.5 border border-slate-300 rounded-lg bg-slate-50 text-slate-900 font-medium"
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Bieżący rok szkolny
                  </label>
                  <input
                    type="text"
                    required
                    value={schoolYearInput}
                    onChange={e => setSchoolYearInput(e.target.value)}
                    placeholder="2025/2026"
                    className="w-full p-2.5 border border-slate-300 rounded-lg bg-slate-50 text-slate-900 font-medium"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Bieżący semestr
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setSchoolSemesterInput(1)}
                      className={`py-2 rounded-lg border font-bold transition-all cursor-pointer ${
                        schoolSemesterInput === 1
                          ? 'bg-blue-50 border-blue-600 text-blue-900 shadow-2xs'
                          : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                      }`}
                    >
                      Semestr I
                    </button>
                    <button
                      type="button"
                      onClick={() => setSchoolSemesterInput(2)}
                      className={`py-2 rounded-lg border font-bold transition-all cursor-pointer ${
                        schoolSemesterInput === 2
                          ? 'bg-blue-50 border-blue-600 text-blue-900 shadow-2xs'
                          : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                      }`}
                    >
                      Semestr II (bieżący)
                    </button>
                  </div>
                </div>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-[#1a365d] hover:bg-[#152c4d] text-white font-bold rounded-xl transition-colors flex items-center space-x-2 shadow-sm cursor-pointer"
                >
                  <Save className="w-4 h-4 text-amber-300" />
                  <span>Zapisz ustawienia placówki</span>
                </button>
              </div>
            </form>
          </div>

          {/* DANGER ZONE: RESET TO INITIAL ONBOARDING WIZARD */}
          <div className="bg-red-50/50 rounded-xl border border-red-200 p-6 space-y-3">
            <div className="flex items-center space-x-2 text-red-800 font-bold text-sm">
              <AlertTriangle className="w-5 h-5 text-red-600 shrink-0" />
              <span>Strefa Zaawansowana: Ponowne uruchomienie Kreatora Startowego</span>
            </div>
            <p className="text-xs text-red-700 max-w-2xl leading-relaxed">
              Jeśli chcesz całkowicie zresetować konfigurację i uruchomić od nowa ekran pierwszego uruchomienia (Kreator Placówki i Administratora), użyj poniższego przycisku.
            </p>
            <button
              type="button"
              onClick={() => setShowResetConfirmModal(true)}
              className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-xs font-bold transition-colors flex items-center space-x-2 cursor-pointer"
            >
              <RotateCcw className="w-4 h-4" />
              <span>Zresetuj system i uruchom Kreator Początkowy</span>
            </button>
          </div>

          {/* Confirmation Modal */}
          {showResetConfirmModal && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
              <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 space-y-4 border border-slate-200">
                <div className="flex items-center space-x-3 text-red-600 font-bold text-base">
                  <AlertTriangle className="w-6 h-6" />
                  <span>Potwierdź reset systemu</span>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Czy na pewno chcesz wyczyścić stan bazy danych i przejść ponownie do Kreatora Pierwszego Uruchomienia?
                </p>
                <div className="flex items-center justify-end space-x-3 pt-3 border-t border-slate-100">
                  <button
                    onClick={() => setShowResetConfirmModal(false)}
                    className="px-4 py-2 border border-slate-300 rounded-lg text-xs font-semibold text-slate-700"
                  >
                    Anuluj
                  </button>
                  <button
                    onClick={() => {
                      resetSystemToInitialWizard();
                      setShowResetConfirmModal(false);
                    }}
                    className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-xs font-bold rounded-lg cursor-pointer"
                  >
                    Tak, zresetuj i uruchom Kreator
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* =========================================================================
          TAB 3: ATTENDANCE SHEET
         ========================================================================= */}
      {adminTab === 'attendance' && (
        <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-6 space-y-5">
          <div className="border-b border-slate-200 pb-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h3 className="font-bold text-base text-slate-900">
                Lekcyjny arkusz obecności (Rejestracja frekwencji)
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Wybierz godzinę lekcyjną i przedmiot, a następnie odznacz obecności dla wybranej klasy.
              </p>
            </div>

            <button
              onClick={handleMarkAllPresent}
              className="px-3.5 py-1.5 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200 rounded-lg text-xs font-bold transition-colors self-start md:self-auto flex items-center space-x-1 cursor-pointer"
            >
              <CheckCircle className="w-4 h-4" />
              <span>Zaznacz wszystkich jako obecnych</span>
            </button>
          </div>

          {attendanceSavedNotice && (
            <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-lg text-emerald-800 text-xs font-semibold flex items-center space-x-2">
              <CheckCircle className="w-4 h-4" />
              <span>Frekwencja lekcyjna została pomyślnie zapisana w dzienniku!</span>
            </div>
          )}

          {/* Form Header Controls */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-4 bg-slate-50 rounded-xl border border-slate-200 text-xs">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Data zajęć</label>
              <input
                type="date"
                value={attDate}
                onChange={e => setAttDate(e.target.value)}
                className="w-full p-2 border border-slate-300 rounded bg-white text-slate-900 font-medium"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Godzina lekcyjna</label>
              <select
                value={attHour}
                onChange={e => setAttHour(parseInt(e.target.value))}
                className="w-full p-2 border border-slate-300 rounded bg-white text-slate-900 font-medium"
              >
                {LESSON_BELLS.slice(0, 6).map(b => (
                  <option key={b.hour} value={b.hour}>
                    Lekcja {b.hour} ({b.start} - {b.end})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Przedmiot</label>
              <select
                value={attSubject}
                onChange={e => setAttSubject(e.target.value)}
                className="w-full p-2 border border-slate-300 rounded bg-white text-slate-900 font-medium"
              >
                {subjects.map(s => (
                  <option key={s.id} value={s.name}>
                    {s.name} ({s.teacherName})
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Table */}
          <form onSubmit={handleSaveWholeClassAttendance}>
            <div className="border border-slate-200 rounded-xl overflow-hidden mb-4">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="bg-[#1a365d] text-white">
                    <th className="py-2.5 px-3 w-12 text-center">Nr</th>
                    <th className="py-2.5 px-4">Uczeń</th>
                    <th className="py-2.5 px-4 text-center">Status frekwencji</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {students.map(st => {
                    const currentStatus = attStatusMap[st.id] || 'obecny';
                    return (
                      <tr key={st.id} className="hover:bg-slate-50 transition-colors">
                        <td className="py-2 px-3 text-center font-bold text-slate-400">
                          {st.numberInJournal}
                        </td>
                        <td className="py-2 px-4 font-semibold text-slate-800">
                          {st.lastName} {st.firstName}
                        </td>
                        <td className="py-2 px-4">
                          <div className="flex items-center justify-center space-x-1 sm:space-x-2">
                            {[
                              { id: 'obecny', label: '● Obecny', color: 'bg-emerald-50 text-emerald-700 border-emerald-300' },
                              { id: 'nieobecny', label: '✕ Nieobecny', color: 'bg-red-50 text-red-700 border-red-300' },
                              { id: 'spozniony', label: '○ Spóźniony', color: 'bg-amber-50 text-amber-700 border-amber-300' },
                              { id: 'zwolniony', label: 'Zwolniony', color: 'bg-purple-50 text-purple-700 border-purple-300' },
                            ].map(btn => (
                              <button
                                key={btn.id}
                                type="button"
                                onClick={() => setAttStatusMap(prev => ({ ...prev, [st.id]: btn.id as AttendanceStatus }))}
                                className={`px-2.5 py-1 rounded text-xs font-bold border transition-all cursor-pointer ${
                                  currentStatus === btn.id
                                    ? btn.color + ' ring-2 ring-offset-1 ring-blue-500'
                                    : 'border-slate-200 text-slate-500 hover:bg-slate-100'
                                }`}
                              >
                                {btn.label}
                              </button>
                            ))}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            <div className="flex justify-end">
              <button
                type="submit"
                className="px-6 py-2.5 bg-[#1a365d] hover:bg-[#152c4d] text-white font-bold rounded-xl text-xs transition-colors flex items-center space-x-2 shadow-xs cursor-pointer"
              >
                <Save className="w-4 h-4 text-amber-300" />
                <span>Zapisz frekwencję w dzienniku</span>
              </button>
            </div>
          </form>
        </div>
      )}

      {/* =========================================================================
          TAB 4: GRADES ENTRY
         ========================================================================= */}
      {adminTab === 'grades' && (
        <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-6 space-y-4">
          <div className="border-b border-slate-200 pb-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="font-bold text-base text-slate-900">
                Szybkie wpisywanie ocen cząstkowych
              </h3>
              <p className="text-xs text-slate-500">
                Wybierz ucznia, aby dodać ocenę ze sprawdzianu, kartkówki, odpowiedzi lub aktywności.
              </p>
            </div>

            <button
              onClick={() => {
                setSelectedStudentForGrade(undefined);
                setSelectedSubjectForGrade(undefined);
                setAddGradeModalOpen(true);
              }}
              className="px-4 py-2 bg-[#1a365d] hover:bg-[#152c4d] text-white rounded-lg text-xs font-bold transition-colors flex items-center space-x-2 self-start sm:self-auto cursor-pointer"
            >
              <Plus className="w-4 h-4 text-amber-300" />
              <span>Wstaw ocenę (kreator ocen)</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {students.map(st => {
              const studentGrades = grades.filter(g => g.studentId === st.id);
              return (
                <div
                  key={st.id}
                  className="p-4 rounded-xl border border-slate-200 hover:border-blue-300 hover:shadow-xs transition-all flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-sm text-slate-900">
                        {st.lastName} {st.firstName}
                      </span>
                      <span className="text-[11px] font-semibold text-slate-400">
                        Nr {st.numberInJournal}
                      </span>
                    </div>
                    <div className="text-xs text-slate-500 mt-1">
                      Wpisanych ocen: <strong>{studentGrades.length}</strong>
                    </div>

                    {/* Recent 4 grades */}
                    <div className="flex flex-wrap gap-1 mt-2">
                      {studentGrades.slice(0, 5).map(g => (
                        <span
                          key={g.id}
                          className="px-2 py-0.5 rounded text-xs font-bold bg-slate-100 text-slate-800 border border-slate-200"
                        >
                          {g.value}
                        </span>
                      ))}
                    </div>
                  </div>

                  <button
                    onClick={() => {
                      setSelectedStudentForGrade(st.id);
                      setAddGradeModalOpen(true);
                    }}
                    className="mt-3 px-3 py-1.5 bg-blue-50 text-blue-700 hover:bg-blue-100 rounded-lg text-xs font-semibold transition-colors flex items-center justify-center space-x-1 cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Wstaw ocenę uczniowi</span>
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* =========================================================================
          TAB 5: EXCUSES
         ========================================================================= */}
      {adminTab === 'excuses' && (
        <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-6 space-y-4">
          <div className="border-b border-slate-200 pb-3">
            <h3 className="font-bold text-base text-slate-900">
              Elektroniczne wnioski o usprawiedliwienie nieobecności
            </h3>
            <p className="text-xs text-slate-500">
              Wnioski złożone przez rodziców lub pełnoletnich uczniów klasy 3A oczekujące na akceptację wychowawcy.
            </p>
          </div>

          <div className="space-y-3">
            {pendingExcuses.length === 0 ? (
              <div className="p-8 text-center text-xs text-slate-400">
                Wszystkie wnioski o usprawiedliwienie zostały już rozpatrzone.
              </div>
            ) : (
              pendingExcuses.map(rec => {
                const st = students.find(s => s.id === rec.studentId);
                return (
                  <div
                    key={rec.id}
                    className="p-4 rounded-xl border border-slate-200 bg-amber-50/30 flex flex-col md:flex-row md:items-center justify-between gap-4"
                  >
                    <div>
                      <div className="flex items-center space-x-2">
                        <span className="font-bold text-sm text-slate-900">
                          {st?.lastName} {st?.firstName} ({st?.className})
                        </span>
                        <span className="text-xs text-slate-500">
                          · Data: {rec.date} (lekcja {rec.lessonHour}: {rec.subjectName})
                        </span>
                      </div>
                      <p className="text-xs text-slate-700 mt-1 italic bg-white p-2.5 rounded border border-slate-200">
                        "{rec.excuseReason}"
                      </p>
                      <div className="text-[11px] text-slate-400 mt-1">
                        Złożone przez: {st?.parentName} ({st?.parentEmail})
                      </div>
                    </div>

                    <div className="flex items-center space-x-2 shrink-0">
                      <button
                        onClick={() => respondToExcuse(rec.id, 'accepted')}
                        className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold transition-colors flex items-center space-x-1 cursor-pointer"
                      >
                        <CheckCircle className="w-3.5 h-3.5" />
                        <span>Zaakceptuj</span>
                      </button>
                      <button
                        onClick={() => respondToExcuse(rec.id, 'rejected')}
                        className="px-3.5 py-2 bg-red-100 hover:bg-red-200 text-red-700 rounded-lg text-xs font-bold transition-colors flex items-center space-x-1 cursor-pointer"
                      >
                        <XCircle className="w-3.5 h-3.5" />
                        <span>Odrzuć</span>
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}

      {/* =========================================================================
          TAB 6: CLASS ROSTER (3A)
         ========================================================================= */}
      {adminTab === 'students' && (
        <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-6 space-y-6">
          <div className="border-b border-slate-200 pb-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="font-bold text-base text-slate-900">
                Lista uczniów klasy 3A
              </h3>
              <p className="text-xs text-slate-500">
                Liczba uczniów w oddziale: {students.length}
              </p>
            </div>

            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={studentSearch}
                onChange={e => setStudentSearch(e.target.value)}
                placeholder="Szukaj ucznia..."
                className="pl-8 pr-3 py-1.5 text-xs border border-slate-300 rounded-lg bg-slate-50"
              />
            </div>
          </div>

          {/* Students table */}
          <div className="border border-slate-200 rounded-xl overflow-hidden">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="bg-[#1a365d] text-white">
                  <th className="py-2.5 px-3 w-12 text-center">Nr</th>
                  <th className="py-2.5 px-4">Imię i nazwisko</th>
                  <th className="py-2.5 px-3">PESEL</th>
                  <th className="py-2.5 px-4">Rodzic / Opiekun</th>
                  <th className="py-2.5 px-3 text-right">Akcje</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {students
                  .filter(
                    s =>
                      s.lastName.toLowerCase().includes(studentSearch.toLowerCase()) ||
                      s.firstName.toLowerCase().includes(studentSearch.toLowerCase())
                  )
                  .map(s => (
                    <tr key={s.id} className="hover:bg-slate-50 transition-colors">
                      <td className="py-2.5 px-3 text-center font-bold text-slate-500">
                        {s.numberInJournal}
                      </td>
                      <td className="py-2.5 px-4 font-bold text-slate-900">
                        {s.lastName} {s.firstName}
                      </td>
                      <td className="py-2.5 px-3 text-slate-600 font-mono text-[11px]">
                        {s.pesel}
                      </td>
                      <td className="py-2.5 px-4 text-slate-600">
                        <div>{s.parentName}</div>
                        <div className="text-[10px] text-slate-400">{s.parentEmail}</div>
                      </td>
                      <td className="py-2.5 px-3 text-right">
                        <button
                          onClick={() => {
                            if (window.confirm(`Czy na pewno usunąć ucznia ${s.firstName} ${s.lastName}?`)) {
                              deleteStudent(s.id);
                            }
                          }}
                          className="text-slate-300 hover:text-red-600 p-1 rounded cursor-pointer"
                          title="Usuń ucznia"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>

          {/* Add new student quick roster form */}
          <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
            <h4 className="font-bold text-xs uppercase tracking-wider text-slate-700 mb-3 flex items-center space-x-1.5">
              <Plus className="w-4 h-4 text-blue-600" />
              <span>Szybkie dodanie ucznia do listy oddziału</span>
            </h4>

            <form onSubmit={handleCreateStudentRoster} className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-3 text-xs">
              <input
                type="text"
                required
                placeholder="Imię"
                value={newFirstName}
                onChange={e => setNewFirstName(e.target.value)}
                className="p-2 border border-slate-300 rounded bg-white"
              />
              <input
                type="text"
                required
                placeholder="Nazwisko"
                value={newLastName}
                onChange={e => setNewLastName(e.target.value)}
                className="p-2 border border-slate-300 rounded bg-white"
              />
              <input
                type="text"
                placeholder="Numer PESEL"
                value={newPesel}
                onChange={e => setNewPesel(e.target.value)}
                className="p-2 border border-slate-300 rounded bg-white"
              />
              <input
                type="text"
                placeholder="Imię i nazwisko rodzica"
                value={newParentNameRoster}
                onChange={e => setNewParentNameRoster(e.target.value)}
                className="p-2 border border-slate-300 rounded bg-white"
              />
              <button
                type="submit"
                className="p-2 bg-[#1a365d] hover:bg-[#152c4d] text-white font-bold rounded transition-colors flex items-center justify-center space-x-1 cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Dodaj do klasy</span>
              </button>
            </form>
          </div>
        </div>
      )}

      {/* =========================================================================
          TAB 7: STATS & BACKUP
         ========================================================================= */}
      {adminTab === 'stats' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
              <div className="text-xs font-semibold text-slate-500 uppercase">Średnia szkoły</div>
              <div className="text-3xl font-black text-[#1a365d] mt-2">4.92</div>
              <p className="text-xs text-emerald-600 font-medium mt-1">
                +0.18 w porównaniu do Semestru I
              </p>
            </div>

            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
              <div className="text-xs font-semibold text-slate-500 uppercase">Wskaźnik frekwencji oddziału</div>
              <div className="text-3xl font-black text-emerald-600 mt-2">94.8%</div>
              <p className="text-xs text-slate-500 mt-1">
                Wzorowa dyscyplina szkolna
              </p>
            </div>

            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
              <div className="text-xs font-semibold text-slate-500 uppercase">Uczniowie z wyróżnieniem</div>
              <div className="text-3xl font-black text-amber-500 mt-2">6 z 8</div>
              <p className="text-xs text-slate-500 mt-1">
                Średnia &ge; 4.75 i wzorowe zachowanie
              </p>
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-xs space-y-4">
            <h3 className="font-bold text-base text-slate-900">
              Przywracanie pierwotnych danych demonstracyjnych
            </h3>
            <p className="text-xs text-slate-600 leading-relaxed max-w-2xl">
              Dziennik przechowuje wszystkie dane we wspólnej bazie danych szkoły — są dostępne z każdego urządzenia po zalogowaniu. Reset usuwa wszystkie dane i konta na wszystkich urządzeniach oraz ponownie uruchamia kreator konfiguracji.
            </p>

            <button
              onClick={() => {
                if (window.confirm('Czy na pewno chcesz usunąć wszystkie dane dziennika i uruchomić kreator od nowa? Tej operacji nie można cofnąć.')) {
                  resetToDefaults();
                }
              }}
              className="px-4 py-2.5 bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 rounded-lg text-xs font-bold transition-colors flex items-center space-x-2 cursor-pointer"
            >
              <RotateCcw className="w-4 h-4" />
              <span>Przywróć domyślne dane demonstracyjne</span>
            </button>
          </div>
        </div>
      )}

      {/* =========================================================================
          TAB: ZGŁOSZENIA O RESET HASŁA
         ========================================================================= */}
      {adminTab === 'resets' && (
        <div className="space-y-6">
          <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-6 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-200 pb-3 gap-2">
              <div>
                <h3 className="font-bold text-base text-slate-900 flex items-center space-x-2">
                  <KeyRound className="w-5 h-5 text-blue-700" />
                  <span>Wnioski użytkowników o reset lub nadanie hasła</span>
                </h3>
                <p className="text-xs text-slate-500">
                  Uczniowie i nauczyciele zgłaszają prośbę z ekranu logowania. Tutaj weryfikujesz tożsamość i odsyłasz nowe hasło.
                </p>
              </div>
              <span className="text-xs font-bold bg-amber-100 text-amber-900 px-2.5 py-1 rounded-md border border-amber-300 self-start sm:self-auto">
                Oczekujących wniosków: {pendingResets.length}
              </span>
            </div>

            {passwordResetRequests.length === 0 ? (
              <div className="p-8 text-center bg-slate-50 rounded-xl border border-dashed border-slate-200 text-slate-500 text-xs">
                Brak zarejestrowanych zgłoszeń o reset hasła. Gdy uczeń kliknie "Nie pamiętasz hasła?" na ekranie logowania, wniosek pojawi się tutaj.
              </div>
            ) : (
              <div className="space-y-4">
                {passwordResetRequests.map(req => {
                  const newPass = resetNewPassMap[req.id] || 'Szkola#2026';
                  const note =
                    resetNoteMap[req.id] || 'Hasło zostało pomyślnie zresetowane przez Administratora.';

                  return (
                    <div
                      key={req.id}
                      className={`p-4 rounded-xl border transition-all ${
                        req.status === 'oczekujące'
                          ? 'bg-amber-50/40 border-amber-300 shadow-xs'
                          : req.status === 'zrealizowane'
                          ? 'bg-white border-slate-200'
                          : 'bg-rose-50/30 border-rose-200'
                      }`}
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-slate-200/60">
                        <div>
                          <div className="font-bold text-slate-900 text-sm flex items-center space-x-2">
                            <span>{req.fullName}</span>
                            <span className="text-xs font-normal text-slate-500">
                              ({req.emailOrLogin})
                            </span>
                            <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 border border-slate-200">
                              {req.roleCandidate || 'uczeń'} {req.className ? `· ${req.className}` : ''}
                            </span>
                          </div>
                          <div className="text-[11px] text-slate-400 mt-0.5">
                            Data wniosku: {req.requestDate} · Kod:{' '}
                            <strong className="font-mono text-slate-700">{req.id}</strong>
                          </div>
                        </div>

                        <span
                          className={`text-xs font-bold px-2.5 py-0.5 rounded-full self-start sm:self-auto ${
                            req.status === 'zrealizowane'
                              ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                              : req.status === 'odrzucone'
                              ? 'bg-rose-100 text-rose-800 border border-rose-300'
                              : 'bg-amber-100 text-amber-900 border border-amber-300'
                          }`}
                        >
                          {req.status === 'zrealizowane'
                            ? 'ZREALIZOWANE'
                            : req.status === 'odrzucone'
                            ? 'ODRZUCONE'
                            : 'OCZEKUJE NA DECYZJĘ'}
                        </span>
                      </div>

                      {/* Reason */}
                      <div className="py-2.5 text-xs text-slate-700">
                        <strong className="text-slate-900">Uzasadnienie:</strong>{' '}
                        {req.reasonNote || 'Brak uzasadnienia'}
                      </div>

                      {/* If resolved */}
                      {req.status === 'zrealizowane' && (
                        <div className="mt-2 p-2.5 bg-emerald-50 rounded-lg border border-emerald-200 text-xs text-emerald-950 flex flex-wrap items-center justify-between gap-2">
                          <div>
                            Nadane hasło:{' '}
                            <strong className="font-mono text-slate-900 bg-white px-2 py-0.5 rounded border border-emerald-300">
                              {req.newTemporaryPassword}
                            </strong>
                            {req.adminResponse && (
                              <span className="ml-2 text-slate-600 italic">
                                "{req.adminResponse}"
                              </span>
                            )}
                          </div>
                          <span className="text-[10px] text-slate-500">
                            Rozpatrzone {req.resolvedAt} przez {req.resolvedBy}
                          </span>
                        </div>
                      )}

                      {/* If pending, admin controls */}
                      {req.status === 'oczekujące' && (
                        <div className="mt-3 p-3.5 bg-white rounded-xl border border-amber-200 space-y-3">
                          <div className="text-xs font-bold text-slate-800 uppercase tracking-wide">
                            Wydaj nowe hasło i odeślij odpowiedź do użytkownika
                          </div>

                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                            <div>
                              <div className="flex items-center justify-between mb-1">
                                <label className="font-bold text-slate-700">
                                  Nowe hasło dla użytkownika
                                </label>
                                <button
                                  type="button"
                                  onClick={() =>
                                    setResetNewPassMap(prev => ({
                                      ...prev,
                                      [req.id]: 'Edu' + Math.floor(1000 + Math.random() * 9000) + '!',
                                    }))
                                  }
                                  className="text-[10px] text-blue-600 hover:underline font-bold"
                                >
                                  Generuj inne hasło
                                </button>
                              </div>
                              <input
                                type="text"
                                value={newPass}
                                onChange={e =>
                                  setResetNewPassMap(prev => ({ ...prev, [req.id]: e.target.value }))
                                }
                                className="w-full p-2 border border-slate-300 rounded-lg font-mono font-bold bg-slate-50"
                              />
                            </div>

                            <div>
                              <label className="block font-bold text-slate-700 mb-1">
                                Wiadomość zwrotna od Dyrekcji
                              </label>
                              <input
                                type="text"
                                value={note}
                                onChange={e =>
                                  setResetNoteMap(prev => ({ ...prev, [req.id]: e.target.value }))
                                }
                                className="w-full p-2 border border-slate-300 rounded-lg bg-slate-50"
                              />
                            </div>
                          </div>

                          <div className="flex items-center justify-end space-x-2 pt-2">
                            <button
                              type="button"
                              onClick={() => {
                                resolvePasswordResetRequest(req.id, {
                                  newPassword: '',
                                  adminResponse: 'Wniosek odrzucony przez Administratora.',
                                  approved: false,
                                });
                                showNotification('Wniosek o reset hasła został odrzucony.', 'info');
                              }}
                              className="px-3 py-1.5 text-xs text-rose-700 hover:bg-rose-50 border border-rose-200 rounded-lg font-semibold cursor-pointer"
                            >
                              Odrzuć wniosek
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                resolvePasswordResetRequest(req.id, {
                                  newPassword: newPass,
                                  adminResponse: note,
                                  approved: true,
                                });
                                showNotification(
                                  `Ustawiono nowe hasło "${newPass}" dla ${req.fullName}.`
                                );
                              }}
                              className="px-4 py-1.5 text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg shadow-sm flex items-center space-x-1 cursor-pointer"
                            >
                              <Check className="w-3.5 h-3.5" />
                              <span>Zatwierdź i prześlij odpowiedź</span>
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Add Grade Modal */}
      <AddGradeModal
        isOpen={addGradeModalOpen}
        onClose={() => setAddGradeModalOpen(false)}
        defaultStudentId={selectedStudentForGrade}
        defaultSubjectId={selectedSubjectForGrade}
      />
    </div>
  );
};
