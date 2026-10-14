import React, { useState } from 'react';
import { useJournal } from '../context/JournalContext';
import { TimetableLesson } from '../types';
import { LESSON_BELLS } from '../data/initialData';
import {
  Calendar,
  Clock,
  Printer,
  Plus,
  AlertTriangle,
  MapPin,
  User,
  X,
  Check,
  Sparkles,
  Layers,
  ChevronRight,
  BookOpen,
  Trash2,
  Wand2,
} from 'lucide-react';

export const TimetableView: React.FC = () => {
  const { timetable, students, users, currentUser, addLesson, deleteLesson } = useJournal();

  // Determine available classes from timetable, students, and default standard classes 4 & 5
  const defaultClasses = ['Klasa 4', 'Klasa 5', '4A', '4B', '5A', '5B'];
  const detectedClasses = Array.from(
    new Set([
      ...timetable.map(t => t.className).filter(Boolean),
      ...students.map(s => s.className).filter(Boolean),
    ])
  );
  const allClasses = Array.from(new Set([...defaultClasses, ...detectedClasses]));

  const [selectedClass, setSelectedClass] = useState<string>(allClasses[0] || 'Klasa 4');
  const [customClassInput, setCustomClassInput] = useState('');
  const [showCustomClassModal, setShowCustomClassModal] = useState(false);
  const [viewMode, setViewMode] = useState<'week' | 'agenda'>('week');
  const [addModalOpen, setAddModalOpen] = useState(false);

  // Form states for adding lesson
  const [newDay, setNewDay] = useState<1 | 2 | 3 | 4 | 5>(1);
  const [newHour, setNewHour] = useState(1);
  const [newSubject, setNewSubject] = useState('Matematyka');
  const [newTeacher, setNewTeacher] = useState('mgr Tomasz Kowalczyk');
  const [newRoom, setNewRoom] = useState('Sala 1');
  const [newGroupName, setNewGroupName] = useState('cała klasa');
  const [newTopic, setNewTopic] = useState('');
  const [newIsSub, setNewIsSub] = useState(false);
  const [newSubNote, setNewSubNote] = useState('');

  const isTeacherOrAdmin = currentUser?.role === 'admin' || currentUser?.role === 'teacher';

  const days: { dayNumber: 1 | 2 | 3 | 4 | 5; label: string }[] = [
    { dayNumber: 1, label: 'Poniedziałek' },
    { dayNumber: 2, label: 'Wtorek' },
    { dayNumber: 3, label: 'Środa' },
    { dayNumber: 4, label: 'Czwartek' },
    { dayNumber: 5, label: 'Piątek' },
  ];

  // Current day simulation (1 = Monday, 5 = Friday)
  const currentDayOfWeek = 1;

  // Filter lessons for selected class
  const classLessons = timetable.filter(t => t.className === selectedClass);

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const bell = LESSON_BELLS.find(b => b.hour === newHour) || LESSON_BELLS[0];
    addLesson({
      dayOfWeek: newDay,
      lessonHour: newHour,
      timeStart: bell.start,
      timeEnd: bell.end,
      subjectName: newSubject.trim(),
      classroom: newRoom.trim(),
      teacherName: newTeacher.trim() || 'Nauczyciel',
      className: selectedClass,
      groupName: newGroupName,
      lessonTopic: newTopic.trim() || undefined,
      isSubstitution: newIsSub,
      substitutionNote: newSubNote.trim() || undefined,
    });
    setAddModalOpen(false);
    setNewTopic('');
    setNewIsSub(false);
    setNewSubNote('');
  };

  // Quick seed generator for classes 4 or 5 using rooms 1-4 (as requested: "Możemy użyć tylko sal od jeden do czterech")
  const handleQuickSeedPlan = () => {
    const subjectsSeed = [
      { name: 'Język polski', teacher: 'mgr Anna Nowak', room: 'Sala 1' },
      { name: 'Matematyka', teacher: 'mgr Tomasz Kowalczyk', room: 'Sala 2' },
      { name: 'Język angielski', teacher: 'mgr John Miller', room: 'Sala 3' },
      { name: 'Przyroda', teacher: 'mgr Katarzyna Wróbel', room: 'Sala 4' },
      { name: 'Informatyka', teacher: 'mgr Tomasz Kowalczyk', room: 'Sala 2' },
      { name: 'Historia', teacher: 'mgr Piotr Adamski', room: 'Sala 1' },
      { name: 'Wychowanie fizyczne', teacher: 'mgr Grzegorz Bąk', room: 'Sala 4' },
    ];

    days.forEach(d => {
      for (let h = 1; h <= 5; h++) {
        const item = subjectsSeed[(d.dayNumber * 2 + h) % subjectsSeed.length];
        const bell = LESSON_BELLS.find(b => b.hour === h) || LESSON_BELLS[h - 1];
        addLesson({
          dayOfWeek: d.dayNumber,
          lessonHour: h,
          timeStart: bell.start,
          timeEnd: bell.end,
          subjectName: item.name,
          classroom: item.room,
          teacherName: item.teacher,
          className: selectedClass,
          groupName: 'cała klasa',
          lessonTopic: `Wprowadzenie do działu i ćwiczenia w ${item.room}`,
        });
      }
    });
  };

  return (
    <div className="space-y-5">
      {/* Librus Synergia Top Bar: Lucky Number & Quick Details */}
      <div className="bg-gradient-to-r from-[#0b192c] via-[#152e4d] to-[#1e3a8a] text-white p-3.5 sm:p-4 rounded-2xl shadow-sm border border-blue-900 flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-amber-400 text-slate-950 font-black text-sm flex items-center justify-center shadow-md shrink-0">
            14
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="text-xs font-extrabold uppercase tracking-wider text-amber-300">
                Szczęśliwy numerek na dzisiaj
              </span>
              <span className="text-[10px] bg-white/10 px-2 py-0.5 rounded-full text-slate-200">
                Librus Synergia
              </span>
            </div>
            <p className="text-xs text-slate-300 mt-0.5">
              Uczeń z numerem <strong>14</strong> w dzienniku jest zwolniony z niezapowiedzianych kartkówek i odpowiedzi przy tablicy!
            </p>
          </div>
        </div>

        {/* View Mode Switcher */}
        <div className="flex items-center space-x-1 bg-white/10 p-1 rounded-xl text-xs self-start md:self-center">
          <button
            onClick={() => setViewMode('week')}
            className={`px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer ${
              viewMode === 'week'
                ? 'bg-amber-400 text-slate-950 shadow-xs'
                : 'text-slate-300 hover:text-white'
            }`}
          >
            Tydzień (Tabela)
          </button>
          <button
            onClick={() => setViewMode('agenda')}
            className={`px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer ${
              viewMode === 'agenda'
                ? 'bg-amber-400 text-slate-950 shadow-xs'
                : 'text-slate-300 hover:text-white'
            }`}
          >
            Agenda dnia
          </button>
        </div>
      </div>

      {/* Top action toolbar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-2.5">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
            Oddział / Klasa:
          </span>
          <select
            value={selectedClass}
            onChange={e => {
              if (e.target.value === 'ADD_NEW') {
                setShowCustomClassModal(true);
              } else {
                setSelectedClass(e.target.value);
              }
            }}
            className="text-xs font-bold text-[#1a365d] bg-slate-50 border border-slate-300 rounded-lg px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-[#1a365d]"
          >
            {allClasses.map(cls => (
              <option key={cls} value={cls}>
                {cls.startsWith('Klasa') ? cls : `Klasa ${cls}`}
              </option>
            ))}
            <option value="ADD_NEW">+ Dodaj inny oddział...</option>
          </select>

          <span className="text-xs text-slate-500 hidden md:inline">
            · Dostępne sale: <strong className="text-slate-800">Sala 1, Sala 2, Sala 3, Sala 4</strong>
          </span>

          <span className="text-xs text-blue-800 font-semibold bg-blue-50 px-2.5 py-1 rounded-md border border-blue-200">
            Lekcji w planie: {classLessons.length}
          </span>
        </div>

        <div className="flex items-center space-x-2">
          {isTeacherOrAdmin && classLessons.length === 0 && (
            <button
              onClick={handleQuickSeedPlan}
              className="px-3 py-1.5 bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-300 text-xs font-bold rounded-lg flex items-center space-x-1.5 transition-colors cursor-pointer"
              title="Wstaw przykładowy plan zajęć dla zabawy i testów (sale 1-4)"
            >
              <Wand2 className="w-3.5 h-3.5 text-amber-700" />
              <span>Wstaw plan startowy (sale 1-4)</span>
            </button>
          )}

          <button
            onClick={() => window.print()}
            className="p-1.5 sm:px-2.5 py-1.5 rounded-lg border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 text-xs flex items-center space-x-1 cursor-pointer"
            title="Drukuj plan lekcji"
          >
            <Printer className="w-4 h-4 text-slate-500" />
            <span className="hidden sm:inline">Drukuj plan</span>
          </button>

          {isTeacherOrAdmin && (
            <button
              onClick={() => setAddModalOpen(true)}
              className="px-3.5 py-1.5 bg-[#1a365d] hover:bg-[#152c4d] text-white text-xs font-bold rounded-lg flex items-center space-x-1.5 shadow-sm transition-colors cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Dodaj lekcję do planu</span>
            </button>
          )}
        </div>
      </div>

      {/* Empty State when class has no lessons */}
      {classLessons.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-8 sm:p-12 text-center shadow-xs">
          <div className="w-16 h-16 rounded-2xl bg-blue-50 text-blue-700 flex items-center justify-center mx-auto mb-4 border border-blue-100">
            <Calendar className="w-8 h-8" />
          </div>
          <h3 className="text-base font-bold text-slate-900 mb-1">
            Brak wpisanych lekcji dla: {selectedClass}
          </h3>
          <p className="text-xs text-slate-500 max-w-md mx-auto mb-6 leading-relaxed">
            Plan lekcji dla tego oddziału jest jeszcze pusty. Jako Administrator możesz samodzielnie ułożyć rozkład zajęć, korzystając z sal od 1 do 4.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-3">
            {isTeacherOrAdmin && (
              <button
                onClick={() => setAddModalOpen(true)}
                className="px-4 py-2 bg-[#1a365d] hover:bg-[#152c4d] text-white font-bold text-xs rounded-xl flex items-center space-x-2 shadow-sm cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>Dodaj pierwszą lekcję do planu</span>
              </button>
            )}
            {isTeacherOrAdmin && (
              <button
                onClick={handleQuickSeedPlan}
                className="px-4 py-2 bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-300 font-bold text-xs rounded-xl flex items-center space-x-2 transition-colors cursor-pointer"
              >
                <Wand2 className="w-4 h-4 text-amber-700" />
                <span>Wstaw gotowy plan lekcji (sale 1-4)</span>
              </button>
            )}
          </div>
        </div>
      ) : viewMode === 'week' ? (
        /* Weekly Grid Table */
        <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-[#1a365d] text-white border-b border-[#1a365d]">
                  <th className="py-3 px-3 w-12 text-center border-r border-white/10">Lekcja</th>
                  <th className="py-3 px-3 w-28 border-r border-white/10 text-center">Godziny</th>
                  {days.map(d => (
                    <th
                      key={d.dayNumber}
                      className={`py-3 px-4 min-w-[180px] border-r border-white/10 ${
                        d.dayNumber === currentDayOfWeek ? 'bg-[#152c4d]' : ''
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-bold">{d.label}</span>
                        {d.dayNumber === currentDayOfWeek && (
                          <span className="text-[10px] bg-amber-400 text-slate-900 font-extrabold px-1.5 py-0.2 rounded">
                            Dzisiaj
                          </span>
                        )}
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-200">
                {LESSON_BELLS.map(bell => (
                  <tr key={bell.hour} className="hover:bg-slate-50/50 transition-colors">
                    {/* Period number */}
                    <td className="py-3 px-3 text-center font-bold text-slate-700 bg-slate-50 border-r border-slate-200">
                      {bell.hour}
                    </td>

                    {/* Bell hours */}
                    <td className="py-3 px-3 text-center text-slate-500 font-medium bg-slate-50 border-r border-slate-200">
                      <div className="text-slate-800 font-semibold">{bell.start}</div>
                      <div className="text-[10px] text-slate-400">{bell.end}</div>
                    </td>

                    {/* 5 days */}
                    {days.map(d => {
                      const lesson = timetable.find(
                        t =>
                          t.className === selectedClass &&
                          t.dayOfWeek === d.dayNumber &&
                          t.lessonHour === bell.hour
                      );

                      const isToday = d.dayNumber === currentDayOfWeek;

                      if (!lesson) {
                        return (
                          <td
                            key={d.dayNumber}
                            className={`py-2 px-3 border-r border-slate-200 ${
                              isToday ? 'bg-amber-50/20' : ''
                            }`}
                          >
                            <span className="text-slate-200 text-xs italic">—</span>
                          </td>
                        );
                      }

                      return (
                        <td
                          key={d.dayNumber}
                          className={`py-2.5 px-3 border-r border-slate-200 align-top ${
                            isToday ? 'bg-amber-50/30' : ''
                          }`}
                        >
                          <div
                            className={`p-2.5 rounded-lg border transition-all ${
                              lesson.isCancelled
                                ? 'bg-rose-50/70 border-rose-300 opacity-75'
                                : lesson.isSubstitution
                                ? 'bg-amber-50/80 border-amber-300'
                                : 'bg-white border-slate-200 hover:border-blue-300 hover:shadow-2xs'
                            }`}
                          >
                            <div className="font-bold text-slate-900 text-xs flex items-center justify-between">
                              <span className={lesson.isCancelled ? 'line-through text-rose-800' : ''}>
                                {lesson.subjectName}
                              </span>
                              {isTeacherOrAdmin && (
                                <button
                                  onClick={() => deleteLesson(lesson.id)}
                                  title="Usuń tę lekcję z planu"
                                  className="text-slate-300 hover:text-red-600 text-[11px] p-0.5 cursor-pointer"
                                >
                                  ✕
                                </button>
                              )}
                            </div>

                            {lesson.groupName && lesson.groupName !== 'cała klasa' && (
                              <span className="inline-block text-[9px] font-bold px-1.5 py-0.2 rounded bg-slate-100 text-slate-600 mt-0.5">
                                {lesson.groupName}
                              </span>
                            )}

                            <div className="text-[11px] text-slate-600 mt-1 flex items-center space-x-1">
                              <User className="w-3 h-3 text-slate-400 shrink-0" />
                              <span className="truncate">{lesson.teacherName}</span>
                            </div>

                            <div className="text-[11px] text-slate-500 flex items-center space-x-1 mt-0.5">
                              <MapPin className="w-3 h-3 text-slate-400 shrink-0" />
                              <span className="font-bold text-slate-800 bg-slate-100 px-1 rounded">
                                {lesson.classroom}
                              </span>
                            </div>

                            {lesson.lessonTopic && (
                              <div className="mt-1 text-[10px] text-slate-500 italic truncate border-t border-slate-100 pt-1">
                                Temat: {lesson.lessonTopic}
                              </div>
                            )}

                            {lesson.isSubstitution && (
                              <div className="mt-1 text-[10px] text-amber-800 bg-amber-100/80 p-1 rounded font-medium flex items-start space-x-1">
                                <AlertTriangle className="w-3 h-3 text-amber-600 shrink-0 mt-0.5" />
                                <span>{lesson.substitutionNote || 'Zastępstwo'}</span>
                              </div>
                            )}

                            {lesson.isCancelled && (
                              <div className="mt-1 text-[10px] text-rose-800 bg-rose-100/80 p-1 rounded font-medium">
                                Lekcja odwołana: {lesson.cancelReason || 'Zajęcia nie odbędą się'}
                              </div>
                            )}
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
      ) : (
        /* Agenda View (Today's detailed lessons) */
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div>
              <h3 className="font-bold text-slate-900 text-sm">
                Dzisiejsze lekcje · Poniedziałek ({selectedClass})
              </h3>
              <p className="text-xs text-slate-500">
                Szczegółowa agenda z godzinami przerw i salami lekcyjnymi (Sale 1-4)
              </p>
            </div>
            <span className="text-xs font-bold bg-amber-100 text-amber-900 px-2.5 py-1 rounded-md border border-amber-300">
              Dzień dzisiejszy
            </span>
          </div>

          <div className="space-y-2.5">
            {LESSON_BELLS.map(bell => {
              const lesson = timetable.find(
                t =>
                  t.className === selectedClass &&
                  t.dayOfWeek === currentDayOfWeek &&
                  t.lessonHour === bell.hour
              );

              return (
                <div
                  key={bell.hour}
                  className={`p-3.5 rounded-xl border flex items-center justify-between transition-colors ${
                    lesson
                      ? 'bg-slate-50/70 border-slate-200'
                      : 'bg-white border-dashed border-slate-200 text-slate-400'
                  }`}
                >
                  <div className="flex items-center space-x-4">
                    <div className="w-8 h-8 rounded-lg bg-blue-900 text-amber-300 font-bold text-xs flex items-center justify-center shrink-0">
                      {bell.hour}
                    </div>
                    <div>
                      <div className="text-xs font-mono font-bold text-slate-600">
                        {bell.start} - {bell.end}
                      </div>
                      {lesson ? (
                        <div className="text-sm font-bold text-slate-900 flex items-center space-x-2">
                          <span>{lesson.subjectName}</span>
                          <span className="text-[11px] font-normal text-slate-500">
                            ({lesson.teacherName})
                          </span>
                        </div>
                      ) : (
                        <div className="text-xs italic text-slate-400">Okienko / brak zajęć</div>
                      )}
                    </div>
                  </div>

                  {lesson && (
                    <div className="flex items-center space-x-3">
                      <span className="text-xs font-bold bg-white border border-slate-300 text-slate-800 px-2.5 py-1 rounded-lg">
                        {lesson.classroom}
                      </span>
                      {isTeacherOrAdmin && (
                        <button
                          onClick={() => deleteLesson(lesson.id)}
                          className="text-slate-300 hover:text-rose-600 text-xs cursor-pointer"
                          title="Usuń"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Add Custom Class Modal */}
      {showCustomClassModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-sm w-full p-5 border border-slate-200 space-y-4">
            <h3 className="font-bold text-slate-900 text-sm">Dodaj nowy oddział / klasę</h3>
            <p className="text-xs text-slate-500">
              Wpisz oznaczenie klasy (np. <strong>Klasa 4</strong>, <strong>Klasa 5</strong>, <strong>4C</strong>, <strong>5B</strong>).
            </p>
            <input
              type="text"
              autoFocus
              value={customClassInput}
              onChange={e => setCustomClassInput(e.target.value)}
              placeholder="np. Klasa 4A lub Klasa 5"
              className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#1a365d] focus:outline-none"
            />
            <div className="flex justify-end space-x-2 pt-2">
              <button
                type="button"
                onClick={() => setShowCustomClassModal(false)}
                className="px-3 py-1.5 text-xs text-slate-600 hover:bg-slate-100 rounded-lg"
              >
                Anuluj
              </button>
              <button
                type="button"
                onClick={() => {
                  if (customClassInput.trim()) {
                    setSelectedClass(customClassInput.trim());
                    setShowCustomClassModal(false);
                    setCustomClassInput('');
                  }
                }}
                className="px-4 py-1.5 text-xs font-bold bg-[#1a365d] text-white rounded-lg shadow-sm"
              >
                Ustaw klasę
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Lesson Modal */}
      {addModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full overflow-hidden border border-slate-200 animate-in fade-in zoom-in duration-150">
            <div className="bg-gradient-to-r from-[#0b192c] to-[#1a365d] text-white px-5 py-4 flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Calendar className="w-5 h-5 text-amber-300" />
                <h3 className="text-sm font-bold">
                  Dodaj lekcję do planu ({selectedClass})
                </h3>
              </div>
              <button
                onClick={() => setAddModalOpen(false)}
                className="text-slate-300 hover:text-white cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddSubmit} className="p-5 space-y-3.5 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Dzień tygodnia
                  </label>
                  <select
                    value={newDay}
                    onChange={e => setNewDay(parseInt(e.target.value) as 1 | 2 | 3 | 4 | 5)}
                    className="w-full p-2 border border-slate-300 rounded-lg bg-slate-50 font-medium"
                  >
                    <option value={1}>Poniedziałek</option>
                    <option value={2}>Wtorek</option>
                    <option value={3}>Środa</option>
                    <option value={4}>Czwartek</option>
                    <option value={5}>Piątek</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Nr lekcji (Godziny)
                  </label>
                  <select
                    value={newHour}
                    onChange={e => setNewHour(parseInt(e.target.value))}
                    className="w-full p-2 border border-slate-300 rounded-lg bg-slate-50 font-medium"
                  >
                    {LESSON_BELLS.map(b => (
                      <option key={b.hour} value={b.hour}>
                        Lekcja {b.hour} ({b.start} - {b.end})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Subject */}
              <div>
                <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Przedmiot szkolny
                </label>
                <input
                  type="text"
                  required
                  value={newSubject}
                  onChange={e => setNewSubject(e.target.value)}
                  placeholder="np. Matematyka, Język polski, Przyroda"
                  className="w-full p-2 border border-slate-300 rounded-lg bg-slate-50 font-medium text-slate-900"
                />
                <div className="flex flex-wrap gap-1 mt-1.5">
                  {['Język polski', 'Matematyka', 'Język angielski', 'Przyroda', 'Informatyka', 'Historia', 'WF'].map(
                    sub => (
                      <button
                        key={sub}
                        type="button"
                        onClick={() => setNewSubject(sub)}
                        className="text-[10px] px-2 py-0.5 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 cursor-pointer"
                      >
                        {sub}
                      </button>
                    )
                  )}
                </div>
              </div>

              {/* Room Selection: Specifically Sale 1-4 as requested! */}
              <div>
                <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Sala lekcyjna (Sale 1-4)
                </label>
                <div className="grid grid-cols-4 gap-1.5 mb-1.5">
                  {['Sala 1', 'Sala 2', 'Sala 3', 'Sala 4'].map(room => (
                    <button
                      key={room}
                      type="button"
                      onClick={() => setNewRoom(room)}
                      className={`py-1.5 px-2 rounded-lg border text-center font-bold text-xs transition-all cursor-pointer ${
                        newRoom === room
                          ? 'bg-blue-900 text-amber-300 border-blue-900 shadow-2xs'
                          : 'bg-slate-50 text-slate-700 border-slate-300 hover:bg-slate-100'
                      }`}
                    >
                      {room}
                    </button>
                  ))}
                </div>
                <input
                  type="text"
                  required
                  value={newRoom}
                  onChange={e => setNewRoom(e.target.value)}
                  placeholder="Wpisz lub wybierz salę..."
                  className="w-full p-2 border border-slate-300 rounded-lg bg-slate-50 text-xs font-semibold"
                />
              </div>

              {/* Teacher */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Nauczyciel prowadzący
                  </label>
                  <input
                    type="text"
                    required
                    value={newTeacher}
                    onChange={e => setNewTeacher(e.target.value)}
                    placeholder="np. mgr Anna Nowak"
                    className="w-full p-2 border border-slate-300 rounded-lg bg-slate-50 font-medium"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Grupa / Podział
                  </label>
                  <select
                    value={newGroupName}
                    onChange={e => setNewGroupName(e.target.value)}
                    className="w-full p-2 border border-slate-300 rounded-lg bg-slate-50 font-medium"
                  >
                    <option value="cała klasa">Cała klasa</option>
                    <option value="gr. 1/2">Grupa 1</option>
                    <option value="gr. 2/2">Grupa 2</option>
                    <option value="chłopcy">Grupa chłopców (WF)</option>
                    <option value="dziewczęta">Grupa dziewcząt (WF)</option>
                  </select>
                </div>
              </div>

              {/* Planned Lesson Topic */}
              <div>
                <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Planowany temat lekcji (opcjonalnie)
                </label>
                <input
                  type="text"
                  value={newTopic}
                  onChange={e => setNewTopic(e.target.value)}
                  placeholder="np. Własności figur geometrycznych"
                  className="w-full p-2 border border-slate-300 rounded-lg bg-slate-50"
                />
              </div>

              {/* Substitution checkbox */}
              <div className="pt-2 border-t border-slate-100">
                <label className="flex items-center space-x-2 cursor-pointer mb-2">
                  <input
                    type="checkbox"
                    checked={newIsSub}
                    onChange={e => setNewIsSub(e.target.checked)}
                    className="rounded text-blue-600 focus:ring-blue-500"
                  />
                  <span className="font-bold text-slate-700">Zastępstwo / zmiana w planie</span>
                </label>

                {newIsSub && (
                  <input
                    type="text"
                    value={newSubNote}
                    onChange={e => setNewSubNote(e.target.value)}
                    placeholder="Wpisz informację o zastępstwie..."
                    className="w-full p-2 border border-amber-300 rounded-lg bg-amber-50 text-amber-950 font-medium"
                  />
                )}
              </div>

              <div className="flex justify-end space-x-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setAddModalOpen(false)}
                  className="px-3 py-1.5 text-slate-600 hover:bg-slate-100 rounded-lg cursor-pointer"
                >
                  Anuluj
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 font-bold bg-[#1a365d] hover:bg-[#152c4d] text-white rounded-lg flex items-center space-x-1.5 shadow-sm cursor-pointer"
                >
                  <Check className="w-4 h-4 text-amber-300" />
                  <span>Zapisz lekcję w planie</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
