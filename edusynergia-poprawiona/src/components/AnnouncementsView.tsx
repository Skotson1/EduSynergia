import React, { useState } from 'react';
import { useJournal } from '../context/JournalContext';
import { Announcement } from '../types';
import {
  Bell,
  Pin,
  Plus,
  Trash2,
  AlertCircle,
  Calendar,
  User,
  X,
  Check,
} from 'lucide-react';

export const AnnouncementsView: React.FC = () => {
  const { announcements, currentUser, addAnnouncement, deleteAnnouncement } = useJournal();
  const [addModalOpen, setAddModalOpen] = useState(false);

  // Form states
  const [newTitle, setNewTitle] = useState('');
  const [newContent, setNewContent] = useState('');
  const [newPriority, setNewPriority] = useState<Announcement['priority']>('normal');
  const [newAudience, setNewAudience] = useState('Cała społeczność szkolna');
  const [newPinned, setNewPinned] = useState(false);

  const isTeacherOrAdmin = currentUser?.role === 'admin' || currentUser?.role === 'teacher';

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || !newContent.trim()) return;

    addAnnouncement({
      title: newTitle.trim(),
      content: newContent.trim(),
      authorName: currentUser?.name || 'Dyrekcja Szkoły',
      authorRole: currentUser?.roleTitle || 'Dyrektor',
      priority: newPriority,
      targetAudience: newAudience,
      pinned: newPinned,
    });

    setAddModalOpen(false);
    setNewTitle('');
    setNewContent('');
  };

  return (
    <div className="space-y-5">
      {/* Top bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex items-center justify-between">
        <div>
          <h2 className="text-base font-bold text-slate-900">
            Tablica ogłoszeń i komunikatów szkolnych
          </h2>
          <p className="text-xs text-slate-500">
            Oficjalne komunikaty Dyrekcji, Rady Pedagogicznej oraz Samorządu Uczniowskiego XIV LO
          </p>
        </div>

        {isTeacherOrAdmin && (
          <button
            onClick={() => setAddModalOpen(true)}
            className="px-3.5 py-2 bg-[#1a365d] hover:bg-[#152c4d] text-white text-xs font-bold rounded-lg flex items-center space-x-1.5 shadow-sm transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>Opublikuj ogłoszenie</span>
          </button>
        )}
      </div>

      {/* Announcements List */}
      <div className="space-y-4">
        {announcements.map(ann => {
          const isUrgent = ann.priority === 'urgent';
          const isImportant = ann.priority === 'important';

          return (
            <div
              key={ann.id}
              className={`p-5 rounded-xl border shadow-xs transition-all ${
                ann.pinned
                  ? 'bg-amber-50/40 border-amber-300'
                  : 'bg-white border-slate-200'
              }`}
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-center space-x-2">
                  {ann.pinned && (
                    <span className="flex items-center space-x-1 text-[10px] font-bold uppercase bg-amber-200/80 text-amber-900 px-2 py-0.5 rounded">
                      <Pin className="w-3 h-3" />
                      <span>Przypięte</span>
                    </span>
                  )}
                  {isUrgent && (
                    <span className="text-[10px] font-bold uppercase bg-red-100 text-red-700 px-2 py-0.5 rounded border border-red-200">
                      Pilny komunikat
                    </span>
                  )}
                  <span className="text-xs text-slate-500">
                    Dla: <strong className="text-slate-700">{ann.targetAudience}</strong>
                  </span>
                </div>

                <div className="flex items-center space-x-2 text-xs text-slate-400">
                  <div className="flex items-center space-x-1">
                    <Calendar className="w-3.5 h-3.5" />
                    <span>{ann.date}</span>
                  </div>
                  {isTeacherOrAdmin && (
                    <button
                      onClick={() => deleteAnnouncement(ann.id)}
                      className="text-slate-400 hover:text-red-600 p-1 rounded hover:bg-slate-100 transition-colors"
                      title="Usuń ogłoszenie"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>

              <h3 className="text-base font-bold text-slate-900 mt-2">{ann.title}</h3>

              <div className="text-xs text-slate-700 mt-2.5 leading-relaxed whitespace-pre-line bg-white/70 p-4 rounded-lg border border-slate-100">
                {ann.content}
              </div>

              <div className="mt-3 text-[11px] text-slate-500 flex items-center space-x-2">
                <User className="w-3.5 h-3.5 text-slate-400" />
                <span>
                  Wystawił(a): <strong className="text-slate-800">{ann.authorName}</strong> ({ann.authorRole})
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Add Announcement Modal */}
      {addModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-lg w-full overflow-hidden border border-slate-200">
            <div className="bg-[#1a365d] text-white px-5 py-4 flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Bell className="w-5 h-5 text-amber-300" />
                <h3 className="text-base font-bold">Publikacja ogłoszenia szkolnego</h3>
              </div>
              <button
                onClick={() => setAddModalOpen(false)}
                className="text-slate-300 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddSubmit} className="p-5 space-y-3.5 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Tytuł ogłoszenia</label>
                <input
                  type="text"
                  required
                  value={newTitle}
                  onChange={e => setNewTitle(e.target.value)}
                  placeholder="np. Zmiana organizacji zajęć w piątek"
                  className="w-full p-2 border border-slate-300 rounded"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Priorytet</label>
                  <select
                    value={newPriority}
                    onChange={e => setNewPriority(e.target.value as Announcement['priority'])}
                    className="w-full p-2 border border-slate-300 rounded bg-white"
                  >
                    <option value="normal">Standardowe</option>
                    <option value="important">Ważne</option>
                    <option value="urgent">Pilny komunikat dyrekcji</option>
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Dla kogo</label>
                  <input
                    type="text"
                    value={newAudience}
                    onChange={e => setNewAudience(e.target.value)}
                    className="w-full p-2 border border-slate-300 rounded"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Treść ogłoszenia</label>
                <textarea
                  required
                  rows={5}
                  value={newContent}
                  onChange={e => setNewContent(e.target.value)}
                  placeholder="Wpisz pełną treść komunikatu szkolnego..."
                  className="w-full p-2.5 border border-slate-300 rounded"
                />
              </div>

              <div className="pt-1">
                <label className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={newPinned}
                    onChange={e => setNewPinned(e.target.checked)}
                    className="rounded text-blue-600"
                  />
                  <span className="font-semibold text-slate-700">
                    Przypnij na samej górze tablicy (wyróżnione)
                  </span>
                </label>
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
                  <Check className="w-3.5 h-3.5" />
                  <span>Opublikuj</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
