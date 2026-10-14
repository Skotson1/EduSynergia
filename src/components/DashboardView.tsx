import React, { useState } from 'react';
import { useJournal } from '../context/JournalContext';
import { ActiveTab } from './Header';
import { GradeDetailModal } from './GradeDetailModal';
import { Grade } from '../types';
import {
  GraduationCap,
  Clock,
  Sparkles,
  Calendar,
  Mail,
  Bell,
  ArrowRight,
  CheckCircle,
  AlertCircle,
  FileText,
  BookmarkCheck,
  ChevronRight,
  TrendingUp,
  Award,
} from 'lucide-react';

interface DashboardViewProps {
  setActiveTab: (tab: ActiveTab) => void;
  onOpenAddGrade?: () => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({ setActiveTab, onOpenAddGrade }) => {
  const {
    currentUser,
    systemConfig,
    students,
    subjects,
    grades,
    timetable,
    attendance,
    messages,
    announcements,
    homework,
    getOverallAverage,
    getAttendanceStats,
    getBehaviorStats,
  } = useJournal();

  const [selectedGrade, setSelectedGrade] = useState<Grade | null>(null);

  // Active student for student/parent perspective
  const currentStudent =
    currentUser?.role === 'student' || currentUser?.role === 'parent'
      ? students.find(s => s.id === currentUser.studentId) || students[0]
      : students[0];

  const overallAverage = currentStudent ? getOverallAverage(currentStudent.id, 2) : 4.85;
  const attendanceStats = currentStudent ? getAttendanceStats(currentStudent.id) : { rate: 94.2, total: 25, present: 22, excused: 2, unexcused: 1, late: 1 };

  // Lucky number of the day (classic Polish school tradition)
  const luckyNumber = 7;
  const isLucky = currentStudent?.numberInJournal === luckyNumber;

  // Recent grades for this student (last 6)
  const recentGrades = grades
    .filter(g => g.studentId === currentStudent?.id)
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 6);

  // Today's lessons (simulate Monday/today)
  const todayLessons = timetable
    .filter(t => t.dayOfWeek === 1)
    .sort((a, b) => a.lessonHour - b.lessonHour);

  // Upcoming tests & homework
  const upcomingTasks = homework.slice(0, 4);

  // Latest announcements
  const latestAnnouncements = announcements.slice(0, 3);

  const categoryColorMap: Record<string, string> = {
    sprawdzian: 'bg-red-100 text-red-800 border-red-200',
    kartkowka: 'bg-emerald-100 text-emerald-800 border-emerald-200',
    odpowiedz: 'bg-blue-100 text-blue-800 border-blue-200',
    praca_klasowa: 'bg-purple-100 text-purple-800 border-purple-200',
    zadanie_domowe: 'bg-amber-100 text-amber-800 border-amber-200',
    aktywnosc: 'bg-teal-100 text-teal-800 border-teal-200',
    projekt: 'bg-indigo-100 text-indigo-800 border-indigo-200',
  };

  const behaviorStats = currentStudent
    ? getBehaviorStats(currentStudent.id)
    : { finalPoints: 145, rankTitle: 'Wzorowe', positiveTotal: 65, negativeTotal: 20 };

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-[#0b192c] via-[#102a4e] to-[#1e3a8a] rounded-2xl text-white p-5 sm:p-6 shadow-md border border-blue-900/60 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2 text-xs text-amber-300 font-semibold uppercase tracking-wider mb-1">
            <Sparkles className="w-4 h-4 text-amber-400" />
            <span>
              {currentUser?.role === 'admin'
                ? 'Biurko Dyrekcji i Administratora Placówki'
                : 'Panel Ucznia i Rodzica'} · Rok {systemConfig.academicYear || '2025/2026'} (Semestr {systemConfig.semester === 1 ? 'I' : 'II'})
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black tracking-tight">
            Witaj, {currentUser?.name || 'Administratorze'}!
          </h1>
          <p className="text-xs sm:text-sm text-slate-200 mt-1 max-w-xl">
            {currentStudent ? (
              <>
                Podgląd danych dla: <strong className="text-white font-bold">{currentStudent.firstName} {currentStudent.lastName}</strong> (Klasa {currentStudent.className}, nr {currentStudent.numberInJournal} w dzienniku)
              </>
            ) : (
              `Zarządzanie szkołą "${systemConfig.schoolName || 'Moja Szkoła'}" (${systemConfig.schoolCity || 'Polska'}) · Tryb Administratora`
            )}
          </p>
        </div>

        {/* Quick action buttons for teachers/admin or fast jumps */}
        <div className="flex flex-wrap gap-2">
          {currentUser?.role === 'admin' && (
            <button
              onClick={() => setActiveTab('admin')}
              className="px-3.5 py-2 bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-slate-950 rounded-xl text-xs font-black transition-colors shadow-sm flex items-center space-x-1.5 cursor-pointer active:scale-98"
            >
              <span>Panel Dyrekcji</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          )}
          <button
            onClick={() => setActiveTab('timetable')}
            className="px-3.5 py-2 bg-white/10 hover:bg-white/20 border border-white/20 text-white rounded-xl text-xs font-semibold transition-colors flex items-center space-x-1 cursor-pointer"
          >
            <span>Plan lekcji (Sale 1-4)</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Admin Clean Setup Guide if no students or no timetable yet */}
      {currentUser?.role === 'admin' && students.length === 0 && (
        <div className="bg-gradient-to-r from-amber-50 via-blue-50 to-indigo-50 border border-blue-200 p-5 rounded-2xl shadow-xs space-y-3">
          <div className="flex items-center space-x-2 text-xs font-extrabold text-blue-950 uppercase tracking-wide">
            <Sparkles className="w-4 h-4 text-amber-500" />
            <span>Dziennik gotowy do użycia i zabawy · Twoje centrum dowodzenia</span>
          </div>
          <p className="text-xs text-slate-700 leading-relaxed max-w-2xl">
            Zarejestrowałeś nowe konto Administratora. Dziennik został poszykowany na czysto bez gotowych kont. Możesz teraz w pełni samodzielnie zarządzać szkołą:
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
            <div
              onClick={() => setActiveTab('admin')}
              className="p-3 bg-white rounded-xl border border-slate-200 hover:border-blue-400 hover:shadow-xs transition-all cursor-pointer"
            >
              <div className="font-bold text-xs text-blue-900 mb-0.5">1. Dodaj klasy i uczniów</div>
              <div className="text-[11px] text-slate-500">W Panelu Dyrekcji utwórz oddziały (np. Klasa 4, Klasa 5) i dodaj konta uczniów.</div>
            </div>

            <div
              onClick={() => setActiveTab('timetable')}
              className="p-3 bg-white rounded-xl border border-slate-200 hover:border-blue-400 hover:shadow-xs transition-all cursor-pointer"
            >
              <div className="font-bold text-xs text-blue-900 mb-0.5">2. Ułóż plan lekcji</div>
              <div className="text-[11px] text-slate-500">W zakładce "Plan lekcji" przypisz przedmioty i nauczycieli do sal od 1 do 4.</div>
            </div>

            <div
              onClick={() => setActiveTab('behavior')}
              className="p-3 bg-white rounded-xl border border-slate-200 hover:border-blue-400 hover:shadow-xs transition-all cursor-pointer"
            >
              <div className="font-bold text-xs text-blue-900 mb-0.5">3. Punkty Neuroshima</div>
              <div className="text-[11px] text-slate-500">Wystawiaj punkty dodatnie, minusowe i plusy lekcyjne z kartą cech RPG.</div>
            </div>
          </div>
        </div>
      )}

      {/* 5 Summary Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3.5">
        {/* Card 1: Średnia ocen */}
        <div
          onClick={() => setActiveTab('grades')}
          className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs hover:border-blue-400 hover:shadow-sm transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between text-slate-500 mb-1.5">
            <span className="text-[10px] font-bold uppercase tracking-wider">Średnia ocen (Sem. II)</span>
            <GraduationCap className="w-4 h-4 text-blue-600 group-hover:scale-110 transition-transform" />
          </div>
          <div className="flex items-baseline space-x-1.5">
            <span className="text-2xl font-black text-[#0b192c]">
              {overallAverage !== null ? overallAverage.toFixed(2) : '—'}
            </span>
            {overallAverage !== null && overallAverage >= 4.75 && (
              <span className="text-[10px] font-bold text-emerald-800 bg-emerald-50 px-1.5 py-0.2 rounded border border-emerald-200">
                Pasek 🏅
              </span>
            )}
          </div>
          <p className="text-[10px] text-slate-400 mt-2 flex items-center gap-1">
            <TrendingUp className="w-3 h-3 text-emerald-600" />
            <span>Średnia ważona</span>
          </p>
        </div>

        {/* Card 2: Frekwencja */}
        <div
          onClick={() => setActiveTab('attendance')}
          className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs hover:border-emerald-400 hover:shadow-sm transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between text-slate-500 mb-1.5">
            <span className="text-[10px] font-bold uppercase tracking-wider">Frekwencja</span>
            <Clock className="w-4 h-4 text-emerald-600 group-hover:scale-110 transition-transform" />
          </div>
          <div className="flex items-baseline space-x-1.5">
            <span className="text-2xl font-black text-[#0b192c]">
              {attendanceStats.rate}%
            </span>
            <span className="text-[10px] font-medium text-slate-500">
              ({attendanceStats.present}/{attendanceStats.total}h)
            </span>
          </div>
          <div className="w-full bg-slate-100 h-1.5 rounded-full mt-2.5 overflow-hidden">
            <div
              className={`h-full rounded-full ${
                attendanceStats.rate >= 85 ? 'bg-emerald-500' : 'bg-amber-500'
              }`}
              style={{ width: `${Math.min(100, attendanceStats.rate)}%` }}
            />
          </div>
        </div>

        {/* Card 3: Punkty & Zachowanie (Neuroshima) */}
        <div
          onClick={() => setActiveTab('behavior')}
          className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs hover:border-amber-400 hover:shadow-sm transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between text-slate-500 mb-1.5">
            <span className="text-[10px] font-bold uppercase tracking-wider">Punkty Zachowania</span>
            <Award className="w-4 h-4 text-amber-500 group-hover:scale-110 transition-transform" />
          </div>
          <div className="flex items-baseline space-x-1.5">
            <span className="text-2xl font-black text-[#0b192c]">
              {behaviorStats.finalPoints} <span className="text-xs font-bold text-slate-400">pkt</span>
            </span>
            <span className="text-[10px] font-bold text-amber-800 bg-amber-50 px-1.5 py-0.2 rounded border border-amber-200">
              {behaviorStats.rankTitle}
            </span>
          </div>
          <p className="text-[10px] text-blue-600 hover:underline mt-2 flex items-center gap-1 font-medium">
            <span>Karta cech i wpisy</span>
            <ArrowRight className="w-2.5 h-2.5" />
          </p>
        </div>

        {/* Card 4: Szczęśliwy Numerek */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between text-slate-500 mb-1.5">
            <span className="text-[10px] font-bold uppercase tracking-wider">Szczęśliwy numerek</span>
            <Sparkles className="w-4 h-4 text-amber-500" />
          </div>
          <div className="flex items-baseline space-x-1.5">
            <span className="text-2xl font-black text-amber-600">
              #{luckyNumber}
            </span>
            <span className="text-[10px] text-slate-500 font-medium">dzisiaj</span>
          </div>
          <p className="text-[10px] text-slate-400 mt-2 truncate">
            {isLucky ? 'Twój numer! Ochrona 🎉' : 'Ochrona przed pytaniem'}
          </p>
        </div>

        {/* Card 5: Wiadomości */}
        <div
          onClick={() => setActiveTab('messages')}
          className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs hover:border-purple-400 hover:shadow-sm transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between text-slate-500 mb-1.5">
            <span className="text-[10px] font-bold uppercase tracking-wider">Poczta szkolna</span>
            <Mail className="w-4 h-4 text-purple-600 group-hover:scale-110 transition-transform" />
          </div>
          <div className="flex items-baseline space-x-1.5">
            <span className="text-2xl font-black text-[#0b192c]">
              {messages.length}
            </span>
            <span className="text-[10px] text-slate-500">wiadomości</span>
          </div>
          <p className="text-[10px] text-blue-600 hover:underline mt-2 flex items-center gap-1 font-medium">
            <span>Przejdź do poczty</span>
            <ArrowRight className="w-2.5 h-2.5" />
          </p>
        </div>
      </div>

      {/* Main 2-column Dashboard Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column (2 cols): Today's Schedule & Recent Grades */}
        <div className="lg:col-span-2 space-y-6">
          {/* Dzisiejszy plan lekcji */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
            <div className="px-5 py-3.5 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Calendar className="w-4 h-4 text-[#1a365d]" />
                <h3 className="font-bold text-sm text-slate-900">Dzisiejsze lekcje (Poniedziałek)</h3>
              </div>
              <button
                onClick={() => setActiveTab('timetable')}
                className="text-xs text-blue-700 hover:underline font-medium flex items-center space-x-1"
              >
                <span>Pełny tygodniowy plan</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="divide-y divide-slate-100">
              {todayLessons.map(lesson => (
                <div
                  key={lesson.id}
                  className="px-5 py-3 flex items-center justify-between hover:bg-slate-50/80 transition-colors"
                >
                  <div className="flex items-center space-x-4">
                    <span className="w-7 h-7 rounded-full bg-slate-100 text-slate-700 text-xs font-bold flex items-center justify-center border border-slate-200">
                      {lesson.lessonHour}
                    </span>
                    <div>
                      <div className="text-xs font-semibold text-slate-900">
                        {lesson.subjectName}
                      </div>
                      <div className="text-[11px] text-slate-500 flex items-center space-x-2">
                        <span>{lesson.teacherName}</span>
                        <span>·</span>
                        <span className="font-medium text-slate-700">{lesson.classroom}</span>
                      </div>
                    </div>
                  </div>

                  <div className="text-right">
                    <span className="text-xs font-semibold text-slate-700">
                      {lesson.timeStart} - {lesson.timeEnd}
                    </span>
                    {lesson.isSubstitution && (
                      <div className="text-[10px] text-amber-700 bg-amber-50 px-1.5 py-0.5 rounded font-medium mt-0.5 border border-amber-200">
                        Zastępstwo
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Ostatnio dodane oceny */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
            <div className="px-5 py-3.5 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <GraduationCap className="w-4 h-4 text-[#1a365d]" />
                <h3 className="font-bold text-sm text-slate-900">Ostatnio wpisane oceny</h3>
              </div>
              <button
                onClick={() => setActiveTab('grades')}
                className="text-xs text-blue-700 hover:underline font-medium flex items-center space-x-1"
              >
                <span>Wszystkie przedmioty</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="p-4 grid grid-cols-1 sm:grid-cols-2 gap-3">
              {recentGrades.map(g => {
                const sub = subjects.find(s => s.id === g.subjectId);
                return (
                  <div
                    key={g.id}
                    onClick={() => setSelectedGrade(g)}
                    className="p-3 rounded-lg border border-slate-200 hover:border-blue-400 hover:bg-blue-50/20 transition-all cursor-pointer flex items-start space-x-3 group"
                  >
                    <div className="w-10 h-10 rounded-lg bg-[#1a365d] text-white flex items-center justify-center text-lg font-black shrink-0 group-hover:scale-105 transition-transform shadow-xs">
                      {g.value}
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-1">
                        <span className="text-xs font-bold text-slate-900 truncate">
                          {sub?.name || 'Przedmiot'}
                        </span>
                        <span className="text-[10px] text-slate-600 shrink-0">{g.date}</span>
                      </div>

                      <div className="text-[11px] text-slate-600 truncate mt-0.5">
                        {g.description || 'Ocena bieżąca'}
                      </div>

                      <div className="flex items-center gap-1.5 mt-1.5">
                        <span
                          className={`text-[10px] font-semibold px-1.5 py-0.2 rounded border ${
                            categoryColorMap[g.category] || 'bg-slate-100 text-slate-700 border-slate-200'
                          }`}
                        >
                          {g.category}
                        </span>
                        <span className="text-[10px] text-slate-600 font-medium">
                          Waga: {g.weight}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right Column (1 col): Upcoming Tests / Tasks & School Announcements */}
        <div className="space-y-6">
          {/* Terminarz - Nadchodzące sprawdziany i prace */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
            <div className="px-5 py-3.5 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <FileText className="w-4 h-4 text-[#1a365d]" />
                <h3 className="font-bold text-sm text-slate-900">Terminarz & Sprawdziany</h3>
              </div>
              <button
                onClick={() => setActiveTab('schedule')}
                className="text-xs text-blue-700 hover:underline font-medium"
              >
                Więcej
              </button>
            </div>

            <div className="p-4 space-y-3">
              {upcomingTasks.map(task => (
                <div
                  key={task.id}
                  className="p-3 rounded-lg border border-slate-200 bg-slate-50/50 hover:bg-slate-50 transition-colors"
                >
                  <div className="flex items-center justify-between text-xs mb-1">
                    <span className="font-bold text-[#1a365d]">{task.subjectName}</span>
                    <span className="font-semibold text-slate-600 bg-white px-1.5 py-0.5 rounded border border-slate-200 text-[10px]">
                      {task.dueDate}
                    </span>
                  </div>
                  <div className="text-xs font-semibold text-slate-800">{task.title}</div>
                  <div className="text-[11px] text-slate-500 mt-1 line-clamp-2">
                    {task.description}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Ogłoszenia szkolne */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
            <div className="px-5 py-3.5 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Bell className="w-4 h-4 text-amber-500" />
                <h3 className="font-bold text-sm text-slate-900">Ogłoszenia dyrekcji</h3>
              </div>
              <button
                onClick={() => setActiveTab('announcements')}
                className="text-xs text-blue-700 hover:underline font-medium"
              >
                Tablica
              </button>
            </div>

            <div className="p-4 space-y-3">
              {latestAnnouncements.map(ann => (
                <div
                  key={ann.id}
                  className="p-3 rounded-lg border border-slate-200 bg-white hover:border-slate-300 transition-colors"
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[10px] font-bold uppercase text-blue-700">
                      {ann.authorRole}
                    </span>
                    <span className="text-[10px] text-slate-400">{ann.date}</span>
                  </div>
                  <h4 className="text-xs font-bold text-slate-900 leading-snug">{ann.title}</h4>
                  <p className="text-[11px] text-slate-600 mt-1 line-clamp-2 leading-relaxed">
                    {ann.content}
                  </p>
                </div>
              ))}
            </div>
          </div>
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
    </div>
  );
};
