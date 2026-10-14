import React, { useState } from 'react';
import { useJournal } from '../context/JournalContext';
import { HomeworkTask } from '../types';
import {
  FileText,
  Calendar,
  Plus,
  Trash2,
  CheckCircle,
  Clock,
  Filter,
  X,
  BookOpen,
} from 'lucide-react';

export const TerminarzView: React.FC = () => {
  const { homework, currentUser, subjects, addHomework, deleteHomework } = useJournal();
  const [filterType, setFilterType] = useState<string>('all');
  const [addModalOpen, setAddModalOpen] = useState(false);

  // Form states
  const [taskSubject, setTaskSubject] = useState('Matematyka');
  const [taskTitle, setTaskTitle] = useState('');
  const [taskDesc, setTaskDesc] = useState('');
  const [taskDueDate, setTaskDueDate] = useState('2026-04-20');
  const [taskType, setTaskType] = useState<HomeworkTask['type']>('sprawdzian');

  const isTeacherOrAdmin = currentUser?.role === 'admin' || currentUser?.role === 'teacher';

  const typeConfig: Record<string, { label: string; badge: string }> = {
    sprawdzian: { label: 'Sprawdzian', badge: 'bg-red-100 text-red-800 border-red-300' },
    kartkowka: { label: 'Kartkówka', badge: 'bg-emerald-100 text-emerald-800 border-emerald-300' },
    zadanie_domowe: { label: 'Zadanie domowe', badge: 'bg-amber-100 text-amber-800 border-amber-300' },
    projekt: { label: 'Projekt', badge: 'bg-indigo-100 text-indigo-800 border-indigo-300' },
    inne: { label: 'Inne wydarzenie', badge: 'bg-slate-100 text-slate-800 border-slate-300' },
  };

  const filteredTasks = homework.filter(t => {
    if (filterType === 'all') return true;
    return t.type === filterType;
  });

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!taskTitle.trim() || !taskDueDate) return;

    addHomework({
      subjectName: taskSubject,
      title: taskTitle.trim(),
      description: taskDesc.trim(),
      dueDate: taskDueDate,
      className: '3A',
      teacherName: currentUser?.name || 'Nauczyciel',
      type: taskType,
    });

    setAddModalOpen(false);
    setTaskTitle('');
    setTaskDesc('');
  };

  return (
    <div className="space-y-5">
      {/* Action / Filter bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-2 text-xs font-semibold">
          <button
            onClick={() => setFilterType('all')}
            className={`px-3 py-1.5 rounded-lg border transition-all ${
              filterType === 'all'
                ? 'bg-[#1a365d] text-white border-[#1a365d]'
                : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
            }`}
          >
            Wszystkie ({homework.length})
          </button>
          <button
            onClick={() => setFilterType('sprawdzian')}
            className={`px-3 py-1.5 rounded-lg border transition-all ${
              filterType === 'sprawdzian'
                ? 'bg-red-700 text-white border-red-700'
                : 'bg-red-50 text-red-700 border-red-200 hover:bg-red-100'
            }`}
          >
            Sprawdziany
          </button>
          <button
            onClick={() => setFilterType('kartkowka')}
            className={`px-3 py-1.5 rounded-lg border transition-all ${
              filterType === 'kartkowka'
                ? 'bg-emerald-700 text-white border-emerald-700'
                : 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100'
            }`}
          >
            Kartkówki
          </button>
          <button
            onClick={() => setFilterType('zadanie_domowe')}
            className={`px-3 py-1.5 rounded-lg border transition-all ${
              filterType === 'zadanie_domowe'
                ? 'bg-amber-700 text-white border-amber-700'
                : 'bg-amber-50 text-amber-800 border-amber-200 hover:bg-amber-100'
            }`}
          >
            Zadania domowe
          </button>
          <button
            onClick={() => setFilterType('projekt')}
            className={`px-3 py-1.5 rounded-lg border transition-all ${
              filterType === 'projekt'
                ? 'bg-indigo-700 text-white border-indigo-700'
                : 'bg-indigo-50 text-indigo-700 border-indigo-200 hover:bg-indigo-100'
            }`}
          >
            Projekty
          </button>
        </div>

        {isTeacherOrAdmin && (
          <button
            onClick={() => setAddModalOpen(true)}
            className="px-3.5 py-1.5 bg-[#1a365d] hover:bg-[#152c4d] text-white text-xs font-bold rounded-lg flex items-center space-x-1.5 shadow-sm transition-colors self-start sm:self-auto"
          >
            <Plus className="w-4 h-4" />
            <span>Zaplanuj sprawdzian / zadanie</span>
          </button>
        )}
      </div>

      {/* Task List */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredTasks.length === 0 ? (
          <div className="col-span-2 p-12 text-center text-slate-400 text-xs bg-white rounded-xl border border-slate-200">
            Brak zaplanowanych wydarzeń w tej kategorii.
          </div>
        ) : (
          filteredTasks.map(task => {
            const conf = typeConfig[task.type] || typeConfig['inne'];
            return (
              <div
                key={task.id}
                className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs hover:border-slate-300 transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between gap-3 mb-2">
                    <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded border ${conf.badge}`}>
                      {conf.label}
                    </span>
                    <div className="flex items-center space-x-1.5 text-xs font-bold text-slate-700 bg-slate-50 px-2 py-0.5 rounded border border-slate-200">
                      <Calendar className="w-3.5 h-3.5 text-slate-500" />
                      <span>Termin: {task.dueDate}</span>
                    </div>
                  </div>

                  <div className="text-xs font-bold text-[#1a365d]">{task.subjectName}</div>
                  <h3 className="text-sm font-bold text-slate-900 mt-1 leading-snug">
                    {task.title}
                  </h3>
                  <p className="text-xs text-slate-600 mt-2 leading-relaxed bg-slate-50/70 p-3 rounded-lg border border-slate-100">
                    {task.description || 'Brak dodatkowego opisu zadania.'}
                  </p>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
                  <span>Wprowadził: {task.teacherName}</span>
                  {isTeacherOrAdmin && (
                    <button
                      onClick={() => deleteHomework(task.id)}
                      className="text-red-500 hover:text-red-700 p-1 rounded hover:bg-red-50 transition-colors"
                      title="Usuń zadanie"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Add Task Modal */}
      {addModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full overflow-hidden border border-slate-200">
            <div className="bg-[#1a365d] text-white px-5 py-4 flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <FileText className="w-5 h-5 text-amber-300" />
                <h3 className="text-base font-bold">Nowe wydarzenie w terminarzu</h3>
              </div>
              <button
                onClick={() => setAddModalOpen(false)}
                className="text-slate-300 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddSubmit} className="p-5 space-y-3.5 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Przedmiot</label>
                  <select
                    value={taskSubject}
                    onChange={e => setTaskSubject(e.target.value)}
                    className="w-full p-2 border border-slate-300 rounded bg-white"
                  >
                    {subjects.map(s => (
                      <option key={s.id} value={s.name}>
                        {s.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Rodzaj</label>
                  <select
                    value={taskType}
                    onChange={e => setTaskType(e.target.value as HomeworkTask['type'])}
                    className="w-full p-2 border border-slate-300 rounded bg-white"
                  >
                    <option value="sprawdzian">Sprawdzian</option>
                    <option value="kartkowka">Kartkówka</option>
                    <option value="zadanie_domowe">Zadanie domowe</option>
                    <option value="projekt">Projekt</option>
                    <option value="inne">Inne</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Tytuł / Tematyka</label>
                <input
                  type="text"
                  required
                  value={taskTitle}
                  onChange={e => setTaskTitle(e.target.value)}
                  placeholder="np. Sprawdzian z Rachunku prawdopodobieństwa"
                  className="w-full p-2 border border-slate-300 rounded"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Termin oddania / data</label>
                <input
                  type="date"
                  required
                  value={taskDueDate}
                  onChange={e => setTaskDueDate(e.target.value)}
                  className="w-full p-2 border border-slate-300 rounded"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Szczegółowy opis</label>
                <textarea
                  rows={3}
                  value={taskDesc}
                  onChange={e => setTaskDesc(e.target.value)}
                  placeholder="Wymagane zagadnienia, strony w podręczniku, wytyczne..."
                  className="w-full p-2 border border-slate-300 rounded"
                />
              </div>

              <div className="flex justify-end space-x-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setAddModalOpen(false)}
                  className="px-3 py-1.5 text-slate-600 hover:bg-slate-100 rounded"
                >
                  Anuluj
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 font-bold bg-[#1a365d] text-white rounded flex items-center space-x-1"
                >
                  <CheckCircle className="w-3.5 h-3.5" />
                  <span>Dodaj do terminarza</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
