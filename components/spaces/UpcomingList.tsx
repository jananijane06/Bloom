'use client';

import React from 'react';
import { SpaceTask, Deadline } from '@/types/spaceItems';
import { TaskItem } from './TaskItem';
import { DeadlineCard } from './DeadlineCard';
import { SpaceEmptyState } from './SpaceEmptyState';

export interface UpcomingListProps {
  tasks: SpaceTask[];
  deadlines: Deadline[];
  onToggleTaskComplete: (task: SpaceTask) => void;
  onUpdateTask: (task: SpaceTask) => void;
  onDeleteTask: (taskId: string) => void;
  onUpdateDeadline: (deadline: Deadline) => void;
  onDeleteDeadline: (deadlineId: string) => void;
  onAddItem: () => void;
}

type CombinedItem =
  | { type: 'task'; item: SpaceTask; sortTime: number }
  | { type: 'deadline'; item: Deadline; sortTime: number };

export function UpcomingList({
  tasks,
  deadlines,
  onToggleTaskComplete,
  onUpdateTask,
  onDeleteTask,
  onUpdateDeadline,
  onDeleteDeadline,
  onAddItem,
}: UpcomingListProps) {
  // Only include active (incomplete) tasks
  const pendingTasks = tasks.filter((t) => !t.completed);

  const combined: CombinedItem[] = [];

  pendingTasks.forEach((t) => {
    // If due_date exists, use it, else default to future (2 weeks out) so dated items appear first
    const sortTime = t.due_date ? new Date(t.due_date).getTime() : Date.now() + 14 * 24 * 60 * 60 * 1000;
    combined.push({
      type: 'task',
      item: t,
      sortTime,
    });
  });

  deadlines.forEach((d) => {
    combined.push({
      type: 'deadline',
      item: d,
      sortTime: new Date(d.due_date).getTime(),
    });
  });

  // Sort chronologically
  combined.sort((a, b) => a.sortTime - b.sortTime);

  if (combined.length === 0) {
    return (
      <SpaceEmptyState
        icon="auto_awesome"
        title="Your horizon is calm and clear"
        description="No upcoming deadlines or pending tasks. You are all caught up in this space."
        actionLabel="Plan an Item"
        onAction={onAddItem}
      />
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-[12px] text-outline font-semibold">
          {combined.length} upcoming {combined.length === 1 ? 'priority' : 'priorities'} sorted chronologically
        </p>

        <button
          type="button"
          onClick={onAddItem}
          className="berry-button inline-flex items-center gap-1 rounded-full px-4 py-1.5 text-[11px] font-bold text-white shadow-xs transition hover:shadow-sm"
        >
          <span className="material-symbols-outlined text-[16px]">add</span>
          <span>Add Item</span>
        </button>
      </div>

      <div className="space-y-3">
        {combined.map(({ type, item }) => {
          if (type === 'task') {
            return (
              <TaskItem
                key={`task-${item.id}`}
                task={item}
                onToggleComplete={onToggleTaskComplete}
                onUpdate={onUpdateTask}
                onDelete={onDeleteTask}
              />
            );
          } else {
            return (
              <DeadlineCard
                key={`deadline-${item.id}`}
                deadline={item}
                onUpdate={onUpdateDeadline}
                onDelete={onDeleteDeadline}
              />
            );
          }
        })}
      </div>
    </div>
  );
}

export default UpcomingList;
