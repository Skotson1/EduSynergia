import React, { useState } from 'react';
import { useJournal } from '../context/JournalContext';
import { GradeCategory } from '../types';
import { PlusCircle, X, Check, BookOpen, AlertCircle } from 'lucide-react';

interface AddGradeModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultStudentId?: string;
  defaultSubjectId?: string;
}

export const AddGradeModal: React.FC<AddGradeModalProps> = ({
  isOpen,
  onClose,
  defaultStudentId,
  defaultSubjectId,
}) => {
  const { students, subjects, currentUser, addGrade } = useJournal();

  const [studentId, setStudentId] = useState(defaultStudentId || students[0]?.id || 'st_1');
  const [subjectId, setSubjectId] = useState(defaultSubjectId || subjects[0]?.id || 'sub_mat');
  const [gradeValue, setGradeValue] = useState('5');
  const [weight, setWeight] = useState(3);
  const [category, setCategory] = useState<GradeCategory>('sprawdzian');
  const [semester, setSemester] = useState<1 | 2>(2);
  const [description, setDescription] = useState('');
  const [countToAverage, setCountToAverage] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');

  if (!isOpen) return null;

  const quickGrades = ['1', '1+', '2-', '2', '2+', '3-', '3', '3+', '4-', '4', '4+', '5-', '5', '5+', '6', 'np', '+'];

  const handleNumericCalc = (val: string): number => {
    if (val === 'np' || val === '+') return 0;
    let n = parseFloat(val);
    if (val.includes('+')) n = parseFloat(val) + 0.5;
    if (val.includes('-')) n = parseFloat(val) - 0.25;
    return isNaN(n) ? 0 : n;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!studentId || !subjectId || !gradeValue) {
      setErrorMsg('Wypełnij wymagane pola');
      return;
    }

    const todayStr = new Date().toISOString().split('T')[0];
    const numericValue = handleNumericCalc(gradeValue);

    addGrade({
      studentId,
      subjectId,
      value: gradeValue,
      numericValue,
      weight: Number(weight),
      category,
      semester,
      date: todayStr,
      teacherName: currentUser?.name || 'Nauczyciel przedmiotu',
      description: description.trim() || 'Ocena bieżąca z przedmiotu',
      countToAverage: gradeValue !== 'np' && gradeValue !== '+' && countToAverage,
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-lg w-full overflow-hidden border border-slate-200">
        <div className="bg-[#1a365d] text-white px-5 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <PlusCircle className="w-5 h-5 text-amber-300" />
            <h3 className="text-base font-bold">Wstawianie nowej oceny</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded hover:bg-white/10 text-slate-300 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {errorMsg && (
            <div className="flex items-center space-x-2 p-2.5 bg-red-50 border border-red-200 text-red-700 text-xs rounded">
              <AlertCircle className="w-4 h-4" />
              <span>{errorMsg}</span>
            </div>
          )}

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Uczeń
              </label>
              <select
                value={studentId}
                onChange={e => setStudentId(e.target.value)}
                className="w-full text-xs p-2 border border-slate-300 rounded focus:ring-1 focus:ring-blue-500 bg-white"
              >
                {students.map(s => (
                  <option key={s.id} value={s.id}>
                    {s.numberInJournal}. {s.lastName} {s.firstName} ({s.className})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Przedmiot
              </label>
              <select
                value={subjectId}
                onChange={e => setSubjectId(e.target.value)}
                className="w-full text-xs p-2 border border-slate-300 rounded focus:ring-1 focus:ring-blue-500 bg-white"
              >
                {subjects.map(sub => (
                  <option key={sub.id} value={sub.id}>
                    {sub.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Wartość oceny
            </label>
            <div className="flex flex-wrap gap-1 mb-2">
              {quickGrades.map(g => (
                <button
                  type="button"
                  key={g}
                  onClick={() => setGradeValue(g)}
                  className={`w-8 h-8 rounded text-xs font-bold transition-colors ${
                    gradeValue === g
                      ? 'bg-[#1a365d] text-white shadow'
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                  }`}
                >
                  {g}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Kategoria
              </label>
              <select
                value={category}
                onChange={e => setCategory(e.target.value as GradeCategory)}
                className="w-full text-xs p-2 border border-slate-300 rounded focus:ring-1 focus:ring-blue-500 bg-white"
              >
                <option value="sprawdzian">Sprawdzian</option>
                <option value="kartkowka">Kartkówka</option>
                <option value="odpowiedz">Odpowiedź ustna</option>
                <option value="praca_klasowa">Praca klasowa</option>
                <option value="zadanie_domowe">Zadanie domowe</option>
                <option value="aktywnosc">Aktywność</option>
                <option value="projekt">Projekt</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Waga (1 - 5)
              </label>
              <select
                value={weight}
                onChange={e => setWeight(parseInt(e.target.value))}
                className="w-full text-xs p-2 border border-slate-300 rounded focus:ring-1 focus:ring-blue-500 bg-white"
              >
                <option value={1}>1 (Zadanie, aktywność)</option>
                <option value={2}>2 (Kartkówka, odp.)</option>
                <option value={3}>3 (Sprawdzian, projekt)</option>
                <option value={4}>4 (Praca klasowa)</option>
                <option value={5}>5 (Egzamin semestralny)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Semestr
              </label>
              <select
                value={semester}
                onChange={e => setSemester(parseInt(e.target.value) as 1 | 2)}
                className="w-full text-xs p-2 border border-slate-300 rounded focus:ring-1 focus:ring-blue-500 bg-white"
              >
                <option value={1}>Semestr I</option>
                <option value={2}>Semestr II (bieżący)</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Komentarz / Temat sprawdzianu
            </label>
            <input
              type="text"
              value={description}
              onChange={e => setDescription(e.target.value)}
              placeholder="np. Funkcje kwadratowe i wykresy"
              className="w-full text-xs p-2 border border-slate-300 rounded focus:ring-1 focus:ring-blue-500"
            />
          </div>

          <div className="flex items-center space-x-2 pt-1 text-xs text-slate-700">
            <input
              type="checkbox"
              id="countAvg"
              checked={countToAverage}
              onChange={e => setCountToAverage(e.target.checked)}
              className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
            />
            <label htmlFor="countAvg" className="cursor-pointer">
              Licz tę ocenę do średniej ważonej
            </label>
          </div>

          <div className="pt-3 border-t border-slate-100 flex justify-end space-x-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded"
            >
              Anuluj
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-xs font-semibold bg-[#1a365d] hover:bg-[#152c4d] text-white rounded flex items-center space-x-1.5 shadow-sm"
            >
              <Check className="w-3.5 h-3.5" />
              <span>Wstaw ocenę</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
