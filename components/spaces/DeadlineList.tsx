'use client';

import React from 'react';
import { Deadline } from '@/types/spaceItems';
import { DeadlineCard } from './DeadlineCard';
import { SpaceEmptyState } from './SpaceEmptyState';

export interface DeadlineListProps {
  deadlines: Deadline[];
  onUpdate: (deadline: Deadline) => void;
  onDelete: (deadlineId: string) => void;
  onAddDeadline: () => void;
}

export function DeadlineList({
  deadlines,
  onUpdate,
  onDelete,
  onAddDeadline,
}: DeadlineListProps) {
  if (deadlines.length === 0) {
    return (
      <SpaceEmptyState
        icon="schedule"
        title="Your calendar is breathing easy"
        description="No upcoming deadlines here. Set milestone targets when you're ready."
        actionLabel="Add Deadline"
        onAction={onAddDeadline}
      />
    );
  }

  // Ensure sorted chronologically
  const sorted = [...deadlines].sort(
    (a, b) => new Date(a.due_date).getTime() - new Date(b.due_date).getTime()
  );

  return (
    <div className="space-y-4">
      {/* HEADER & NEW DEADLINE BUTTON */}
      <div className="flex items-center justify-between">
        <p className="text-[12px] text-outline font-semibold">
          {deadlines.length} {deadlines.length === 1 ? 'Deadline' : 'Deadlines'} tracked
        </p>

        <button
          type="button"
          onClick={onAddDeadline}
          className="rounded-full bg-[#B85C7A] px-4 py-1.5 text-[11px] font-bold text-white shadow-xs transition hover:bg-[#8E3159]"
        >
          <span className="material-symbols-outlined text-[16px] align-middle mr-1">add</span>
          <span>New Deadline</span>
        </button>
      </div>

      <div className="grid grid-cols-1 gap-3">
        {sorted.map((deadline) => (
          <DeadlineCard
            key={deadline.id}
            deadline={deadline}
            onUpdate={onUpdate}
            onDelete={onDelete}
          />
        ))}
      </div>
    </div>
  );
}

export default DeadlineList;
