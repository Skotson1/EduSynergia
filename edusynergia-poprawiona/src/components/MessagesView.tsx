import React, { useState } from 'react';
import { useJournal } from '../context/JournalContext';
import { Message } from '../types';
import {
  Mail,
  Inbox,
  Send,
  Star,
  Trash2,
  Edit3,
  Search,
  CheckCircle,
  X,
  User,
  Clock,
  CornerUpLeft,
} from 'lucide-react';

export const MessagesView: React.FC = () => {
  const {
    messages,
    currentUser,
    users,
    sendMessage,
    markMessageAsRead,
    toggleMessageStar,
    deleteMessage,
  } = useJournal();

  const [activeFolder, setActiveFolder] = useState<'inbox' | 'sent' | 'starred'>('inbox');
  const [selectedMessageId, setSelectedMessageId] = useState<string | null>(messages[0]?.id || null);
  const [searchQuery, setSearchQuery] = useState('');
  const [composeModalOpen, setComposeModalOpen] = useState(false);

  // Compose form states
  const [composeRecipientId, setComposeRecipientId] = useState('user_teacher');
  const [composeSubject, setComposeSubject] = useState('');
  const [composeContent, setComposeContent] = useState('');

  const currentUserId = currentUser?.id || 'user_student';

  // Filter messages based on active folder
  const folderMessages = messages.filter(m => {
    if (activeFolder === 'inbox') {
      return (
        m.recipientId === currentUserId ||
        m.recipientId === 'user_student' ||
        m.recipientId === 'all'
      );
    }
    if (activeFolder === 'sent') {
      return m.senderId === currentUserId;
    }
    if (activeFolder === 'starred') {
      return m.isStarred;
    }
    return true;
  });

  const filteredMessages = folderMessages.filter(
    m =>
      m.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.senderName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.content.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const selectedMessage = messages.find(m => m.id === selectedMessageId) || filteredMessages[0] || null;

  const handleSelectMessage = (msg: Message) => {
    setSelectedMessageId(msg.id);
    if (!msg.isRead) {
      markMessageAsRead(msg.id);
    }
  };

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!composeSubject.trim() || !composeContent.trim()) return;

    const recipientUser = users.find(u => u.id === composeRecipientId);
    const recipientName = recipientUser ? recipientUser.name : 'Nauczyciel';

    sendMessage({
      recipientId: composeRecipientId,
      recipientName,
      subject: composeSubject.trim(),
      content: composeContent.trim(),
    });

    setComposeModalOpen(false);
    setComposeSubject('');
    setComposeContent('');
    setActiveFolder('sent');
  };

  const handleReply = (msg: Message) => {
    setComposeRecipientId(msg.senderId);
    setComposeSubject(msg.subject.startsWith('Re: ') ? msg.subject : `Re: ${msg.subject}`);
    setComposeContent(`\n\n--- W odpowiedzi na wiadomość z dnia ${msg.date} od ${msg.senderName} ---\n${msg.content}`);
    setComposeModalOpen(true);
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden flex flex-col md:flex-row min-h-[600px]">
      {/* Sidebar: Navigation & Folders */}
      <div className="w-full md:w-60 bg-slate-50 border-r border-slate-200 p-4 flex flex-col shrink-0">
        <button
          onClick={() => {
            setComposeSubject('');
            setComposeContent('');
            setComposeModalOpen(true);
          }}
          className="w-full py-2.5 px-4 bg-[#1a365d] hover:bg-[#152c4d] text-white rounded-lg text-xs font-bold transition-colors flex items-center justify-center space-x-2 shadow-xs mb-4"
        >
          <Edit3 className="w-4 h-4" />
          <span>Nowa wiadomość</span>
        </button>

        <nav className="space-y-1 text-xs font-semibold flex-1">
          <button
            onClick={() => setActiveFolder('inbox')}
            className={`w-full flex items-center justify-between px-3 py-2 rounded-lg transition-colors text-left ${
              activeFolder === 'inbox'
                ? 'bg-[#1a365d] text-white'
                : 'text-slate-700 hover:bg-slate-200/60'
            }`}
          >
            <div className="flex items-center space-x-2.5">
              <Inbox className="w-4 h-4" />
              <span>Odebrane</span>
            </div>
            <span
              className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                activeFolder === 'inbox' ? 'bg-white/20 text-white' : 'bg-slate-200 text-slate-700'
              }`}
            >
              {messages.filter(m => (m.recipientId === currentUserId || m.recipientId === 'user_student' || m.recipientId === 'all') && !m.isRead).length}
            </span>
          </button>

          <button
            onClick={() => setActiveFolder('sent')}
            className={`w-full flex items-center justify-between px-3 py-2 rounded-lg transition-colors text-left ${
              activeFolder === 'sent'
                ? 'bg-[#1a365d] text-white'
                : 'text-slate-700 hover:bg-slate-200/60'
            }`}
          >
            <div className="flex items-center space-x-2.5">
              <Send className="w-4 h-4" />
              <span>Wysłane</span>
            </div>
          </button>

          <button
            onClick={() => setActiveFolder('starred')}
            className={`w-full flex items-center justify-between px-3 py-2 rounded-lg transition-colors text-left ${
              activeFolder === 'starred'
                ? 'bg-[#1a365d] text-white'
                : 'text-slate-700 hover:bg-slate-200/60'
            }`}
          >
            <div className="flex items-center space-x-2.5">
              <Star className="w-4 h-4" />
              <span>Oznaczone gwiazdką</span>
            </div>
          </button>
        </nav>

        <div className="pt-4 border-t border-slate-200 text-[11px] text-slate-400">
          Wiadomości są szyfrowane i archiwizowane w szkolnym systemie pocztowym.
        </div>
      </div>

      {/* Middle column: Message List */}
      <div className="w-full md:w-80 lg:w-96 border-r border-slate-200 flex flex-col shrink-0 bg-white">
        <div className="p-3 border-b border-slate-200">
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Szukaj w korespondencji..."
              className="w-full pl-8 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto divide-y divide-slate-100 max-h-[550px]">
          {filteredMessages.length === 0 ? (
            <div className="p-6 text-center text-xs text-slate-400">
              Brak wiadomości w tym folderze.
            </div>
          ) : (
            filteredMessages.map(msg => {
              const isSelected = selectedMessage?.id === msg.id;
              return (
                <div
                  key={msg.id}
                  onClick={() => handleSelectMessage(msg)}
                  className={`p-3.5 cursor-pointer transition-colors relative ${
                    isSelected ? 'bg-blue-50/70 border-l-3 border-[#1a365d]' : 'hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-center justify-between text-[11px] mb-1">
                    <span className="font-bold text-slate-900 truncate pr-2">
                      {activeFolder === 'sent' ? `Do: ${msg.recipientName}` : msg.senderName}
                    </span>
                    <span className="text-slate-400 shrink-0">{msg.date.split(' ')[0]}</span>
                  </div>

                  <div className={`text-xs truncate ${!msg.isRead ? 'font-bold text-slate-900' : 'text-slate-700'}`}>
                    {msg.subject}
                  </div>

                  <div className="text-[11px] text-slate-500 truncate mt-0.5">
                    {msg.content}
                  </div>

                  <div className="flex items-center justify-between mt-2 pt-1 border-t border-slate-100/60">
                    <span className="text-[10px] text-slate-400 font-medium">
                      {msg.senderRole}
                    </span>
                    <button
                      onClick={e => {
                        e.stopPropagation();
                        toggleMessageStar(msg.id);
                      }}
                      className="text-slate-300 hover:text-amber-500 transition-colors p-0.5"
                    >
                      <Star
                        className={`w-3.5 h-3.5 ${
                          msg.isStarred ? 'fill-amber-400 text-amber-500' : ''
                        }`}
                      />
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Right column: Message Reader Pane */}
      <div className="flex-1 flex flex-col bg-slate-50/30">
        {selectedMessage ? (
          <div className="p-6 flex flex-col h-full">
            {/* Header */}
            <div className="border-b border-slate-200 pb-4 mb-4">
              <div className="flex items-start justify-between gap-4">
                <h2 className="text-lg font-bold text-slate-900 leading-snug">
                  {selectedMessage.subject}
                </h2>
                <div className="flex items-center space-x-1 shrink-0">
                  <button
                    onClick={() => handleReply(selectedMessage)}
                    className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-100 text-slate-700 text-xs flex items-center space-x-1 font-semibold"
                    title="Odpowiedz"
                  >
                    <CornerUpLeft className="w-3.5 h-3.5" />
                    <span>Odpowiedz</span>
                  </button>
                  <button
                    onClick={() => toggleMessageStar(selectedMessage.id)}
                    className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-100 text-slate-500"
                  >
                    <Star
                      className={`w-4 h-4 ${
                        selectedMessage.isStarred ? 'fill-amber-400 text-amber-500' : ''
                      }`}
                    />
                  </button>
                  <button
                    onClick={() => deleteMessage(selectedMessage.id)}
                    className="p-1.5 rounded-lg border border-slate-200 hover:bg-red-50 hover:text-red-600 text-slate-400"
                    title="Usuń"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Sender & timestamp metadata */}
              <div className="mt-3 flex items-center space-x-3 text-xs text-slate-600">
                <div className="w-8 h-8 rounded-full bg-[#1a365d] text-white flex items-center justify-center font-bold text-xs">
                  {selectedMessage.senderName.charAt(0)}
                </div>
                <div>
                  <div className="font-bold text-slate-900">
                    {selectedMessage.senderName}
                    <span className="font-normal text-slate-500 ml-1">
                      ({selectedMessage.senderRole})
                    </span>
                  </div>
                  <div className="text-[11px] text-slate-400">
                    Do: {selectedMessage.recipientName} · {selectedMessage.date}
                  </div>
                </div>
              </div>
            </div>

            {/* Message Body */}
            <div className="flex-1 overflow-y-auto pr-2">
              <div className="text-sm text-slate-800 leading-relaxed whitespace-pre-line bg-white p-5 rounded-lg border border-slate-200 shadow-2xs">
                {selectedMessage.content}
              </div>
            </div>
          </div>
        ) : (
          <div className="flex-1 flex items-center justify-center p-8 text-center text-slate-400 text-xs">
            Wybierz wiadomość z listy po lewej stronie, aby odczytać jej treść.
          </div>
        )}
      </div>

      {/* Compose Message Modal */}
      {composeModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-lg w-full overflow-hidden border border-slate-200">
            <div className="bg-[#1a365d] text-white px-5 py-4 flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Edit3 className="w-5 h-5 text-amber-300" />
                <h3 className="text-base font-bold">Nowa wiadomość</h3>
              </div>
              <button
                onClick={() => setComposeModalOpen(false)}
                className="text-slate-300 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSend} className="p-5 space-y-3.5 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Odbiorca</label>
                <select
                  value={composeRecipientId}
                  onChange={e => setComposeRecipientId(e.target.value)}
                  className="w-full p-2 border border-slate-300 rounded bg-white"
                >
                  {users.map(u => (
                    <option key={u.id} value={u.id}>
                      {u.name} — {u.roleTitle} ({u.role})
                    </option>
                  ))}
                  <option value="all">Wszyscy Uczniowie i Rodzice (Komunikat)</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Temat wiadomości</label>
                <input
                  type="text"
                  required
                  value={composeSubject}
                  onChange={e => setComposeSubject(e.target.value)}
                  placeholder="np. Pytanie o termin zaliczenia sprawdzianu"
                  className="w-full p-2 border border-slate-300 rounded focus:ring-1 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Treść</label>
                <textarea
                  required
                  rows={6}
                  value={composeContent}
                  onChange={e => setComposeContent(e.target.value)}
                  placeholder="Wpisz treść korespondencji..."
                  className="w-full p-2.5 border border-slate-300 rounded focus:ring-1 focus:ring-blue-500 leading-relaxed"
                />
              </div>

              <div className="flex justify-end space-x-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setComposeModalOpen(false)}
                  className="px-3 py-1.5 text-slate-600 hover:bg-slate-100 rounded"
                >
                  Anuluj
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 font-bold bg-[#1a365d] hover:bg-[#152c4d] text-white rounded flex items-center space-x-1.5 shadow-sm"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Wyślij wiadomość</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
