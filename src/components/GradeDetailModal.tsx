import React, { useState } from 'react';
import { Grade, Subject, UserRole } from '../types';
import { useJournal } from '../context/JournalContext';
import {
  X,
  Calendar,
  User,
  Tag,
  Scale,
  BookOpen,
  Info,
  Trash2,
  Edit2,
  Check,
} from 'lucide-react';

interface GradeDetailModalProps {
  grade: Grade | null;
  subject?: Subject;
  studentName?: string;
  onClose: () => void;
}

export const GradeDetailModal: React.FC<GradeDetailModalProps> = ({
  grade,
  subject,
  studentName,
  onClose,
}) => {
  const { currentUser, deleteGrade, updateGrade } = useJournal();
  const [isEditing, setIsEditing] = useState(false);
  const [editedValue, setEditedValue] = useState(grade?.value || '');
  const [editedWeight, setEditedWeight] = useState(grade?.weight || 1);
  const [editedDesc, setEditedDesc] = useState(grade?.description || '');

  if (!grade) return null;

  const canEdit = currentUser?.role === 'admin' || currentUser?.role === 'teacher';

  const categoryNameMap: Record<string, string> = {
    sprawdzian: 'Sprawdzian wiedzy',
    kartkowka: 'Kartkówka',
    odpowiedz: 'Odpowiedź ustna',
    praca_klasowa: 'Praca klasowa / Wypracowanie',
    zadanie_domowe: 'Zadanie domowe',
    aktywnosc: 'Aktywność na lekcji',
    projekt: 'Projekt semestralny',
  };

  const categoryColorMap: Record<string, string> = {
    sprawdzian: 'bg-red-50 text-red-700 border-red-200',
    kartkowka: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    odpowiedz: 'bg-blue-50 text-blue-700 border-blue-200',
    praca_klasowa: 'bg-purple-50 text-purple-700 border-purple-200',
    zadanie_domowe: 'bg-amber-50 text-amber-700 border-amber-200',
    aktywnosc: 'bg-teal-50 text-teal-700 border-teal-200',
    projekt: 'bg-indigo-50 text-indigo-700 border-indigo-200',
  };

  const handleSaveEdit = () => {
    let numeric = parseFloat(editedValue);
    if (editedValue.includes('+')) numeric = parseFloat(editedValue) + 0.5;
    else if (editedValue.includes('-')) numeric = parseFloat(editedValue) - 0.25;

    if (isNaN(numeric)) numeric = 0;

    updateGrade(grade.id, {
      value: editedValue,
      numericValue: numeric,
      weight: editedWeight,
      description: editedDesc,
    });
    setIsEditing(false);
  };

  const handleDelete = () => {
    if (window.confirm('Czy na pewno chcesz usunąć tę ocenę z dziennika?')) {
      deleteGrade(grade.id);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-md w-full overflow-hidden border border-slate-200 animate-in fade-in zoom-in-95 duration-100">
        {/* Header */}
        <div className="bg-[#1a365d] text-white px-5 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <BookOpen className="w-5 h-5 text-amber-300" />
            <h3 className="text-base font-bold">Szczegóły oceny</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded hover:bg-white/10 text-slate-300 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-5 space-y-4">
          {/* Main Grade Banner */}
          <div className="flex items-center justify-between p-4 bg-slate-50 rounded-lg border border-slate-200">
            <div>
              <div className="text-xs text-slate-500 font-medium">Wartość oceny</div>
              {!isEditing ? (
                <div className="text-4xl font-extrabold text-[#1a365d] tracking-tight">
                  {grade.value}
                </div>
              ) : (
                <div className="flex items-center space-x-2 mt-1">
                  <input
                    type="text"
                    value={editedValue}
                    onChange={e => setEditedValue(e.target.value)}
                    className="w-16 px-2 py-1 text-2xl font-bold border border-blue-400 rounded bg-white text-[#1a365d]"
                  />
                  <span className="text-xs text-slate-400">(np. 5, 4+, 3-)</span>
                </div>
              )}
            </div>

            <div className="text-right">
              <span
                className={`inline-block text-xs font-semibold px-2.5 py-1 rounded border ${
                  categoryColorMap[grade.category] || 'bg-slate-100 text-slate-700 border-slate-300'
                }`}
              >
                {categoryNameMap[grade.category] || grade.category}
              </span>
              <div className="text-xs text-slate-500 mt-1">
                Semestr {grade.semester === 1 ? 'I' : 'II'}
              </div>
            </div>
          </div>

          {/* Details list */}
          <div className="space-y-2.5 text-xs">
            {subject && (
              <div className="flex items-center justify-between py-1.5 border-b border-slate-100">
                <span className="text-slate-500 flex items-center space-x-1.5">
                  <BookOpen className="w-3.5 h-3.5 text-slate-400" />
                  <span>Przedmiot:</span>
                </span>
                <span className="font-semibold text-slate-900">{subject.name}</span>
              </div>
            )}

            {studentName && (
              <div className="flex items-center justify-between py-1.5 border-b border-slate-100">
                <span className="text-slate-500 flex items-center space-x-1.5">
                  <User className="w-3.5 h-3.5 text-slate-400" />
                  <span>Uczeń:</span>
                </span>
                <span className="font-semibold text-slate-900">{studentName}</span>
              </div>
            )}

            <div className="flex items-center justify-between py-1.5 border-b border-slate-100">
              <span className="text-slate-500 flex items-center space-x-1.5">
                <Scale className="w-3.5 h-3.5 text-slate-400" />
                <span>Waga oceny:</span>
              </span>
              {!isEditing ? (
                <span className="font-bold text-slate-900 bg-slate-100 px-2 py-0.5 rounded">
                  {grade.weight}
                </span>
              ) : (
                <input
                  type="number"
                  min="1"
                  max="5"
                  value={editedWeight}
                  onChange={e => setEditedWeight(parseInt(e.target.value) || 1)}
                  className="w-16 px-2 py-0.5 border border-slate-300 rounded text-right"
                />
              )}
            </div>

            <div className="flex items-center justify-between py-1.5 border-b border-slate-100">
              <span className="text-slate-500 flex items-center space-x-1.5">
                <Calendar className="w-3.5 h-3.5 text-slate-400" />
                <span>Data wystawienia:</span>
              </span>
              <span className="font-medium text-slate-800">{grade.date}</span>
            </div>

            <div className="flex items-center justify-between py-1.5 border-b border-slate-100">
              <span className="text-slate-500 flex items-center space-x-1.5">
                <User className="w-3.5 h-3.5 text-slate-400" />
                <span>Nauczyciel wpisujący:</span>
              </span>
              <span className="font-medium text-slate-800">{grade.teacherName}</span>
            </div>

            <div className="flex items-center justify-between py-1.5 border-b border-slate-100">
              <span className="text-slate-500 flex items-center space-x-1.5">
                <Info className="w-3.5 h-3.5 text-slate-400" />
                <span>Liczona do średniej:</span>
              </span>
              <span className="font-medium text-emerald-700">
                {grade.countToAverage ? 'Tak (waga ' + grade.weight + ')' : 'Nie'}
              </span>
            </div>

            {/* Description / topic */}
            <div className="pt-1">
              <div className="text-slate-500 font-medium mb-1">Komentarz / Zakres wiedzy:</div>
              {!isEditing ? (
                <div className="p-2.5 bg-slate-50 rounded border border-slate-200 text-slate-800 italic leading-relaxed">
                  {grade.description || 'Brak dodatkowego komentarza'}
                </div>
              ) : (
                <textarea
                  value={editedDesc}
                  onChange={e => setEditedDesc(e.target.value)}
                  rows={2}
                  className="w-full p-2 text-xs border border-slate-300 rounded focus:ring-1 focus:ring-blue-500 text-slate-800"
                />
              )}
            </div>
          </div>

          {/* Action buttons */}
          <div className="pt-2 flex items-center justify-between border-t border-slate-100">
            {canEdit && (
              <div className="flex items-center space-x-2">
                {!isEditing ? (
                  <>
                    <button
                      onClick={() => setIsEditing(true)}
                      className="flex items-center space-x-1 px-3 py-1.5 rounded bg-blue-50 hover:bg-blue-100 text-blue-700 text-xs font-medium transition-colors"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                      <span>Edytuj</span>
                    </button>
                    <button
                      onClick={handleDelete}
                      className="flex items-center space-x-1 px-3 py-1.5 rounded bg-red-50 hover:bg-red-100 text-red-700 text-xs font-medium transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Usuń</span>
                    </button>
                  </>
                ) : (
                  <>
                    <button
                      onClick={handleSaveEdit}
                      className="flex items-center space-x-1 px-3 py-1.5 rounded bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-medium transition-colors"
                    >
                      <Check className="w-3.5 h-3.5" />
                      <span>Zapisz</span>
                    </button>
                    <button
                      onClick={() => setIsEditing(false)}
                      className="px-3 py-1.5 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-medium transition-colors"
                    >
                      Anuluj
                    </button>
                  </>
                )}
              </div>
            )}
            <button
              onClick={onClose}
              className="ml-auto px-4 py-1.5 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-medium transition-colors"
            >
              Zamknij
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
