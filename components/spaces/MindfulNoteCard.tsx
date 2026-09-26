'use client';

import React, { useState } from 'react';
import { MindfulNote, MindfulMood } from '@/types/spaceItems';

export interface MindfulNoteCardProps {
  note: MindfulNote;
  onTogglePin: (note: MindfulNote) => void;
  onUpdate: (note: MindfulNote) => void;
  onDelete: (noteId: string) => void;
}

const MOOD_MAP: Record<string, { label: string; icon: string; bg: string; text: string }> = {
  calm: { label: 'Calm', icon: '🌿', bg: 'bg-rose-50 border-rose-200/60', text: 'text-rose-700' },
  grateful: { label: 'Grateful', icon: '🌸', bg: 'bg-rose-50 border-rose-200/60', text: 'text-rose-700' },
  inspired: { label: 'Inspired', icon: '✨', bg: 'bg-rose-50 border-rose-200/60', text: 'text-rose-800' },
  reflective: { label: 'Reflective', icon: '💭', bg: 'bg-rose-50 border-rose-200/60', text: 'text-rose-700' },
  focused: { label: 'Focused', icon: '🎯', bg: 'bg-rose-50 border-rose-200/60', text: 'text-rose-700' },
  peaceful: { label: 'Peaceful', icon: '🕊️', bg: 'bg-rose-50 border-rose-200/60', text: 'text-rose-700' },
};

export function MindfulNoteCard({
  note,
  onTogglePin,
  onUpdate,
  onDelete,
}: MindfulNoteCardProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState(note.title);
  const [editContent, setEditContent] = useState(note.content);
  const [editMood, setEditMood] = useState<MindfulMood>((note.mood as MindfulMood) || 'calm');

  const moodInfo = (note.mood && MOOD_MAP[note.mood]) || MOOD_MAP.calm;

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editTitle.trim() || !editContent.trim()) return;
    onUpdate({
      ...note,
      title: editTitle.trim(),
      content: editContent.trim(),
      mood: editMood,
    });
    setIsEditing(false);
  };

  return (
    <div
      className={`glass-card relative overflow-hidden rounded-[26px] p-5 sm:p-6 border transition-all duration-200 flex flex-col justify-between ${
        note.pinned
          ? 'border-rose-300/80 bg-white/80 shadow-md ring-2 ring-rose-400/20'
          : 'border-white/80 bg-white/60 hover:bg-white/75 shadow-xs hover:shadow-sm'
      }`}
    >
      {/* Decorative gentle glow for pinned notes */}
      {note.pinned && (
        <div className="pointer-events-none absolute -right-8 -top-8 h-24 w-24 rounded-full bg-rose-400/10 blur-xl" />
      )}

      {isEditing ? (
        <form onSubmit={handleSave} className="space-y-3">
          <input
            type="text"
            required
            value={editTitle}
            onChange={(e) => setEditTitle(e.target.value)}
            className="w-full rounded-xl border border-white/90 bg-white px-3.5 py-1.5 text-[14px] font-bold text-on-surface focus:outline-none focus:ring-2 focus:ring-rose-400/30"
          />
          <textarea
            rows={4}
            required
            value={editContent}
            onChange={(e) => setEditContent(e.target.value)}
            className="w-full rounded-xl border border-white/90 bg-white px-3.5 py-2 text-[13px] text-on-surface focus:outline-none focus:ring-2 focus:ring-rose-400/30 resize-none"
          />
          <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
            <select
              value={editMood}
              onChange={(e) => setEditMood(e.target.value as MindfulMood)}
              className="rounded-lg border border-white/80 bg-white px-2 py-1 text-[11px] font-semibold"
            >
              <option value="calm">Calm</option>
              <option value="grateful">Grateful</option>
              <option value="inspired">Inspired</option>
              <option value="reflective">Reflective</option>
              <option value="focused">Focused</option>
              <option value="peaceful">Peaceful</option>
            </select>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setIsEditing(false)}
                className="rounded-full px-3 py-1 text-[11px] font-semibold text-outline hover:bg-black/5"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="rounded-full bg-rose-600 px-3.5 py-1 text-[11px] font-semibold text-white shadow-xs hover:bg-rose-700"
              >
                Save
              </button>
            </div>
          </div>
        </form>
      ) : (
        <>
          <div className="space-y-2.5">
            {/* CARD TOP ROW */}
            <div className="flex items-start justify-between gap-2">
              <div className="flex flex-wrap items-center gap-2">
                <span
                  className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-[10px] font-bold ${moodInfo.bg} ${moodInfo.text}`}
                >
                  
                  <span>{moodInfo.label}</span>
                </span>

                {note.pinned && (
                  <span className="inline-flex items-center gap-1 rounded-full bg-rose-100 text-rose-700 px-2 py-0.5 text-[10px] font-bold">
                    <span>📌 Pinned</span>
                  </span>
                )}
              </div>

              {/* CARD ACTIONS */}
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => onTogglePin(note)}
                  title={note.pinned ? 'Unpin note' : 'Pin note to top'}
                  className={`flex h-7 w-7 items-center justify-center rounded-full transition ${
                    note.pinned
                      ? 'text-rose-600 bg-rose-50'
                      : 'text-outline hover:bg-black/5 hover:text-on-surface'
                  }`}
                >
                  <span className="material-symbols-outlined text-[16px]">push_pin</span>
                </button>
                <button
                  type="button"
                  onClick={() => setIsEditing(true)}
                  aria-label="Edit note"
                  className="flex h-7 w-7 items-center justify-center rounded-full text-outline hover:bg-black/5 hover:text-on-surface transition"
                >
                  <span className="material-symbols-outlined text-[16px]">edit</span>
                </button>
                <button
                  type="button"
                  onClick={() => onDelete(note.id)}
                  aria-label="Delete note"
                  className="flex h-7 w-7 items-center justify-center rounded-full text-outline hover:bg-rose-50 hover:text-rose-600 transition"
                >
                  <span className="material-symbols-outlined text-[16px]">delete</span>
                </button>
              </div>
            </div>

            {/* TITLE & CONTENT */}
            <div>
              <h4 className="text-[15px] font-bold text-on-surface leading-tight">
                {note.title}
              </h4>
              <p className="mt-2 text-[13px] text-on-surface-variant leading-relaxed whitespace-pre-line font-normal">
                {note.content}
              </p>
            </div>
          </div>

          {/* FOOTER */}
          <div className="mt-4 pt-3 border-t border-black/5 flex items-center justify-between text-[11px] text-outline">
            <span>
              {note.created_at
                ? new Date(note.created_at).toLocaleDateString(undefined, {
                    month: 'short',
                    day: 'numeric',
                  })
                : 'Just now'}
            </span>
            <span className="text-[10px] text-rose-400 font-medium">A quiet note</span>
          </div>
        </>
      )}
    </div>
  );
}

export default MindfulNoteCard;
