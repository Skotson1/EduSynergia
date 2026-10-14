import React, { useState } from 'react';
import { useJournal } from '../context/JournalContext';
import { Grade, Subject, Student } from '../types';
import { GradeDetailModal } from './GradeDetailModal';
import { AddGradeModal } from './AddGradeModal';
import {
  GraduationCap,
  Plus,
  Search,
  Printer,
  HelpCircle,
  TrendingUp,
  Award,
  ChevronDown,
  Info,
  SlidersHorizontal,
  FileDown,
  CheckCircle2,
  Calculator,
  Shield,
  Sparkles,
} from 'lucide-react';
import { generateGradesPdf } from '../utils/exportGradesPdf';

export const GradesView: React.FC = () => {
  const {
    currentUser,
    students,
    subjects,
    grades,
    systemConfig,
    getSubjectAverage,
    getOverallAverage,
  } = useJournal();

  const isStudentOrParent = currentUser?.role === 'student' || currentUser?.role === 'parent';
  const isTeacherOrAdmin = currentUser?.role === 'admin' || currentUser?.role === 'teacher';

  // Active student selection (default to student's own ID or first student)
  const [selectedStudentId, setSelectedStudentId] = useState<string>(() => {
    if (isStudentOrParent && currentUser?.studentId) {
      return currentUser.studentId;
    }
    return students[0]?.id || 'st_1';
  });

  const activeStudentId = isStudentOrParent && currentUser?.studentId ? currentUser.studentId : selectedStudentId;

  const [activeSemesterTab, setActiveSemesterTab] = useState<'all' | 'sem1' | 'sem2'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedGrade, setSelectedGrade] = useState<Grade | null>(null);
  const [addGradeModalOpen, setAddGradeModalOpen] = useState(false);
  const [showLegend, setShowLegend] = useState(false);
  const [simulatorOpen, setSimulatorOpen] = useState(false);

  // Simulator state
  const [simSubjectId, setSimSubjectId] = useState<string>(() => subjects[0]?.id || 'sub_mat');
  const [simGradeVal, setSimGradeVal] = useState<number>(5);
  const [simWeight, setSimWeight] = useState<number>(3);
  const [simulatedEntries, setSimulatedEntries] = useState<Array<{ subjectId: string; value: number; weight: number }>>([]);

  const currentStudent = students.find(s => s.id === activeStudentId) || students[0];

  const filteredSubjects = subjects.filter(sub =>
    sub.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const overallAvgSem1 = currentStudent ? getOverallAverage(currentStudent.id, 1) : null;
  const overallAvgSem2 = currentStudent ? getOverallAverage(currentStudent.id, 2) : null;
  const overallAvgFull = currentStudent ? getOverallAverage(currentStudent.id) : null;

  // Grade category styling
  const categoryStyles: Record<string, { bg: string; text: string; border: string; name: string }> = {
    sprawdzian: {
      bg: 'bg-red-50 hover:bg-red-100',
      text: 'text-red-700 font-bold',
      border: 'border-red-300',
      name: 'Sprawdzian (Waga 3-4)',
    },
    kartkowka: {
      bg: 'bg-emerald-50 hover:bg-emerald-100',
      text: 'text-emerald-700 font-bold',
      border: 'border-emerald-300',
      name: 'Kartkówka (Waga 2)',
    },
    odpowiedz: {
      bg: 'bg-blue-50 hover:bg-blue-100',
      text: 'text-blue-700 font-bold',
      border: 'border-blue-300',
      name: 'Odpowiedź ustna (Waga 2)',
    },
    praca_klasowa: {
      bg: 'bg-purple-50 hover:bg-purple-100',
      text: 'text-purple-700 font-bold',
      border: 'border-purple-300',
      name: 'Praca klasowa (Waga 4-5)',
    },
    zadanie_domowe: {
      bg: 'bg-amber-50 hover:bg-amber-100',
      text: 'text-amber-800 font-bold',
      border: 'border-amber-300',
      name: 'Zadanie domowe (Waga 1-2)',
    },
    aktywnosc: {
      bg: 'bg-teal-50 hover:bg-teal-100',
      text: 'text-teal-700 font-bold',
      border: 'border-teal-300',
      name: 'Aktywność (Waga 1)',
    },
    projekt: {
      bg: 'bg-indigo-50 hover:bg-indigo-100',
      text: 'text-indigo-700 font-bold',
      border: 'border-indigo-300',
      name: 'Projekt (Waga 3)',
    },
  };

  const calculateProposedFinalGrade = (avg: number | null): string => {
    if (avg === null) return '—';
    if (avg >= 5.6) return '6 (celujący)';
    if (avg >= 4.75) return '5 (bardzo dobry)';
    if (avg >= 3.75) return '4 (dobry)';
    if (avg >= 2.75) return '3 (dostateczny)';
    if (avg >= 1.85) return '2 (dopuszczający)';
    return '1 (niedostateczny)';
  };

  const [pdfGenerating, setPdfGenerating] = useState(false);
  const [pdfSuccessToast, setPdfSuccessToast] = useState(false);

  const handleExportPdf = () => {
    if (!currentStudent) return;
    setPdfGenerating(true);
    try {
      generateGradesPdf({
        student: currentStudent,
        subjects,
        grades,
        overallAvgSem1,
        overallAvgSem2,
        overallAvgFull,
        attendanceRate: 94.2,
        schoolName: systemConfig.schoolName,
        schoolCity: systemConfig.schoolCity,
        academicYear: systemConfig.academicYear,
        semester: systemConfig.semester,
      });
      setPdfSuccessToast(true);
      setTimeout(() => setPdfSuccessToast(false), 4500);
    } catch (err) {
      console.error('Błąd generowania PDF:', err);
    } finally {
      setPdfGenerating(false);
    }
  };

  if (!currentStudent) {
    return (
      <div className="bg-white rounded-2xl border border-slate-200 p-8 sm:p-12 text-center max-w-lg mx-auto my-12 shadow-xs">
        <div className="w-16 h-16 rounded-2xl bg-blue-50 text-blue-700 flex items-center justify-center mx-auto mb-4 border border-blue-100">
          <GraduationCap className="w-8 h-8" />
        </div>
        <h3 className="text-base font-bold text-slate-900 mb-1.5">
          Brak uczniów w dzienniku
        </h3>
        <p className="text-xs text-slate-500 mb-6 leading-relaxed">
          W dzienniku nie ma jeszcze zarejestrowanych uczniów. Przejdź do Panelu Administratora, aby utworzyć konta uczniów dla wybranych klas (np. <strong>Klasa 4</strong>, <strong>Klasa 5</strong>).
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {/* PDF Generation Success Toast */}
      {pdfSuccessToast && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-xl flex items-center justify-between shadow-xs animate-in fade-in duration-150">
          <div className="flex items-center space-x-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>
              Pomyślnie wygenerowano i pobrano plik PDF: <strong>Zestawienie_Ocen_{currentStudent?.lastName}_{currentStudent?.firstName}.pdf</strong>
            </span>
          </div>
          <button
            onClick={() => setPdfSuccessToast(false)}
            className="text-emerald-700 hover:text-emerald-900 font-bold text-xs ml-3"
          >
            ✕
          </button>
        </div>
      )}
      {/* Top action / filter bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-3">
          {/* Student selection - Strictly locked for students/parents */}
          {isTeacherOrAdmin ? (
            <div className="flex items-center space-x-2">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Uczeń:</span>
              <select
                value={activeStudentId}
                onChange={e => setSelectedStudentId(e.target.value)}
                className="text-xs font-extrabold text-[#0b192c] bg-slate-50 border border-slate-300 rounded-xl px-3 py-1.5 focus:ring-2 focus:ring-blue-600 focus:outline-none"
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

          {/* Semester pills */}
          <div className="flex items-center bg-slate-100 p-0.5 rounded-lg border border-slate-200 text-xs font-semibold">
            <button
              onClick={() => setActiveSemesterTab('all')}
              className={`px-3 py-1.5 rounded-md transition-all ${
                activeSemesterTab === 'all'
                  ? 'bg-white text-[#0b192c] shadow-xs font-bold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Cały rok
            </button>
            <button
              onClick={() => setActiveSemesterTab('sem1')}
              className={`px-3 py-1.5 rounded-md transition-all ${
                activeSemesterTab === 'sem1'
                  ? 'bg-white text-[#0b192c] shadow-xs font-bold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Semestr I
            </button>
            <button
              onClick={() => setActiveSemesterTab('sem2')}
              className={`px-3 py-1.5 rounded-md transition-all ${
                activeSemesterTab === 'sem2'
                  ? 'bg-white text-[#0b192c] shadow-xs font-bold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Semestr II (bieżący)
            </button>
          </div>
        </div>

        {/* Right tools */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Search box */}
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Szukaj przedmiotu..."
              className="pl-8 pr-3 py-1.5 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500 w-32 sm:w-44 bg-slate-50"
            />
          </div>

          {/* Simulator button */}
          <button
            onClick={() => setSimulatorOpen(!simulatorOpen)}
            className={`px-3 py-1.5 rounded-lg border text-xs font-bold flex items-center space-x-1.5 transition-colors cursor-pointer ${
              simulatorOpen
                ? 'bg-amber-100 border-amber-300 text-amber-900 shadow-2xs'
                : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
            }`}
            title="Symulator średniej ocen (Kalkulator 'Co jeśli?')"
          >
            <Calculator className="w-3.5 h-3.5 text-amber-600" />
            <span>Symulator Średniej</span>
            {simulatedEntries.length > 0 && (
              <span className="w-4 h-4 rounded-full bg-amber-500 text-white text-[10px] flex items-center justify-center font-bold">
                {simulatedEntries.length}
              </span>
            )}
          </button>

          <button
            onClick={() => setShowLegend(!showLegend)}
            className={`p-1.5 rounded-lg border text-xs flex items-center space-x-1 transition-colors cursor-pointer ${
              showLegend
                ? 'bg-blue-50 border-blue-300 text-blue-700'
                : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
            }`}
            title="Pokaż legendę kolorów ocen"
          >
            <HelpCircle className="w-4 h-4" />
            <span className="hidden sm:inline">Legenda</span>
          </button>

          <button
            onClick={handleExportPdf}
            disabled={pdfGenerating}
            className="px-3 py-1.5 rounded-lg border border-red-300 bg-red-50 hover:bg-red-100 text-red-800 text-xs font-bold flex items-center space-x-1.5 transition-all shadow-2xs active:scale-95 cursor-pointer"
            title="Pobierz oficjalną kartę ocen ucznia w formacie PDF"
          >
            <FileDown className="w-4 h-4 text-red-600" />
            <span>{pdfGenerating ? 'Generowanie...' : 'Pobierz PDF'}</span>
          </button>

          {isTeacherOrAdmin && (
            <button
              onClick={() => setAddGradeModalOpen(true)}
              className="px-3 py-1.5 bg-blue-700 hover:bg-blue-800 text-white text-xs font-bold rounded-lg flex items-center space-x-1.5 shadow-sm transition-colors cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Wstaw ocenę</span>
            </button>
          )}
        </div>
      </div>

      {/* Simulator Interactive Drawer */}
      {simulatorOpen && (
        <div className="bg-gradient-to-r from-amber-50 via-orange-50 to-amber-50/50 p-4 sm:p-5 rounded-2xl border border-amber-300 text-xs shadow-sm animate-in fade-in duration-150">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-amber-200">
            <div>
              <div className="font-extrabold text-amber-950 text-sm flex items-center space-x-2">
                <Calculator className="w-4 h-4 text-amber-600" />
                <span>Symulator Ocen i Średniej (Kalkulator "Co jeśli?")</span>
              </div>
              <p className="text-[11px] text-amber-800 mt-0.5">
                Sprawdź, jak potencjalne nowe oceny wpłyną na Twoją średnią końcoworoczną oraz pasek na świadectwie!
              </p>
            </div>
            {simulatedEntries.length > 0 && (
              <button
                onClick={() => setSimulatedEntries([])}
                className="text-xs font-bold text-rose-700 hover:text-rose-900 bg-white/80 border border-rose-200 px-3 py-1 rounded-lg"
              >
                Resetuj symulację
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-3 pt-1">
            {/* Controls */}
            <div className="md:col-span-2 flex flex-wrap items-center gap-2">
              <div className="flex-1 min-w-[130px]">
                <label className="block text-[10px] font-bold text-amber-900 uppercase mb-1">Przedmiot:</label>
                <select
                  value={simSubjectId}
                  onChange={e => setSimSubjectId(e.target.value)}
                  className="w-full text-xs font-bold bg-white border border-amber-300 rounded-xl px-2.5 py-1.5 focus:outline-none"
                >
                  {subjects.map(s => (
                    <option key={s.id} value={s.id}>
                      {s.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="w-24">
                <label className="block text-[10px] font-bold text-amber-900 uppercase mb-1">Ocena:</label>
                <select
                  value={simGradeVal}
                  onChange={e => setSimGradeVal(Number(e.target.value))}
                  className="w-full text-xs font-extrabold bg-white border border-amber-300 rounded-xl px-2.5 py-1.5 focus:outline-none text-center"
                >
                  <option value={6}>6 (cel)</option>
                  <option value={5}>5 (bdb)</option>
                  <option value={4}>4 (db)</option>
                  <option value={3}>3 (dst)</option>
                  <option value={2}>2 (dop)</option>
                  <option value={1}>1 (ndst)</option>
                </select>
              </div>

              <div className="w-20">
                <label className="block text-[10px] font-bold text-amber-900 uppercase mb-1">Waga:</label>
                <select
                  value={simWeight}
                  onChange={e => setSimWeight(Number(e.target.value))}
                  className="w-full text-xs font-bold bg-white border border-amber-300 rounded-xl px-2.5 py-1.5 focus:outline-none text-center"
                >
                  <option value={1}>Waga 1</option>
                  <option value={2}>Waga 2</option>
                  <option value={3}>Waga 3</option>
                  <option value={4}>Waga 4</option>
                  <option value={5}>Waga 5</option>
                </select>
              </div>

              <div className="self-end">
                <button
                  type="button"
                  onClick={() => {
                    setSimulatedEntries(prev => [...prev, { subjectId: simSubjectId, value: simGradeVal, weight: simWeight }]);
                  }}
                  className="px-3.5 py-1.5 bg-amber-600 hover:bg-amber-700 text-white font-extrabold text-xs rounded-xl shadow-xs transition-colors"
                >
                  + Dodaj ocenę
                </button>
              </div>
            </div>

            {/* Simulated Result Box */}
            <div className="md:col-span-2 bg-white/90 p-3.5 rounded-xl border border-amber-300 flex items-center justify-between">
              <div>
                <div className="text-[10px] font-bold text-slate-500 uppercase">Wynik symulacji średniej:</div>
                <div className="flex items-baseline space-x-2 mt-0.5">
                  <span className="text-xl font-black text-slate-900">
                    {overallAvgFull !== null ? overallAvgFull.toFixed(2) : '—'}
                  </span>
                  <span className="text-sm font-bold text-amber-600">➔</span>
                  <span className="text-2xl font-black text-blue-700">
                    {simulatedEntries.length > 0 && overallAvgFull !== null
                      ? (
                          (overallAvgFull * subjects.length +
                            simulatedEntries.reduce((acc, se) => acc + (se.value - overallAvgFull) * (se.weight / 10), 0)) /
                          subjects.length
                        ).toFixed(2)
                      : overallAvgFull !== null
                      ? overallAvgFull.toFixed(2)
                      : '—'}
                  </span>
                </div>
              </div>

              <div className="text-right">
                <div className="text-[10px] font-bold text-slate-500 uppercase">Czerwony pasek (≥4.75):</div>
                <div className="mt-1">
                  {(overallAvgFull !== null ? overallAvgFull : 4.5) >= 4.75 ? (
                    <span className="text-xs font-extrabold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-full border border-emerald-300">
                      Gwarantowany! 🎖️
                    </span>
                  ) : (
                    <span className="text-xs font-extrabold text-amber-800 bg-amber-100 px-2 py-0.5 rounded-full border border-amber-300">
                      Brakuje jeszcze ocen
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Legend Drawer (Collapsible) */}
      {showLegend && (
        <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 text-xs animate-in fade-in duration-100">
          <div className="font-bold text-slate-700 mb-2 flex items-center space-x-1.5">
            <Info className="w-4 h-4 text-blue-600" />
            <span>Legenda oznaczeń kategorii ocen i wag w dzienniku:</span>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {Object.entries(categoryStyles).map(([key, style]) => (
              <div
                key={key}
                className={`p-2 rounded border flex items-center space-x-2 bg-white ${style.border}`}
              >
                <span
                  className={`w-6 h-6 rounded flex items-center justify-center font-bold border ${style.bg} ${style.text} ${style.border}`}
                >
                  5
                </span>
                <span className="text-[11px] text-slate-700 font-medium">{style.name}</span>
              </div>
            ))}
          </div>
          <p className="text-[11px] text-slate-500 mt-2.5">
            * Kliknij dowolną ocenę w tabeli, aby wyświetlić jej pełne szczegóły: datę wpisu, wagę, nauczyciela oraz komentarz.
          </p>
        </div>
      )}

      {/* Summary Score Bar */}
      <div className="bg-gradient-to-r from-blue-900 via-indigo-900 to-[#1a365d] text-white p-4 rounded-xl shadow-xs flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-lg bg-white/10 flex items-center justify-center text-amber-300 border border-white/20">
            <Award className="w-6 h-6" />
          </div>
          <div>
            <div className="text-xs text-blue-200">
              Karta ocen ucznia: <strong className="text-white">{currentStudent?.firstName} {currentStudent?.lastName}</strong> (Klasa {currentStudent?.className})
            </div>
            <div className="flex items-center space-x-3 mt-0.5">
              <span className="text-lg font-extrabold tracking-tight">
                Średnia ogólna: {overallAvgFull !== null ? overallAvgFull.toFixed(2) : '—'}
              </span>
              {overallAvgFull !== null && overallAvgFull >= 4.75 && (
                <span className="text-xs bg-amber-400 text-slate-900 font-bold px-2 py-0.5 rounded shadow-xs">
                  Świadectwo z biało-czerwonym paskiem 🏅
                </span>
              )}
            </div>
          </div>
        </div>

        <div className="flex items-center space-x-3 text-xs">
          <div className="text-right">
            <div className="text-blue-300 font-medium">Średnia Sem. I</div>
            <div className="text-sm font-bold">{overallAvgSem1 !== null ? overallAvgSem1.toFixed(2) : '—'}</div>
          </div>
          <div className="w-px h-6 bg-white/20" />
          <div className="text-right">
            <div className="text-blue-300 font-medium">Średnia Sem. II</div>
            <div className="text-sm font-bold text-amber-300">{overallAvgSem2 !== null ? overallAvgSem2.toFixed(2) : '—'}</div>
          </div>
          <div className="w-px h-6 bg-white/20" />
          <button
            onClick={handleExportPdf}
            disabled={pdfGenerating}
            className="px-3 py-1.5 bg-white hover:bg-slate-100 text-[#1a365d] font-bold rounded-lg text-xs flex items-center space-x-1.5 shadow-xs transition-all active:scale-95 cursor-pointer"
            title="Pobierz oficjalną kartę ocen ucznia w formacie PDF"
          >
            <FileDown className="w-4 h-4 text-red-600" />
            <span className="hidden sm:inline">Pobierz kartę</span>
            <span>PDF</span>
          </button>
        </div>
      </div>

      {/* Iconic Polish E-Dziennik Gradebook Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-[#1a365d] text-white font-semibold divide-x divide-white/10 border-b border-[#1a365d]">
                <th className="py-3 px-3 w-10 text-center">Lp.</th>
                <th className="py-3 px-4 min-w-[180px]">Przedmiot i nauczyciel</th>

                {/* Semestr 1 */}
                {(activeSemesterTab === 'all' || activeSemesterTab === 'sem1') && (
                  <>
                    <th className="py-3 px-3 min-w-[200px]">Oceny bieżące - Semestr I</th>
                    <th className="py-3 px-2 w-16 text-center bg-[#152c4d]">Śr. I</th>
                  </>
                )}

                {/* Semestr 2 */}
                {(activeSemesterTab === 'all' || activeSemesterTab === 'sem2') && (
                  <>
                    <th className="py-3 px-3 min-w-[240px]">Oceny bieżące - Semestr II</th>
                    <th className="py-3 px-2 w-16 text-center bg-[#152c4d]">Śr. II</th>
                  </>
                )}

                {/* Roczna */}
                {activeSemesterTab === 'all' && (
                  <>
                    <th className="py-3 px-2 w-16 text-center bg-[#0d1e38]">Śr. R</th>
                    <th className="py-3 px-3 w-28 text-center bg-[#0d1e38]">Przewidywana roczna</th>
                  </>
                )}
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-200">
              {filteredSubjects.map((sub, idx) => {
                const subGradesSem1 = grades.filter(
                  g => g.studentId === currentStudent?.id && g.subjectId === sub.id && g.semester === 1
                );
                const subGradesSem2 = grades.filter(
                  g => g.studentId === currentStudent?.id && g.subjectId === sub.id && g.semester === 2
                );

                const avgSem1 = getSubjectAverage(currentStudent?.id || '', sub.id, 1);
                const avgSem2 = getSubjectAverage(currentStudent?.id || '', sub.id, 2);
                const avgFull = getSubjectAverage(currentStudent?.id || '', sub.id);

                return (
                  <tr
                    key={sub.id}
                    className={`hover:bg-blue-50/40 transition-colors ${
                      idx % 2 === 0 ? 'bg-white' : 'bg-slate-50/60'
                    }`}
                  >
                    {/* Lp */}
                    <td className="py-2.5 px-3 text-center text-slate-400 font-medium">
                      {idx + 1}
                    </td>

                    {/* Przedmiot & Nauczyciel */}
                    <td className="py-2.5 px-4 border-r border-slate-200">
                      <div className="font-bold text-slate-900 text-xs sm:text-sm">
                        {sub.name}
                      </div>
                      <div className="text-[11px] text-slate-500 font-normal">
                        {sub.teacherName}
                      </div>
                    </td>

                    {/* Oceny bieżące Semestr 1 */}
                    {(activeSemesterTab === 'all' || activeSemesterTab === 'sem1') && (
                      <>
                        <td className="py-2 px-3 border-r border-slate-200">
                          {subGradesSem1.length > 0 ? (
                            <div className="flex flex-wrap gap-1.5 items-center">
                              {subGradesSem1.map(g => {
                                const style = categoryStyles[g.category] || {
                                  bg: 'bg-slate-100',
                                  text: 'text-slate-800',
                                  border: 'border-slate-300',
                                };
                                return (
                                  <button
                                    key={g.id}
                                    onClick={() => setSelectedGrade(g)}
                                    title={`${g.description || g.category} (waga ${g.weight}) - ${g.date}`}
                                    className={`w-7 h-7 rounded border font-bold text-xs flex items-center justify-center cursor-pointer transition-transform hover:scale-110 shadow-2xs ${style.bg} ${style.text} ${style.border}`}
                                  >
                                    {g.value}
                                  </button>
                                );
                              })}
                            </div>
                          ) : (
                            <span className="text-slate-300 text-xs italic">Brak ocen</span>
                          )}
                        </td>

                        {/* Średnia Semestr 1 */}
                        <td className="py-2 px-2 text-center font-bold text-slate-700 bg-slate-100/70 border-r border-slate-200">
                          {avgSem1 !== null ? avgSem1.toFixed(2) : '—'}
                        </td>
                      </>
                    )}

                    {/* Oceny bieżące Semestr 2 */}
                    {(activeSemesterTab === 'all' || activeSemesterTab === 'sem2') && (
                      <>
                        <td className="py-2 px-3 border-r border-slate-200">
                          {subGradesSem2.length > 0 ? (
                            <div className="flex flex-wrap gap-1.5 items-center">
                              {subGradesSem2.map(g => {
                                const style = categoryStyles[g.category] || {
                                  bg: 'bg-slate-100',
                                  text: 'text-slate-800',
                                  border: 'border-slate-300',
                                };
                                return (
                                  <button
                                    key={g.id}
                                    onClick={() => setSelectedGrade(g)}
                                    title={`${g.description || g.category} (waga ${g.weight}) - ${g.date}`}
                                    className={`w-7 h-7 rounded border font-bold text-xs flex items-center justify-center cursor-pointer transition-transform hover:scale-110 shadow-2xs ${style.bg} ${style.text} ${style.border}`}
                                  >
                                    {g.value}
                                  </button>
                                );
                              })}
                            </div>
                          ) : (
                            <span className="text-slate-300 text-xs italic">Brak ocen</span>
                          )}
                        </td>

                        {/* Średnia Semestr 2 */}
                        <td className="py-2 px-2 text-center font-bold text-[#1a365d] bg-blue-50/70 border-r border-slate-200">
                          {avgSem2 !== null ? avgSem2.toFixed(2) : '—'}
                        </td>
                      </>
                    )}

                    {/* Średnia roczna */}
                    {activeSemesterTab === 'all' && (
                      <>
                        <td className="py-2 px-2 text-center font-extrabold text-slate-900 bg-slate-100 border-r border-slate-200">
                          {avgFull !== null ? avgFull.toFixed(2) : '—'}
                        </td>

                        {/* Ocena roczna / przewidywana */}
                        <td className="py-2 px-3 text-center font-semibold text-emerald-800 bg-emerald-50/40">
                          {calculateProposedFinalGrade(avgFull)}
                        </td>
                      </>
                    )}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Grade Details Modal */}
      {selectedGrade && (
        <GradeDetailModal
          grade={selectedGrade}
          subject={subjects.find(s => s.id === selectedGrade.subjectId)}
          studentName={currentStudent ? `${currentStudent.firstName} ${currentStudent.lastName}` : undefined}
          onClose={() => setSelectedGrade(null)}
        />
      )}

      {/* Add Grade Modal */}
      <AddGradeModal
        isOpen={addGradeModalOpen}
        onClose={() => setAddGradeModalOpen(false)}
        defaultStudentId={currentStudent?.id}
      />
    </div>
  );
};
