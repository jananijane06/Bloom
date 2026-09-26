'use client';

import React from 'react';
import { MindfulNote } from '@/types/spaceItems';
import { MindfulNoteCard } from './MindfulNoteCard';
import { SpaceEmptyState } from './SpaceEmptyState';

export interface MindfulNoteListProps {
  notes: MindfulNote[];
  onTogglePin: (note: MindfulNote) => void;
  onUpdate: (note: MindfulNote) => void;
  onDelete: (noteId: string) => void;
  onAddNote: () => void;
}

export function MindfulNoteList({
  notes,
  onTogglePin,
  onUpdate,
  onDelete,
  onAddNote,
}: MindfulNoteListProps) {
  if (notes.length === 0) {
    return (
      <SpaceEmptyState
        icon="menu_book"
        title="A little space for your thoughts"
        description="Write your first mindful note, lecture reflection, or thesis spark."
        actionLabel="Write Mindful Note"
        onAction={onAddNote}
      />
    );
  }

  return (
    <div className="space-y-4">
      {/* HEADER & NEW NOTE BUTTON */}
      <div className="flex items-center justify-between">
        <p className="text-[12px] text-outline font-semibold">
          {notes.length} {notes.length === 1 ? 'Mindful Note' : 'Mindful Notes'} captured
        </p>

        <button
          type="button"
          onClick={onAddNote}
          className="rounded-full bg-rose-600 px-4 py-1.5 text-[11px] font-bold text-white shadow-xs transition hover:bg-rose-700"
        >
          <span className="material-symbols-outlined text-[16px] align-middle mr-1">add</span>
          <span>New Mindful Note</span>
        </button>
      </div>

      {/* NOTES GRID */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {notes.map((note) => (
          <MindfulNoteCard
            key={note.id}
            note={note}
            onTogglePin={onTogglePin}
            onUpdate={onUpdate}
            onDelete={onDelete}
          />
        ))}
      </div>
    </div>
  );
}

export default MindfulNoteList;
