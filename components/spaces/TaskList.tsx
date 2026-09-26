'use client';

import React, { useState } from 'react';
import { SpaceTask } from '@/types/spaceItems';
import { TaskItem } from './TaskItem';
import { SpaceEmptyState } from './SpaceEmptyState';

export interface TaskListProps {
  tasks: SpaceTask[];
  onToggleComplete: (task: SpaceTask) => void;
  onUpdate: (task: SpaceTask) => void;
  onDelete: (taskId: string) => void;
  onAddTask: () => void;
}

export function TaskList({
  tasks,
  onToggleComplete,
  onUpdate,
  onDelete,
  onAddTask,
}: TaskListProps) {
  const [filter, setFilter] = useState<'all' | 'active' | 'completed'>('all');

  const filteredTasks = tasks.filter((t) => {
    if (filter === 'active') return !t.completed;
    if (filter === 'completed') return t.completed;
    return true;
  });

  const activeCount = tasks.filter((t) => !t.completed).length;
  const completedCount = tasks.filter((t) => t.completed).length;

  if (tasks.length === 0) {
    return (
      <SpaceEmptyState
        icon="check_circle"
        title="Nothing waiting for you"
        description="Add your first task to start making mindful progress in this space."
        actionLabel="Add Task"
        onAction={onAddTask}
      />
    );
  }

  return (
    <div className="space-y-4">
      {/* FILTER BAR & ADD BUTTON */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-1.5 p-1 rounded-2xl bg-white/50 border border-white/80 shadow-xs">
          {(
            [
              { id: 'all', label: `All (${tasks.length})` },
              { id: 'active', label: `Pending (${activeCount})` },
              { id: 'completed', label: `Completed (${completedCount})` },
            ] as const
          ).map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => setFilter(item.id)}
              className={`rounded-xl px-3 py-1 text-[11px] font-bold transition-all ${
                filter === item.id
                  ? 'bg-white text-primary shadow-xs'
                  : 'text-outline hover:text-on-surface'
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>

        <button
          type="button"
          onClick={onAddTask}
          className="berry-button inline-flex items-center gap-1 rounded-full px-4 py-1.5 text-[11px] font-bold text-white shadow-xs transition hover:shadow-sm"
        >
          <span className="material-symbols-outlined text-[16px]">add</span>
          <span>New Task</span>
        </button>
      </div>

      {/* TASKS LIST */}
      <div className="grid grid-cols-1 gap-2.5">
        {filteredTasks.length === 0 ? (
          <div className="text-center py-8 text-outline text-[13px]">
            No tasks match this filter.
          </div>
        ) : (
          filteredTasks.map((task) => (
            <TaskItem
              key={task.id}
              task={task}
              onToggleComplete={onToggleComplete}
              onUpdate={onUpdate}
              onDelete={onDelete}
            />
          ))
        )}
      </div>
    </div>
  );
}

export default TaskList;
