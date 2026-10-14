import React, { useState } from 'react';
import { useJournal } from '../context/JournalContext';
import { BehaviorPoint, BehaviorPointType } from '../types';
import {
  Award,
  Shield,
  Sparkles,
  Plus,
  Minus,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  CheckCircle2,
  Trash2,
  Calendar,
  User,
  Zap,
  BookOpen,
  HeartHandshake,
  Flame,
  Star,
  Trophy,
  Filter,
  Check,
  X,
  Dice5,
} from 'lucide-react';

export const BehaviorView: React.FC = () => {
  const {
    currentUser,
    students,
    subjects,
    grades,
    behaviorPoints,
    lessonPlusMinus,
    addBehaviorPoint,
    deleteBehaviorPoint,
    addLessonPlusMinus,
    deleteLessonPlusMinus,
    getBehaviorStats,
    getAttendanceStats,
    getOverallAverage,
  } = useJournal();

  // If student or parent, locked to self!
  const isStudentOrParent = currentUser?.role === 'student' || currentUser?.role === 'parent';
  const isTeacherOrAdmin = currentUser?.role === 'admin' || currentUser?.role === 'teacher';

  const [selectedStudentId, setSelectedStudentId] = useState<string>(() => {
    if (isStudentOrParent && currentUser?.studentId) {
      return currentUser.studentId;
    }
    return students[0]?.id || 'st_1';
  });

  const activeStudentId = isStudentOrParent && currentUser?.studentId ? currentUser.studentId : selectedStudentId;
  const currentStudent = students.find(s => s.id === activeStudentId) || students[0];

  const stats = currentStudent
    ? getBehaviorStats(currentStudent.id)
    : {
        basePoints: 100,
        positiveTotal: 0,
        negativeTotal: 0,
        finalPoints: 100,
        rankTitle: 'Dobre',
        rankBadgeColor: 'bg-emerald-100 text-emerald-900 border-emerald-300',
        plusCount: 0,
        minusCount: 0,
      };

  const attendanceStats = currentStudent ? getAttendanceStats(currentStudent.id) : { rate: 95 };
  const overallAvg = currentStudent ? getOverallAverage(currentStudent.id, 2) : 4.5;

  const [filterType, setFilterType] = useState<'all' | 'positive' | 'negative' | 'plusminus'>('all');
  const [modalOpen, setModalOpen] = useState(false);

  // New Behavior Point Form State
  const [newTitle, setNewTitle] = useState('');
  const [newCategory, setNewCategory] = useState('Praca na rzecz szkoły i wolontariat');
  const [newPoints, setNewPoints] = useState<number>(15);
  const [newType, setNewType] = useState<BehaviorPointType>('pozytywny');
  const [newDescription, setNewDescription] = useState('');
  const [newSubject, setNewSubject] = useState('');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Quick preset categories
  const PRESET_CATEGORIES: {
    category: string;
    title: string;
    points: number;
    type: BehaviorPointType;
  }[] = [
    { category: 'Osiągnięcia naukowe i konkursy', title: 'Udział w olimpiadzie przedmiotowej / konkursie', points: 25, type: 'pozytywny' },
    { category: 'Praca na rzecz szkoły i wolontariat', title: 'Pomoc w organizacji uroczystości szkolnej', points: 15, type: 'pozytywny' },
    { category: 'Kultura osobista i pomoc kolegom', title: 'Wzorowa pomoc koledze w nauce', points: 10, type: 'pozytywny' },
    { category: 'Wzorowa frekwencja i punktualność', title: '100% frekwencji w miesiącu', points: 20, type: 'pozytywny' },
    { category: 'Aktywność i zaangażowanie', title: 'Reprezentowanie szkoły w zawodach sportowych', points: 20, type: 'pozytywny' },
    { category: 'Nieprzygotowanie do zajęć', title: 'Brak zadania domowego lub materiałów', points: -5, type: 'negatywny' },
    { category: 'Spóźnienie i brak dyscypliny', title: 'Nieusprawiedliwione spóźnienie na lekcję', points: -3, type: 'negatywny' },
    { category: 'Zakłócanie toku lekcji', title: 'Przeszkadzanie i głośne rozmowy podczas lekcji', points: -10, type: 'negatywny' },
    { category: 'Używanie urządzeń elektronicznych', title: 'Używanie telefonu komórkowego bez zgody nauczyciela', points: -15, type: 'negatywny' },
    { category: 'Kultura osobista i zachowanie', title: 'Niewłaściwy stosunek do nauczyciela lub kolegów', points: -20, type: 'negatywny' },
  ];

  const handleApplyPreset = (preset: typeof PRESET_CATEGORIES[0]) => {
    setNewCategory(preset.category);
    setNewTitle(preset.title);
    setNewPoints(preset.points);
    setNewType(preset.type);
  };

  const handleCreatePoint = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || !currentStudent) return;

    addBehaviorPoint({
      studentId: currentStudent.id,
      title: newTitle.trim(),
      category: newCategory,
      points: Number(newPoints),
      type: newType,
      description: newDescription.trim() || 'Wpis dokonany w dzienniku elektronicznym.',
      teacherName: currentUser?.name || 'Nauczyciel',
      date: new Date().toISOString().split('T')[0],
      subjectName: newSubject.trim() || undefined,
    });

    setModalOpen(false);
    setNewTitle('');
    setNewDescription('');
    setNewSubject('');
    setToastMessage(`Pomyślnie dodano punkt ${newPoints > 0 ? '+' + newPoints : newPoints} dla: ${currentStudent.firstName} ${currentStudent.lastName}`);
    setTimeout(() => setToastMessage(null), 4000);
  };

  const handleQuickAddPlusMinus = (subjectId: string, type: 'plus' | 'minus') => {
    if (!currentStudent || !isTeacherOrAdmin) return;
    const sub = subjects.find(s => s.id === subjectId);
    addLessonPlusMinus({
      studentId: currentStudent.id,
      subjectId,
      type,
      date: new Date().toISOString().split('T')[0],
      teacherName: currentUser?.name || 'Nauczyciel',
      note: type === 'plus' ? 'Aktywność na lekcji' : 'Brak przygotowania / zadania',
    });
    setToastMessage(`Dodano znak [${type === 'plus' ? '+' : '-'}] z przedmiotu: ${sub?.name || 'Lekcja'}`);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Filter student points
  const studentPoints = behaviorPoints.filter(p => p.studentId === currentStudent?.id);
  const studentPlusMinus = lessonPlusMinus.filter(pm => pm.studentId === currentStudent?.id);

  const filteredPoints = studentPoints.filter(p => {
    if (filterType === 'positive') return p.points > 0;
    if (filterType === 'negative') return p.points < 0;
    return true;
  });

  // Calculate RPG/Neuroshima stats
  const knowledgeStat = Math.min(100, Math.round(((overallAvg || 3.0) / 6.0) * 100));
  const disciplineStat = Math.min(100, Math.round(attendanceStats?.rate || 90));
  const activityStat = Math.min(100, Math.round((stats.plusCount * 15) + 50));
  const karmaStat = Math.max(10, Math.min(100, Math.round((stats.finalPoints / 200) * 100)));

  if (!currentStudent) {
    return (
      <div className="bg-white rounded-2xl border border-slate-200 p-8 sm:p-12 text-center max-w-lg mx-auto my-12 shadow-xs">
        <div className="w-16 h-16 rounded-2xl bg-amber-50 text-amber-700 flex items-center justify-center mx-auto mb-4 border border-amber-200">
          <Award className="w-8 h-8" />
        </div>
        <h3 className="text-base font-bold text-slate-900 mb-1.5">
          Punkty i Karta Cech Ucznia (Neuroshima)
        </h3>
        <p className="text-xs text-slate-500 mb-6 leading-relaxed">
          W dzienniku nie ma jeszcze zarejestrowanych uczniów. Przejdź do Panelu Administratora, aby utworzyć konta uczniów dla wybranych klas (np. <strong>Klasa 4</strong>, <strong>Klasa 5</strong>), po czym będziesz mógł nadawać punkty dodatnie, ujemne i plusy/minusy.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Toast notification */}
      {toastMessage && (
        <div className="p-3.5 bg-emerald-50 border border-emerald-300 text-emerald-900 text-xs font-semibold rounded-xl flex items-center justify-between shadow-sm animate-in fade-in duration-200">
          <div className="flex items-center space-x-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{toastMessage}</span>
          </div>
          <button onClick={() => setToastMessage(null)} className="text-emerald-700 hover:text-emerald-950 font-bold ml-2">
            ✕
          </button>
        </div>
      )}

      {/* Header filter & Student Selector */}
      <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/90 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-3">
          {isTeacherOrAdmin ? (
            <div className="flex items-center space-x-2">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Wybierz ucznia:</span>
              <select
                value={activeStudentId}
                onChange={e => setSelectedStudentId(e.target.value)}
                className="text-xs font-extrabold text-[#0b192c] bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 focus:ring-2 focus:ring-blue-600 focus:outline-none shadow-2xs"
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
              <span>Profil ucznia: {currentStudent?.firstName} {currentStudent?.lastName} (kl. {currentStudent?.className}, nr {currentStudent?.numberInJournal})</span>
            </div>
          )}

          {/* Points Filter pills */}
          <div className="flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200 text-xs font-semibold">
            <button
              onClick={() => setFilterType('all')}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                filterType === 'all' ? 'bg-white text-[#0b192c] shadow-xs font-bold' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Wszystkie ({studentPoints.length})
            </button>
            <button
              onClick={() => setFilterType('positive')}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                filterType === 'positive' ? 'bg-white text-emerald-700 shadow-xs font-bold' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Pochwały (+{studentPoints.filter(p => p.points > 0).length})
            </button>
            <button
              onClick={() => setFilterType('negative')}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                filterType === 'negative' ? 'bg-white text-rose-700 shadow-xs font-bold' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Uwagi (-{studentPoints.filter(p => p.points < 0).length})
            </button>
            <button
              onClick={() => setFilterType('plusminus')}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                filterType === 'plusminus' ? 'bg-white text-blue-700 shadow-xs font-bold' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Plusy i Minusy ({studentPlusMinus.length})
            </button>
          </div>
        </div>

        {/* Action Button for Teachers / Admins */}
        {isTeacherOrAdmin && (
          <button
            onClick={() => setModalOpen(true)}
            className="px-4 py-2 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-extrabold text-xs rounded-xl shadow-md flex items-center justify-center space-x-1.5 cursor-pointer active:scale-98 transition-all"
          >
            <Plus className="w-4 h-4 stroke-[3]" />
            <span>Wystaw punkty / Pochwałę / Uwagę</span>
          </button>
        )}
      </div>

      {/* Main Scoreboard & Rank Banner */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {/* Card 1: Bilans Punktowy i Ranga */}
        <div className="bg-gradient-to-br from-[#0b192c] via-[#102a4e] to-[#1a365d] text-white p-6 rounded-2xl shadow-md border border-blue-900 flex flex-col justify-between relative overflow-hidden">
          <div className="absolute right-0 top-0 translate-x-4 -translate-y-4 opacity-10">
            <Trophy className="w-40 h-40 text-amber-300" />
          </div>
          <div>
            <div className="flex items-center justify-between mb-3">
              <span className="text-[11px] font-bold uppercase tracking-wider text-amber-300 flex items-center space-x-1.5">
                <Flame className="w-4 h-4 text-amber-400 animate-pulse" />
                <span>Ranga & Ocena Zachowania</span>
              </span>
              <span className="px-2.5 py-1 rounded-full text-xs font-black bg-amber-400/20 text-amber-300 border border-amber-300/40">
                {stats.rankTitle}
              </span>
            </div>
            <div className="text-4xl sm:text-5xl font-black tracking-tight text-white mt-1">
              {stats.finalPoints} <span className="text-xl font-bold text-slate-300">pkt</span>
            </div>
            <p className="text-xs text-slate-300 mt-2 leading-relaxed">
              Pula wyjściowa: <strong>100 pkt</strong> · Pochwały: <span className="text-emerald-300 font-bold">+{stats.positiveTotal}</span> · Uwagi: <span className="text-rose-300 font-bold">-{stats.negativeTotal}</span> · Plusy lekcyjne: <span className="text-blue-300 font-bold">+{stats.plusCount * 2}</span>
            </p>
          </div>

          <div className="mt-5 pt-4 border-t border-white/10">
            <div className="flex justify-between text-[11px] text-slate-300 font-semibold mb-1">
              <span>Do rangi Wzorowej (180 pkt):</span>
              <span className="text-amber-300 font-bold">{Math.max(0, 180 - stats.finalPoints)} pkt brakuje</span>
            </div>
            <div className="w-full bg-white/20 h-2.5 rounded-full overflow-hidden">
              <div
                className="bg-gradient-to-r from-amber-400 to-amber-300 h-full rounded-full transition-all duration-500"
                style={{ width: `${Math.min(100, (stats.finalPoints / 180) * 100)}%` }}
              />
            </div>
          </div>
        </div>

        {/* Card 2: Cechy Ucznia (Stylizowane na Neuroshima / Tactical RPG!) */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-extrabold uppercase tracking-wider text-slate-500 flex items-center space-x-1.5">
                <Sparkles className="w-4 h-4 text-blue-600" />
                <span>Karta Cech Ucznia</span>
              </span>
              <span className="text-[10px] uppercase font-bold text-blue-800 bg-blue-50 px-2 py-0.5 rounded-full border border-blue-200">
                Statystyki
              </span>
            </div>

            <div className="space-y-3 mt-2">
              {/* Stat 1: Wiedza */}
              <div>
                <div className="flex justify-between text-xs font-bold text-slate-700 mb-1">
                  <span className="flex items-center gap-1.5">🧠 Wiedza & Oceny</span>
                  <span className="text-blue-700">{knowledgeStat}/100</span>
                </div>
                <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                  <div className="bg-blue-600 h-full rounded-full" style={{ width: `${knowledgeStat}%` }} />
                </div>
              </div>

              {/* Stat 2: Dyscyplina */}
              <div>
                <div className="flex justify-between text-xs font-bold text-slate-700 mb-1">
                  <span className="flex items-center gap-1.5">🛡️ Dyscyplina & Frekwencja</span>
                  <span className="text-emerald-700">{disciplineStat}/100</span>
                </div>
                <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                  <div className="bg-emerald-500 h-full rounded-full" style={{ width: `${disciplineStat}%` }} />
                </div>
              </div>

              {/* Stat 3: Aktywność */}
              <div>
                <div className="flex justify-between text-xs font-bold text-slate-700 mb-1">
                  <span className="flex items-center gap-1.5">⚡ Aktywność na Lekcjach</span>
                  <span className="text-amber-700">{activityStat}/100</span>
                </div>
                <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                  <div className="bg-amber-500 h-full rounded-full" style={{ width: `${activityStat}%` }} />
                </div>
              </div>

              {/* Stat 4: Reputacja */}
              <div>
                <div className="flex justify-between text-xs font-bold text-slate-700 mb-1">
                  <span className="flex items-center gap-1.5">🤝 Reputacja & Punkty</span>
                  <span className="text-purple-700">{karmaStat}/100</span>
                </div>
                <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                  <div className="bg-purple-500 h-full rounded-full" style={{ width: `${karmaStat}%` }} />
                </div>
              </div>
            </div>
          </div>

          <div className="mt-3 pt-2.5 border-t border-slate-100 text-[11px] text-slate-500 flex items-center justify-between">
            <span>Szczęśliwy numerek: <strong>#7</strong></span>
            <span className="text-emerald-600 font-bold">Ochrona przed pytaniem</span>
          </div>
        </div>

        {/* Card 3: Odznaki i Osiągnięcia */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-extrabold uppercase tracking-wider text-slate-500 flex items-center space-x-1.5">
                <Trophy className="w-4 h-4 text-amber-500" />
                <span>Odznaki Ucznia</span>
              </span>
              <span className="text-[10px] font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200">
                4 aktywne
              </span>
            </div>

            <div className="grid grid-cols-2 gap-2.5 mt-2">
              <div className="p-2.5 bg-amber-50/70 border border-amber-200/70 rounded-xl flex items-center space-x-2">
                <span className="text-xl">🎯</span>
                <div className="leading-tight">
                  <div className="text-xs font-bold text-amber-900">Snajper Ocen</div>
                  <div className="text-[10px] text-amber-700">Większość ocen to 5 i 6</div>
                </div>
              </div>

              <div className="p-2.5 bg-blue-50/70 border border-blue-200/70 rounded-xl flex items-center space-x-2">
                <span className="text-xl">🛡️</span>
                <div className="leading-tight">
                  <div className="text-xs font-bold text-blue-900">Żelazna Klasa</div>
                  <div className="text-[10px] text-blue-700">Frekwencja ponad 90%</div>
                </div>
              </div>

              <div className="p-2.5 bg-emerald-50/70 border border-emerald-200/70 rounded-xl flex items-center space-x-2">
                <span className="text-xl">⭐</span>
                <div className="leading-tight">
                  <div className="text-xs font-bold text-emerald-900">Wzór Ucznia</div>
                  <div className="text-[10px] text-emerald-700">Ponad 120 punktów</div>
                </div>
              </div>

              <div className="p-2.5 bg-purple-50/70 border border-purple-200/70 rounded-xl flex items-center space-x-2">
                <span className="text-xl">📜</span>
                <div className="leading-tight">
                  <div className="text-xs font-bold text-purple-900">Czyste Konto</div>
                  <div className="text-[10px] text-purple-700">Zero nagan dyscyplinarnych</div>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-3 pt-2.5 border-t border-slate-100 text-[11px] text-slate-500">
            Odznaki przyznawane są automatycznie na podstawie wpisów w e-dzienniku.
          </div>
        </div>
      </div>

      {/* Subject Plus & Minus Activity Matrix */}
      <div className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4 pb-3 border-b border-slate-100">
          <div>
            <h3 className="text-base font-extrabold text-[#0b192c] flex items-center space-x-2">
              <Zap className="w-5 h-5 text-amber-500" />
              <span>Plusy i Minusy Lekcyjne za Bieżącą Aktywność</span>
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              3 zebrane plusy z przedmiotu = ocena celująca / bardzo dobra z aktywności! 3 minusy = uwaga lub ocena cząstkowa.
            </p>
          </div>
          {isTeacherOrAdmin && (
            <span className="text-[11px] font-bold text-blue-700 bg-blue-50 px-2.5 py-1 rounded-lg border border-blue-200 self-start sm:self-auto">
              Kliknij [+] lub [-] przy wybranym przedmiocie
            </span>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {subjects.map(sub => {
            const subjectPM = studentPlusMinus.filter(pm => pm.subjectId === sub.id);
            const pluses = subjectPM.filter(pm => pm.type === 'plus');
            const minuses = subjectPM.filter(pm => pm.type === 'minus');

            return (
              <div
                key={sub.id}
                className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/50 hover:bg-white hover:border-blue-300 transition-all flex flex-col justify-between"
              >
                <div className="flex items-center justify-between">
                  <span className="font-extrabold text-xs text-slate-800">{sub.name}</span>
                  <span className="text-[10px] text-slate-400 font-semibold">{sub.teacherName}</span>
                </div>

                <div className="flex items-center space-x-2 my-2.5">
                  <div className="flex items-center space-x-1 flex-1">
                    {pluses.length === 0 && minuses.length === 0 ? (
                      <span className="text-xs text-slate-400 italic">Brak wpisów</span>
                    ) : (
                      <>
                        {pluses.map(p => (
                          <span
                            key={p.id}
                            title={`${p.note || 'Plus za aktywność'} (${p.date})`}
                            className="w-6 h-6 rounded-md bg-emerald-100 text-emerald-800 border border-emerald-300 font-black text-xs flex items-center justify-center cursor-help"
                          >
                            +
                          </span>
                        ))}
                        {minuses.map(m => (
                          <span
                            key={m.id}
                            title={`${m.note || 'Minus za nieprzygotowanie'} (${m.date})`}
                            className="w-6 h-6 rounded-md bg-rose-100 text-rose-800 border border-rose-300 font-black text-xs flex items-center justify-center cursor-help"
                          >
                            -
                          </span>
                        ))}
                      </>
                    )}
                  </div>

                  {isTeacherOrAdmin && (
                    <div className="flex items-center space-x-1">
                      <button
                        onClick={() => handleQuickAddPlusMinus(sub.id, 'plus')}
                        className="w-7 h-7 rounded-lg bg-emerald-50 hover:bg-emerald-600 text-emerald-700 hover:text-white border border-emerald-300 font-black text-xs transition-colors flex items-center justify-center cursor-pointer"
                        title="Dodaj plus (+)"
                      >
                        +
                      </button>
                      <button
                        onClick={() => handleQuickAddPlusMinus(sub.id, 'minus')}
                        className="w-7 h-7 rounded-lg bg-rose-50 hover:bg-rose-600 text-rose-700 hover:text-white border border-rose-300 font-black text-xs transition-colors flex items-center justify-center cursor-pointer"
                        title="Dodaj minus (-)"
                      >
                        -
                      </button>
                    </div>
                  )}
                </div>

                <div className="text-[10px] text-slate-500 flex justify-between">
                  <span>Bilans: {pluses.length} plusów, {minuses.length} minusów</span>
                  {pluses.length >= 3 && <span className="text-emerald-700 font-bold">Kwalifikacja do oceny!</span>}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Behavior Points Register List */}
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm overflow-hidden">
        <div className="p-4 sm:p-5 border-b border-slate-200/80 bg-slate-50/60 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="text-base font-extrabold text-[#0b192c]">
              Rejestr Punktów Zachowania, Pochwał i Uwag
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Wszystkie odnotowane punkty w roku szkolnym dla: {currentStudent?.firstName} {currentStudent?.lastName}
            </p>
          </div>
          <span className="text-xs font-bold text-slate-500">
            Łącznie wpisów: {filteredPoints.length}
          </span>
        </div>

        {filteredPoints.length === 0 ? (
          <div className="p-12 text-center text-slate-400 text-xs">
            Brak wpisów punktowych spełniających wybrane kryteria.
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {filteredPoints.map(point => {
              const isPositive = point.points > 0;
              return (
                <div
                  key={point.id}
                  className="p-4 sm:p-5 hover:bg-slate-50/80 transition-colors flex flex-col md:flex-row md:items-center justify-between gap-4"
                >
                  <div className="flex items-start space-x-3.5">
                    <div
                      className={`w-11 h-11 rounded-xl flex items-center justify-center font-black text-sm shrink-0 border shadow-xs ${
                        isPositive
                          ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                          : 'bg-rose-50 text-rose-800 border-rose-300'
                      }`}
                    >
                      {isPositive ? `+${point.points}` : point.points}
                    </div>

                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-extrabold text-slate-900 text-sm">{point.title}</span>
                        <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 border border-slate-200">
                          {point.category}
                        </span>
                        {point.subjectName && (
                          <span className="text-[10px] font-semibold text-blue-700 bg-blue-50 px-2 py-0.5 rounded-full border border-blue-200">
                            {point.subjectName}
                          </span>
                        )}
                      </div>

                      <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                        {point.description}
                      </p>

                      <div className="flex items-center space-x-3 mt-2 text-[11px] text-slate-400 font-medium">
                        <span className="flex items-center space-x-1">
                          <User className="w-3.5 h-3.5 text-slate-400" />
                          <span>Wystawił: {point.teacherName}</span>
                        </span>
                        <span>·</span>
                        <span className="flex items-center space-x-1">
                          <Calendar className="w-3.5 h-3.5 text-slate-400" />
                          <span>{point.date}</span>
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Delete button (Admin / Teacher only) */}
                  {isTeacherOrAdmin && (
                    <button
                      onClick={() => deleteBehaviorPoint(point.id)}
                      className="text-slate-400 hover:text-rose-600 p-2 rounded-lg hover:bg-rose-50 transition-colors self-end md:self-center cursor-pointer"
                      title="Usuń wpis punktowy"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Modal: Wystaw punkty / Pochwałę / Uwagę */}
      {modalOpen && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-xl w-full p-6 text-slate-900 border border-slate-200 animate-in fade-in zoom-in-95 duration-150 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 rounded-lg bg-amber-100 text-amber-800 flex items-center justify-center font-bold">
                  <Award className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-extrabold text-base text-slate-900">Nowy wpis punktowy zachowania</h3>
                  <p className="text-xs text-slate-500">
                    Uczeń: <strong>{currentStudent?.firstName} {currentStudent?.lastName}</strong> (klasa {currentStudent?.className})
                  </p>
                </div>
              </div>
              <button
                onClick={() => setModalOpen(false)}
                className="w-7 h-7 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 flex items-center justify-center"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreatePoint} className="space-y-4">
              {/* Type Switcher */}
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setNewType('pozytywny');
                    if (newPoints < 0) setNewPoints(Math.abs(newPoints) || 15);
                  }}
                  className={`py-2 px-3 rounded-xl border text-xs font-bold transition-all flex items-center justify-center space-x-1.5 ${
                    newType === 'pozytywny'
                      ? 'bg-emerald-600 text-white border-emerald-600 shadow-sm'
                      : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  <TrendingUp className="w-4 h-4" />
                  <span>Pochwała / Punkty dodatnie (+)</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setNewType('negatywny');
                    if (newPoints > 0) setNewPoints(-Math.abs(newPoints));
                  }}
                  className={`py-2 px-3 rounded-xl border text-xs font-bold transition-all flex items-center justify-center space-x-1.5 ${
                    newType === 'negatywny'
                      ? 'bg-rose-600 text-white border-rose-600 shadow-sm'
                      : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  <TrendingDown className="w-4 h-4" />
                  <span>Uwaga / Punkty ujemne (-)</span>
                </button>
              </div>

              {/* Quick Preset Buttons */}
              <div>
                <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                  Szybkie szablony szkolne:
                </label>
                <div className="flex flex-wrap gap-1.5">
                  {PRESET_CATEGORIES.filter(p => p.type === newType).slice(0, 5).map((preset, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => handleApplyPreset(preset)}
                      className="px-2.5 py-1 rounded-lg text-[11px] font-medium bg-slate-100 hover:bg-blue-50 hover:text-blue-700 text-slate-700 border border-slate-200 transition-colors"
                    >
                      {preset.title.slice(0, 26)}... ({preset.points > 0 ? '+' : ''}{preset.points}p)
                    </button>
                  ))}
                </div>
              </div>

              {/* Title & Points Input */}
              <div className="grid grid-cols-3 gap-3">
                <div className="col-span-2">
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Tytuł wpisu *
                  </label>
                  <input
                    type="text"
                    required
                    value={newTitle}
                    onChange={e => setNewTitle(e.target.value)}
                    placeholder="np. Pomoc w organizacji akademii"
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-600 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Liczba punktów *
                  </label>
                  <input
                    type="number"
                    required
                    value={newPoints}
                    onChange={e => setNewPoints(Number(e.target.value))}
                    className="w-full px-3 py-2 text-xs font-extrabold border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-600 focus:outline-none text-center"
                  />
                </div>
              </div>

              {/* Category & Subject */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Kategoria
                  </label>
                  <input
                    type="text"
                    value={newCategory}
                    onChange={e => setNewCategory(e.target.value)}
                    placeholder="np. Wolontariat, Dyscyplina"
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-600 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Dotyczy przedmiotu (opcjonalnie)
                  </label>
                  <select
                    value={newSubject}
                    onChange={e => setNewSubject(e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-600 focus:outline-none bg-white"
                  >
                    <option value="">(Brak / Ogólne)</option>
                    {subjects.map(s => (
                      <option key={s.id} value={s.name}>
                        {s.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Uzasadnienie wpisu
                </label>
                <textarea
                  rows={3}
                  value={newDescription}
                  onChange={e => setNewDescription(e.target.value)}
                  placeholder="Opisz okoliczności, zachowanie ucznia lub uzasadnienie przyznania punktów..."
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-600 focus:outline-none"
                />
              </div>

              {/* Footer */}
              <div className="flex justify-end space-x-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2 text-xs text-slate-600 hover:bg-slate-100 rounded-xl font-semibold transition-colors"
                >
                  Anuluj
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs text-white bg-blue-700 hover:bg-blue-800 rounded-xl font-bold transition-colors shadow-sm"
                >
                  Zapisz wpis w dzienniku
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
