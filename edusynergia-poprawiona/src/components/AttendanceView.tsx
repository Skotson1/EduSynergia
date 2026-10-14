import React, { useState } from 'react';
import { useJournal } from '../context/JournalContext';
import { AttendanceRecord, AttendanceStatus, Student } from '../types';
import { LESSON_BELLS } from '../data/initialData';
import {
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  FileCheck,
  Calendar,
  Send,
  User,
  Info,
  Check,
  X,
  FileText,
  Users,
  Shield,
  Save,
  CheckCheck,
  RotateCcw,
  Sparkles,
  ClipboardList,
} from 'lucide-react';

export const AttendanceView: React.FC = () => {
  const {
    currentUser,
    students,
    subjects,
    attendance,
    requestExcuse,
    respondToExcuse,
    getAttendanceStats,
    saveClassAttendanceRollCall,
  } = useJournal();

  const isStudentOrParent = currentUser?.role === 'student' || currentUser?.role === 'parent';
  const isTeacherOrAdmin = currentUser?.role === 'admin' || currentUser?.role === 'teacher';

  // Active student selection (strictly locked if student/parent)
  const [selectedStudentId, setSelectedStudentId] = useState<string>(() => {
    if (isStudentOrParent && currentUser?.studentId) {
      return currentUser.studentId;
    }
    return students[0]?.id || 'st_1';
  });

  const activeStudentId = isStudentOrParent && currentUser?.studentId ? currentUser.studentId : selectedStudentId;
  const currentStudent = students.find(s => s.id === activeStudentId) || students[0];

  const [activeTab, setActiveTab] = useState<'rollcall' | 'grid' | 'absences' | 'excuses'>('rollcall');
  const [excuseModalOpen, setExcuseModalOpen] = useState(false);
  const [selectedRecordForExcuse, setSelectedRecordForExcuse] = useState<AttendanceRecord | null>(null);
  const [excuseReasonText, setExcuseReasonText] = useState('');
  const [rollCallToast, setRollCallToast] = useState<string | null>(null);

  // --- ROLL CALL / LEKCYJNA LISTA OBECNOŚCI STATE ---
  const [rollCallDate, setRollCallDate] = useState<string>('2026-04-10');
  const [rollCallClass, setRollCallClass] = useState<string>(() => students[0]?.className || 'Klasa 4');
  const [rollCallHour, setRollCallHour] = useState<number>(1);
  const [rollCallSubject, setRollCallSubject] = useState<string>('Matematyka');
  const [rollCallLessonTopic, setRollCallLessonTopic] = useState<string>('Rachunek prawdopodobieństwa - własności miary probabilistycznej');

  // Filter students belonging to chosen class
  const classStudents = students.filter(s => s.className === rollCallClass);

  // Initialized roll call statuses for each student
  const [studentRollCallState, setStudentRollCallState] = useState<
    Record<string, { status: AttendanceStatus; note: string }>
  >(() => {
    const initialMap: Record<string, { status: AttendanceStatus; note: string }> = {};
    for (const st of students) {
      // Check existing record
      const existing = attendance.find(
        a => a.studentId === st.id && a.date === '2026-04-10' && a.lessonHour === 3
      );
      initialMap[st.id] = {
        status: existing ? existing.status : 'obecny',
        note: existing?.excuseReason || '',
      };
    }
    return initialMap;
  });

  // When hour, date or class changes, reload from attendance records
  const handleRollCallConfigChange = (newDate: string, newHour: number, newClass: string, newSubject: string) => {
    setRollCallDate(newDate);
    setRollCallHour(newHour);
    setRollCallClass(newClass);
    setRollCallSubject(newSubject);

    const updatedMap: Record<string, { status: AttendanceStatus; note: string }> = {};
    for (const st of students) {
      const existing = attendance.find(
        a => a.studentId === st.id && a.date === newDate && a.lessonHour === newHour
      );
      updatedMap[st.id] = {
        status: existing ? existing.status : 'obecny',
        note: existing?.excuseReason || '',
      };
    }
    setStudentRollCallState(updatedMap);
  };

  const handleSetStudentStatus = (studentId: string, status: AttendanceStatus) => {
    if (!isTeacherOrAdmin) return;
    setStudentRollCallState(prev => ({
      ...prev,
      [studentId]: {
        ...prev[studentId],
        status,
      },
    }));
  };

  const handleSetAllStudentsStatus = (status: AttendanceStatus) => {
    if (!isTeacherOrAdmin) return;
    setStudentRollCallState(prev => {
      const updated = { ...prev };
      for (const st of classStudents) {
        updated[st.id] = {
          ...updated[st.id],
          status,
        };
      }
      return updated;
    });
  };

  const handleSaveRollCall = () => {
    if (!isTeacherOrAdmin) return;
    const recordsToSave = classStudents.map(st => ({
      studentId: st.id,
      status: studentRollCallState[st.id]?.status || 'obecny',
      note: studentRollCallState[st.id]?.note || undefined,
    }));

    saveClassAttendanceRollCall({
      className: rollCallClass,
      date: rollCallDate,
      lessonHour: rollCallHour,
      subjectName: rollCallSubject,
      teacherName: currentUser?.name || 'Nauczyciel prowadzący',
      records: recordsToSave,
    });

    setRollCallToast(`Pomyślnie zapisano listę obecności dla klasy ${rollCallClass} (${rollCallSubject}, godz. ${rollCallHour})!`);
    setTimeout(() => setRollCallToast(null), 4000);
  };

  const stats = currentStudent ? getAttendanceStats(currentStudent.id) : { rate: 100, total: 0, present: 0, excused: 0, unexcused: 0, late: 0 };
  const studentRecords = attendance.filter(r => r.studentId === currentStudent?.id);

  // Status visual badge definitions
  const statusBadges: Record<AttendanceStatus, { label: string; icon: string; bg: string; text: string; border: string }> = {
    obecny: { label: 'Obecny (OB)', icon: '●', bg: 'bg-emerald-50 hover:bg-emerald-100', text: 'text-emerald-800 font-bold', border: 'border-emerald-300' },
    nieobecny: { label: 'Nieobecny (NB)', icon: '✕', bg: 'bg-rose-50 hover:bg-rose-100', text: 'text-rose-800 font-bold', border: 'border-rose-300' },
    usprawiedliwiony: { label: 'Usprawiedliwiony (US)', icon: '✓', bg: 'bg-blue-50 hover:bg-blue-100', text: 'text-blue-800 font-bold', border: 'border-blue-300' },
    spozniony: { label: 'Spóźniony (SP)', icon: 'sp', bg: 'bg-amber-50 hover:bg-amber-100', text: 'text-amber-800 font-bold', border: 'border-amber-300' },
    zwolniony: { label: 'Zwolniony (ZW)', icon: 'zw', bg: 'bg-purple-50 hover:bg-purple-100', text: 'text-purple-800 font-bold', border: 'border-purple-300' },
  };

  // Sample week dates (Mon 2026-04-06 to Fri 2026-04-10)
  const weekDays = [
    { name: 'Poniedziałek', date: '2026-04-06' },
    { name: 'Wtorek', date: '2026-04-07' },
    { name: 'Środa', date: '2026-04-08' },
    { name: 'Czwartek', date: '2026-04-09' },
    { name: 'Piątek', date: '2026-04-10' },
  ];

  const handleOpenExcuseModal = (rec: AttendanceRecord) => {
    setSelectedRecordForExcuse(rec);
    setExcuseReasonText(rec.excuseReason || '');
    setExcuseModalOpen(true);
  };

  const handleSendExcuse = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedRecordForExcuse && excuseReasonText.trim()) {
      requestExcuse(selectedRecordForExcuse.id, excuseReasonText.trim());
      setExcuseModalOpen(false);
      setSelectedRecordForExcuse(null);
      setExcuseReasonText('');
    }
  };

  // All unexcused/pending excuses
  const absencesAndLates = studentRecords.filter(
    r => r.status === 'nieobecny' || r.status === 'spozniony' || r.status === 'usprawiedliwiony'
  );

  // Roll call summary statistics for the current selected lesson
  const rollCallPresentCount = classStudents.filter(s => (studentRollCallState[s.id]?.status || 'obecny') === 'obecny').length;
  const rollCallAbsentCount = classStudents.filter(s => studentRollCallState[s.id]?.status === 'nieobecny').length;
  const rollCallLateCount = classStudents.filter(s => studentRollCallState[s.id]?.status === 'spozniony').length;
  const rollCallExcusedCount = classStudents.filter(s => studentRollCallState[s.id]?.status === 'usprawiedliwiony').length;
  const rollCallRate = classStudents.length > 0 ? Math.round(((rollCallPresentCount + rollCallLateCount + rollCallExcusedCount) / classStudents.length) * 100) : 100;

  if (students.length === 0) {
    return (
      <div className="bg-white rounded-2xl border border-slate-200 p-8 sm:p-12 text-center max-w-lg mx-auto my-12 shadow-xs">
        <div className="w-16 h-16 rounded-2xl bg-blue-50 text-blue-700 flex items-center justify-center mx-auto mb-4 border border-blue-100">
          <ClipboardList className="w-8 h-8" />
        </div>
        <h3 className="text-base font-bold text-slate-900 mb-1.5">
          Brak uczniów w dzienniku lekcyjnym
        </h3>
        <p className="text-xs text-slate-500 mb-6 leading-relaxed">
          Lista obecności wymaga dodania uczniów do placówki. Jako Administrator możesz w Panelu Administratora utworzyć oddziały (np. <strong>Klasa 4</strong>, <strong>Klasa 5</strong>) i dodać uczniów do ewidencji.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
      {rollCallToast && (
        <div className="p-3.5 bg-emerald-50 border border-emerald-300 text-emerald-900 text-xs font-semibold rounded-xl flex items-center justify-between shadow-sm animate-in fade-in duration-200">
          <div className="flex items-center space-x-2">
            <CheckCheck className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{rollCallToast}</span>
          </div>
          <button onClick={() => setRollCallToast(null)} className="text-emerald-700 hover:text-emerald-950 font-bold ml-2">
            ✕
          </button>
        </div>
      )}

      {/* Top Filter and View Mode Switcher */}
      <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/90 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-3">
          {/* Student selection - Strictly locked for students/parents */}
          {isTeacherOrAdmin ? (
            <div className="flex items-center space-x-2">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Uczeń:</span>
              <select
                value={activeStudentId}
                onChange={e => setSelectedStudentId(e.target.value)}
                className="text-xs font-extrabold text-[#0b192c] bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 focus:ring-2 focus:ring-blue-600 focus:outline-none"
              >
                {students.map(s => (
                  <option key={s.id} value={s.id}>
                    {s.numberInJournal}. {s.lastName} {s.firstName} ({s.className})
                  </option>
                ))}
              </select>
            </div>
          ) : (
            <div className="flex items-center space-x-2 px-3 py-1.5 rounded-xl bg-slate-100 border border-slate-200 text-xs font-bold text-[#0b192c]">
              <Shield className="w-3.5 h-3.5 text-blue-600" />
              <span>Profil ucznia: {currentStudent?.firstName} {currentStudent?.lastName} (klasa {currentStudent?.className}, nr {currentStudent?.numberInJournal})</span>
            </div>
          )}

          {/* Segmented Tab Bar */}
          <div className="flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200 text-xs font-semibold">
            <button
              onClick={() => setActiveTab('rollcall')}
              className={`px-3 py-1.5 rounded-lg transition-all flex items-center space-x-1.5 ${
                activeTab === 'rollcall'
                  ? 'bg-white text-[#0b192c] shadow-xs font-bold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <ClipboardList className="w-3.5 h-3.5 text-amber-500" />
              <span>Lista Obecności (Lekcyjna)</span>
            </button>
            <button
              onClick={() => setActiveTab('grid')}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                activeTab === 'grid'
                  ? 'bg-white text-[#0b192c] shadow-xs font-bold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Tygodniowy arkusz frekwencji
            </button>
            <button
              onClick={() => setActiveTab('absences')}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                activeTab === 'absences'
                  ? 'bg-white text-[#0b192c] shadow-xs font-bold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Nieobecności i spóźnienia ({absencesAndLates.length})
            </button>
            <button
              onClick={() => setActiveTab('excuses')}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                activeTab === 'excuses'
                  ? 'bg-white text-[#0b192c] shadow-xs font-bold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Wnioski o usprawiedliwienie
            </button>
          </div>
        </div>
      </div>

      {/* Attendance Stats Overview Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
          <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Frekwencja ogólna</div>
          <div className="text-2xl font-black text-[#0b192c] mt-1">{stats.rate}%</div>
          <div className="text-[10px] text-slate-400 mt-0.5">{stats.present}/{stats.total} lekcji</div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
          <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Obecności</div>
          <div className="text-2xl font-black text-emerald-600 mt-1">{stats.present}</div>
          <div className="text-[10px] text-slate-400 mt-0.5">godzin lekcyjnych</div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
          <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Usprawiedliwione</div>
          <div className="text-2xl font-black text-blue-600 mt-1">{stats.excused}</div>
          <div className="text-[10px] text-slate-400 mt-0.5">godzin zatwierdzonych</div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
          <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Nieusprawiedliwione</div>
          <div className="text-2xl font-black text-rose-600 mt-1">{stats.unexcused}</div>
          <div className="text-[10px] text-slate-400 mt-0.5">wymaga usprawiedliwienia</div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
          <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Spóźnienia</div>
          <div className="text-2xl font-black text-amber-600 mt-1">{stats.late}</div>
          <div className="text-[10px] text-slate-400 mt-0.5">odnotowanych spóźnień</div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
          <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Status frekwencji</div>
          <div className="text-sm font-black text-emerald-700 mt-2 flex items-center space-x-1">
            <CheckCircle className="w-4 h-4 text-emerald-600" />
            <span>Powyżej normy 50%</span>
          </div>
          <div className="text-[10px] text-slate-400 mt-0.5">Brak zagrożenia NK</div>
        </div>
      </div>

      {/* TAB 1: LEKCYJNA LISTA OBECNOŚCI (CLASS ROLL CALL REGISTER) */}
      {activeTab === 'rollcall' && (
        <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm overflow-hidden">
          {/* Roll call configuration bar */}
          <div className="p-5 border-b border-slate-200 bg-gradient-to-r from-slate-50 to-blue-50/40">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
              <div>
                <h3 className="text-base font-extrabold text-[#0b192c] flex items-center space-x-2">
                  <ClipboardList className="w-5 h-5 text-blue-700" />
                  <span>Dziennik Lekcyjny: Sprawdzanie i Rejestr Obecności</span>
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Wybierz klasę, godzinę lekcyjną i oznacz obecność każdego ucznia. Wyniki zapisują się w oficjalnym rejestrze.
                </p>
              </div>

              {/* Action buttons for roll call */}
              {isTeacherOrAdmin && (
                <div className="flex flex-wrap items-center gap-2">
                  <button
                    type="button"
                    onClick={() => handleSetAllStudentsStatus('obecny')}
                    className="px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-300 font-bold text-xs rounded-xl transition-colors flex items-center space-x-1 shadow-2xs"
                  >
                    <CheckCheck className="w-3.5 h-3.5" />
                    <span>Wszyscy obecni (1-klik)</span>
                  </button>
                  <button
                    type="button"
                    onClick={handleSaveRollCall}
                    className="px-4 py-1.5 bg-blue-700 hover:bg-blue-800 text-white font-extrabold text-xs rounded-xl transition-colors shadow-sm flex items-center space-x-1.5 cursor-pointer active:scale-98"
                  >
                    <Save className="w-3.5 h-3.5" />
                    <span>Zapisz listę obecności w dzienniku</span>
                  </button>
                </div>
              )}
            </div>

            {/* Lesson parameters grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 mt-4 pt-4 border-t border-slate-200/60">
              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Data zajęć:</label>
                <input
                  type="date"
                  value={rollCallDate}
                  onChange={e => handleRollCallConfigChange(e.target.value, rollCallHour, rollCallClass, rollCallSubject)}
                  className="w-full text-xs font-bold text-slate-800 bg-white border border-slate-300 rounded-xl px-3 py-1.5 focus:ring-2 focus:ring-blue-600 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Oddział / Klasa:</label>
                <select
                  value={rollCallClass}
                  onChange={e => handleRollCallConfigChange(rollCallDate, rollCallHour, e.target.value, rollCallSubject)}
                  className="w-full text-xs font-bold text-slate-800 bg-white border border-slate-300 rounded-xl px-3 py-1.5 focus:ring-2 focus:ring-blue-600 focus:outline-none"
                >
                  <option value="3A">Klasa 3A (Mat-Fiz-Inf)</option>
                  <option value="3B">Klasa 3B (Bio-Chem)</option>
                  <option value="2A">Klasa 2A (Humanistyczna)</option>
                </select>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Godzina lekcyjna:</label>
                <select
                  value={rollCallHour}
                  onChange={e => handleRollCallConfigChange(rollCallDate, Number(e.target.value), rollCallClass, rollCallSubject)}
                  className="w-full text-xs font-bold text-slate-800 bg-white border border-slate-300 rounded-xl px-3 py-1.5 focus:ring-2 focus:ring-blue-600 focus:outline-none"
                >
                  {LESSON_BELLS.map(bell => (
                    <option key={bell.hour} value={bell.hour}>
                      Lekcja {bell.hour} ({bell.start} - {bell.end})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Przedmiot:</label>
                <select
                  value={rollCallSubject}
                  onChange={e => handleRollCallConfigChange(rollCallDate, rollCallHour, rollCallClass, e.target.value)}
                  className="w-full text-xs font-bold text-slate-800 bg-white border border-slate-300 rounded-xl px-3 py-1.5 focus:ring-2 focus:ring-blue-600 focus:outline-none"
                >
                  {subjects.map(s => (
                    <option key={s.id} value={s.name}>
                      {s.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Lesson topic input */}
            <div className="mt-3">
              <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">
                Temat lekcji:
              </label>
              <input
                type="text"
                value={rollCallLessonTopic}
                onChange={e => setRollCallLessonTopic(e.target.value)}
                placeholder="Wpisz temat zrealizowanej jednostki lekcyjnej..."
                className="w-full text-xs px-3 py-1.5 border border-slate-300 rounded-xl bg-white focus:ring-2 focus:ring-blue-600 focus:outline-none font-medium text-slate-900"
              />
            </div>
          </div>

          {/* Roll Call Summary Bar */}
          <div className="px-5 py-3 bg-slate-50 border-b border-slate-200/80 flex flex-wrap items-center justify-between text-xs font-semibold text-slate-600 gap-2">
            <div className="flex items-center space-x-4">
              <span>Liczba uczniów: <strong className="text-slate-900">{classStudents.length}</strong></span>
              <span className="text-emerald-700">Obecni: <strong>{rollCallPresentCount}</strong></span>
              <span className="text-rose-700">Nieobecni: <strong>{rollCallAbsentCount}</strong></span>
              <span className="text-amber-700">Spóźnieni: <strong>{rollCallLateCount}</strong></span>
              <span className="text-blue-700">Usprawiedliwieni: <strong>{rollCallExcusedCount}</strong></span>
            </div>
            <div className="flex items-center space-x-1.5 font-bold text-[#0b192c]">
              <span>Frekwencja na lekcji:</span>
              <span className="px-2 py-0.5 rounded-full bg-blue-100 text-blue-900">{rollCallRate}%</span>
            </div>
          </div>

          {/* Table of students */}
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-100/70 border-b border-slate-200 text-slate-600 uppercase tracking-wider text-[10px] font-bold">
                  <th className="py-2.5 px-3 w-12 text-center">Nr</th>
                  <th className="py-2.5 px-4">Uczeń (Imię i Nazwisko)</th>
                  <th className="py-2.5 px-4 min-w-[340px]">Status Obecności</th>
                  <th className="py-2.5 px-4">Notatka / Minuty</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {classStudents.map(student => {
                  const studentState = studentRollCallState[student.id] || { status: 'obecny', note: '' };
                  const currentStatus = studentState.status;

                  return (
                    <tr
                      key={student.id}
                      className={`hover:bg-slate-50/70 transition-colors ${
                        student.id === activeStudentId ? 'bg-blue-50/40' : ''
                      }`}
                    >
                      <td className="py-3 px-3 text-center font-bold text-slate-500">
                        {student.numberInJournal}
                      </td>

                      <td className="py-3 px-4 font-bold text-slate-900">
                        <div className="flex items-center space-x-2">
                          <span className="w-6 h-6 rounded-full bg-slate-200 text-slate-700 flex items-center justify-center font-bold text-[10px]">
                            {student.firstName[0]}{student.lastName[0]}
                          </span>
                          <span>{student.lastName} {student.firstName}</span>
                        </div>
                      </td>

                      {/* Status selectors */}
                      <td className="py-3 px-4">
                        <div className="flex flex-wrap items-center gap-1.5">
                          {/* Obecny */}
                          <button
                            type="button"
                            disabled={!isTeacherOrAdmin}
                            onClick={() => handleSetStudentStatus(student.id, 'obecny')}
                            className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all border ${
                              currentStatus === 'obecny'
                                ? 'bg-emerald-600 text-white border-emerald-600 shadow-2xs'
                                : 'bg-slate-50 hover:bg-emerald-50 text-slate-600 hover:text-emerald-700 border-slate-200'
                            }`}
                          >
                            ● OB
                          </button>

                          {/* Nieobecny */}
                          <button
                            type="button"
                            disabled={!isTeacherOrAdmin}
                            onClick={() => handleSetStudentStatus(student.id, 'nieobecny')}
                            className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all border ${
                              currentStatus === 'nieobecny'
                                ? 'bg-rose-600 text-white border-rose-600 shadow-2xs'
                                : 'bg-slate-50 hover:bg-rose-50 text-slate-600 hover:text-rose-700 border-slate-200'
                            }`}
                          >
                            ✕ NB
                          </button>

                          {/* Spóźniony */}
                          <button
                            type="button"
                            disabled={!isTeacherOrAdmin}
                            onClick={() => handleSetStudentStatus(student.id, 'spozniony')}
                            className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all border ${
                              currentStatus === 'spozniony'
                                ? 'bg-amber-600 text-white border-amber-600 shadow-2xs'
                                : 'bg-slate-50 hover:bg-amber-50 text-slate-600 hover:text-amber-700 border-slate-200'
                            }`}
                          >
                            🕒 SP
                          </button>

                          {/* Usprawiedliwiony */}
                          <button
                            type="button"
                            disabled={!isTeacherOrAdmin}
                            onClick={() => handleSetStudentStatus(student.id, 'usprawiedliwiony')}
                            className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all border ${
                              currentStatus === 'usprawiedliwiony'
                                ? 'bg-blue-600 text-white border-blue-600 shadow-2xs'
                                : 'bg-slate-50 hover:bg-blue-50 text-slate-600 hover:text-blue-700 border-slate-200'
                            }`}
                          >
                            ✓ US
                          </button>

                          {/* Zwolniony */}
                          <button
                            type="button"
                            disabled={!isTeacherOrAdmin}
                            onClick={() => handleSetStudentStatus(student.id, 'zwolniony')}
                            className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all border ${
                              currentStatus === 'zwolniony'
                                ? 'bg-purple-600 text-white border-purple-600 shadow-2xs'
                                : 'bg-slate-50 hover:bg-purple-50 text-slate-600 hover:text-purple-700 border-slate-200'
                            }`}
                          >
                            🚪 ZW
                          </button>
                        </div>
                      </td>

                      {/* Notes / Minutes input */}
                      <td className="py-3 px-4">
                        {isTeacherOrAdmin ? (
                          <input
                            type="text"
                            value={studentState.note}
                            onChange={e =>
                              setStudentRollCallState(prev => ({
                                ...prev,
                                [student.id]: {
                                  ...prev[student.id],
                                  note: e.target.value,
                                },
                              }))
                            }
                            placeholder="np. spóźnienie 10 min..."
                            className="w-full text-xs px-2.5 py-1 border border-slate-200 rounded-lg bg-slate-50 focus:bg-white focus:ring-1 focus:ring-blue-600 focus:outline-none"
                          />
                        ) : (
                          <span className="text-xs text-slate-500">
                            {studentState.note || '—'}
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 2: TYGODNIOWY ARKUSZ FREKWENCJI (WEEKLY GRID) */}
      {activeTab === 'grid' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="p-4 sm:p-5 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <h3 className="text-base font-extrabold text-[#0b192c]">
                Tygodniowy Arkusz Frekwencji
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Wykaz godzin lekcyjnych dla: <strong>{currentStudent?.firstName} {currentStudent?.lastName}</strong> (Tydzień: 06 - 10 kwietnia 2026 r.)
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-2 text-xs font-medium">
              <span className="flex items-center space-x-1"><span className="text-emerald-600 font-black">●</span> Obecny</span>
              <span className="flex items-center space-x-1"><span className="text-rose-600 font-black">✕</span> Nieobecny</span>
              <span className="flex items-center space-x-1"><span className="text-blue-600 font-black">✓</span> Usprawiedliwiony</span>
              <span className="flex items-center space-x-1"><span className="text-amber-600 font-bold">sp</span> Spóźnienie</span>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-700 font-bold uppercase text-[10px]">
                  <th className="py-3 px-3 w-16 text-center border-r border-slate-200">Godzina</th>
                  {weekDays.map(day => (
                    <th key={day.date} className="py-3 px-3 text-center border-r border-slate-200 last:border-r-0">
                      <div>{day.name}</div>
                      <div className="text-[10px] text-slate-400 font-normal">{day.date}</div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {LESSON_BELLS.slice(0, 6).map(bell => (
                  <tr key={bell.hour} className="hover:bg-slate-50/50">
                    <td className="py-3 px-2 text-center font-bold text-slate-700 bg-slate-50/70 border-r border-slate-200">
                      <div>{bell.hour}</div>
                      <div className="text-[10px] text-slate-400 font-normal">{bell.start}</div>
                    </td>

                    {weekDays.map(day => {
                      const record = attendance.find(
                        r => r.studentId === currentStudent?.id && r.date === day.date && r.lessonHour === bell.hour
                      );

                      if (!record) {
                        return (
                          <td key={day.date} className="py-3 px-2 text-center text-slate-300 border-r border-slate-100 last:border-r-0">
                            —
                          </td>
                        );
                      }

                      const badge = statusBadges[record.status];

                      return (
                        <td
                          key={day.date}
                          className="py-3 px-2 text-center border-r border-slate-100 last:border-r-0"
                        >
                          <div
                            className={`inline-flex flex-col items-center justify-center p-1.5 rounded-lg border text-xs ${badge.bg} ${badge.border} ${badge.text} min-w-[70px] shadow-2xs`}
                            title={`${record.subjectName}: ${badge.label} (${record.excuseReason || 'Brak uwag'})`}
                          >
                            <span className="text-sm font-black">{badge.icon}</span>
                            <span className="text-[9px] truncate max-w-[65px] font-semibold">
                              {record.subjectName}
                            </span>
                          </div>
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 3: NIEOBECNOŚCI I SPÓŹNIENIA (ABSENCES LIST) */}
      {activeTab === 'absences' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="p-4 sm:p-5 border-b border-slate-200 flex justify-between items-center">
            <div>
              <h3 className="text-base font-extrabold text-[#0b192c]">
                Wykaz Godzin Opuszczonych i Spóźnień
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Szczegółowa lista nieobecności dla: <strong>{currentStudent?.firstName} {currentStudent?.lastName}</strong>
              </p>
            </div>
            <span className="text-xs font-bold text-slate-500">
              Łącznie wpisów: {absencesAndLates.length}
            </span>
          </div>

          <div className="divide-y divide-slate-100">
            {absencesAndLates.length === 0 ? (
              <div className="p-12 text-center text-slate-400 text-xs">
                Wzorowa frekwencja! Brak nieobecności i spóźnień w rejestrze.
              </div>
            ) : (
              absencesAndLates.map(rec => {
                const badge = statusBadges[rec.status];
                return (
                  <div
                    key={rec.id}
                    className="p-4 hover:bg-slate-50/70 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                  >
                    <div className="flex items-start space-x-3">
                      <span className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold shrink-0 border ${badge.bg} ${badge.border} ${badge.text}`}>
                        {badge.icon}
                      </span>
                      <div>
                        <div className="flex items-center space-x-2">
                          <span className="font-bold text-slate-900 text-xs">{rec.subjectName}</span>
                          <span className="text-[11px] text-slate-500">· Lekcja {rec.lessonHour}</span>
                          <span className={`text-[10px] font-bold px-2 py-0.2 rounded-full border ${badge.bg} ${badge.text} ${badge.border}`}>
                            {badge.label}
                          </span>
                        </div>
                        <div className="text-xs text-slate-500 mt-1 flex items-center space-x-2">
                          <Calendar className="w-3.5 h-3.5" />
                          <span>Data: {rec.date}</span>
                          {rec.excuseReason && (
                            <>
                              <span>·</span>
                              <span className="italic text-slate-700">Powód: {rec.excuseReason}</span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>

                    <div>
                      {rec.status === 'nieobecny' && (!rec.excuseStatus || rec.excuseStatus === 'none') && (
                        <button
                          onClick={() => handleOpenExcuseModal(rec)}
                          className="px-3 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 text-xs font-bold rounded-xl transition-colors cursor-pointer"
                        >
                          Zgłoś wniosek o usprawiedliwienie
                        </button>
                      )}
                      {rec.excuseStatus === 'pending' && (
                        <span className="px-2.5 py-1 bg-amber-50 text-amber-800 border border-amber-200 rounded-lg text-xs font-semibold">
                          Oczekuje na akceptację
                        </span>
                      )}
                      {rec.excuseStatus === 'accepted' && (
                        <span className="px-2.5 py-1 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-lg text-xs font-semibold">
                          Usprawiedliwione przez wychowawcę
                        </span>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}

      {/* TAB 4: WNIOSKI O USPRAWIEDLIWIENIE */}
      {activeTab === 'excuses' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="p-4 sm:p-5 border-b border-slate-200">
            <h3 className="text-base font-extrabold text-[#0b192c]">
              Wnioski o Usprawiedliwienie Nieobecności
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Zgłoszenia składane przez rodziców i uczniów, podlegające weryfikacji przez wychowawcę klasy.
            </p>
          </div>

          <div className="divide-y divide-slate-100">
            {attendance
              .filter(r => r.excuseReason)
              .map(rec => (
                <div key={rec.id} className="p-4 hover:bg-slate-50 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <div className="flex items-center space-x-2">
                      <span className="font-bold text-slate-900 text-xs">{rec.subjectName}</span>
                      <span className="text-[11px] text-slate-500">· Data: {rec.date}, lekcja {rec.lessonHour}</span>
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          rec.excuseStatus === 'accepted'
                            ? 'bg-emerald-100 text-emerald-800'
                            : rec.excuseStatus === 'rejected'
                            ? 'bg-rose-100 text-rose-800'
                            : 'bg-amber-100 text-amber-800'
                        }`}
                      >
                        {rec.excuseStatus === 'accepted' ? 'Zaakceptowane' : rec.excuseStatus === 'rejected' ? 'Odrzucone' : 'Oczekujące'}
                      </span>
                    </div>
                    <p className="text-xs text-slate-700 mt-1 italic">
                      "{rec.excuseReason}"
                    </p>
                  </div>

                  {isTeacherOrAdmin && rec.excuseStatus === 'pending' && (
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => respondToExcuse(rec.id, 'accepted')}
                        className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-colors"
                      >
                        Zaakceptuj
                      </button>
                      <button
                        onClick={() => respondToExcuse(rec.id, 'rejected')}
                        className="px-3 py-1.5 bg-rose-100 hover:bg-rose-200 text-rose-700 rounded-xl text-xs font-bold transition-colors"
                      >
                        Odrzuć
                      </button>
                    </div>
                  )}
                </div>
              ))}
          </div>
        </div>
      )}

      {/* Excuse Modal */}
      {excuseModalOpen && selectedRecordForExcuse && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden border border-slate-200">
            <div className="bg-[#0b192c] text-white px-5 py-4 flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <FileCheck className="w-5 h-5 text-amber-300" />
                <h3 className="text-base font-bold">Wniosek o usprawiedliwienie</h3>
              </div>
              <button
                onClick={() => setExcuseModalOpen(false)}
                className="text-slate-300 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSendExcuse} className="p-5 space-y-4">
              <div className="p-3 bg-slate-50 rounded-xl text-xs space-y-1 border border-slate-200">
                <div>
                  <strong>Przedmiot:</strong> {selectedRecordForExcuse.subjectName}
                </div>
                <div>
                  <strong>Data i godzina:</strong> {selectedRecordForExcuse.date}, lekcja {selectedRecordForExcuse.lessonHour}
                </div>
                <div>
                  <strong>Wychowawca klasy:</strong> mgr Tomasz Kowalczyk
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Uzasadnienie nieobecności
                </label>
                <textarea
                  required
                  rows={3}
                  value={excuseReasonText}
                  onChange={e => setExcuseReasonText(e.target.value)}
                  placeholder="np. Wizyta u lekarza specjalisty / przeziębienie i zwolnienie lekarskie"
                  className="w-full text-xs p-2.5 border border-slate-300 rounded-xl focus:ring-1 focus:ring-blue-500 text-slate-900"
                />
              </div>

              <div className="flex justify-end space-x-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setExcuseModalOpen(false)}
                  className="px-3 py-1.5 text-xs text-slate-600 hover:bg-slate-100 rounded-xl font-semibold"
                >
                  Anuluj
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 text-xs font-bold bg-blue-700 hover:bg-blue-800 text-white rounded-xl flex items-center space-x-1"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Wyślij wniosek do wychowawcy</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
