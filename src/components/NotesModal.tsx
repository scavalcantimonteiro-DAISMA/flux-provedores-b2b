import React, { useState } from 'react';
import { X, StickyNote, Send, Clock, User as UserIcon } from 'lucide-react';
import { api } from '../services/api';
import { Lead } from '../types';

interface NotesModalProps {
  lead: Lead;
  onClose: () => void;
  onSuccess: () => void;
}

export const NotesModal: React.FC<NotesModalProps> = ({ lead, onClose, onSuccess }) => {
  const [noteText, setNoteText] = useState('');
  const [saving, setSaving] = useState(false);

  const handleAddNote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!noteText.trim()) return;

    setSaving(true);
    try {
      await api.addNote(lead.id, noteText);
      setNoteText('');
      onSuccess();
    } catch (err: any) {
      alert(err.message || 'Erro ao salvar anotação');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
      <div className="bg-[#121216] rounded-3xl border border-[#282832] shadow-2xl max-w-lg w-full overflow-hidden flex flex-col max-h-[85vh]">
        {/* Header */}
        <div className="p-5 bg-gradient-to-r from-[#181822] to-[#121216] text-white flex items-center justify-between border-b border-[#282832]">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-[#ff7a00]/15 text-[#ff7a00]">
              <StickyNote className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-base leading-tight">Histórico & Anotações</h3>
              <p className="text-xs text-slate-400">{lead.tradeName} • {lead.city}/{lead.state}</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-lg hover:bg-white/10 text-slate-400 hover:text-white transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Notes Timeline */}
        <div className="p-5 overflow-y-auto flex-1 space-y-3">
          {(!lead.notes || lead.notes.length === 0) ? (
            <div className="text-center py-8 text-slate-500">
              <StickyNote className="w-8 h-8 mx-auto mb-2 opacity-30 text-[#ff7a00]" />
              <p className="text-xs">Nenhuma anotação registrada ainda.</p>
              <p className="text-[11px] text-slate-600 mt-0.5">Use o campo abaixo para salvar detalhes da conversa com o provedor.</p>
            </div>
          ) : (
            lead.notes.map((note) => (
              <div key={note.id} className="p-3.5 rounded-2xl bg-[#181822] border border-[#282832] text-xs space-y-1.5">
                <div className="flex items-center justify-between text-slate-400 text-[11px]">
                  <span className="font-bold text-white flex items-center gap-1">
                    <UserIcon className="w-3 h-3 text-[#ff7a00]" />
                    {note.userName}
                  </span>
                  <span className="flex items-center gap-1 font-mono">
                    <Clock className="w-3 h-3 text-slate-500" />
                    {new Date(note.createdAt).toLocaleString('pt-BR')}
                  </span>
                </div>
                <p className="text-slate-200 leading-relaxed whitespace-pre-wrap">{note.text}</p>
              </div>
            ))
          )}
        </div>

        {/* Input Form */}
        <form onSubmit={handleAddNote} className="p-4 bg-[#0e0e12] border-t border-[#282832] flex items-center gap-2">
          <input
            type="text"
            value={noteText}
            onChange={(e) => setNoteText(e.target.value)}
            placeholder="Digite uma nova anotação comercial..."
            className="flex-1 px-4 py-2.5 rounded-xl border border-[#282832] bg-[#18181f] text-xs text-white placeholder-slate-500 focus:outline-none focus:border-[#ff7a00]"
          />
          <button
            type="submit"
            disabled={saving || !noteText.trim()}
            className="p-2.5 rounded-xl bg-[#ff7a00] hover:bg-[#e06b00] text-slate-950 font-bold transition flex items-center justify-center cursor-pointer disabled:opacity-40"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
};
