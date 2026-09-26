'use client';

import React, { useState } from 'react';
import { SpaceTask, TaskPriority } from '@/types/spaceItems';

export interface TaskItemProps {
  task: SpaceTask;
  onToggleComplete: (task: SpaceTask) => void;
  onUpdate: (task: SpaceTask) => void;
  onDelete: (taskId: string) => void;
}

export function TaskItem({
  task,
  onToggleComplete,
  onUpdate,
  onDelete,
}: TaskItemProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState(task.title);
  const [editDesc, setEditDesc] = useState(task.description || '');
  const [editPriority, setEditPriority] = useState<TaskPriority>(
    (task.priority as TaskPriority) || 'medium'
  );
  const [editDueDate, setEditDueDate] = useState(task.due_date || '');
  const [editDueTime, setEditDueTime] = useState(task.due_time?.slice(0, 5) || '');

  const priorityStyles: Record<string, { label: string; bg: string; text: string; icon: string }> = {
    low: { label: 'Low', bg: 'bg-rose-50 border-rose-200/60', text: 'text-rose-700', icon: '🌱' },
    medium: { label: 'Medium', bg: 'bg-rose-50 border-rose-200/60', text: 'text-rose-700', icon: '🌸' },
    high: { label: 'High', bg: 'bg-rose-50 border-rose-200/60', text: 'text-rose-800', icon: '⚡' },
    urgent: { label: 'Urgent', bg: 'bg-rose-50 border-rose-200/60', text: 'text-rose-700', icon: '🔥' },
  };

  const priority = priorityStyles[task.priority] || priorityStyles.medium;

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editTitle.trim()) return;
    onUpdate({
      ...task,
      title: editTitle.trim(),
      description: editDesc.trim() || null,
      priority: editPriority,
      due_date: editDueDate || null,
      due_time: editDueTime || null,
    });
    setIsEditing(false);
  };

  return (
    <div
      className={`glass-card rounded-[24px] p-4 sm:p-5 border transition-all duration-200 ${
        task.completed
          ? 'border-white/60 bg-white/40 opacity-75'
          : 'border-white/80 bg-white/65 hover:bg-white/80 shadow-xs hover:shadow-sm'
      }`}
    >
      {isEditing ? (
        <form onSubmit={handleSave} className="space-y-3">
          <input
            type="text"
            required
            value={editTitle}
            onChange={(e) => setEditTitle(e.target.value)}
            className="w-full rounded-xl border border-white/90 bg-white/90 px-3.5 py-1.5 text-[13px] text-on-surface focus:outline-none focus:ring-2 focus:ring-primary/20"
          />
          <textarea
            rows={2}
            value={editDesc}
            placeholder="Sub-notes or details..."
            onChange={(e) => setEditDesc(e.target.value)}
            className="w-full rounded-xl border border-white/90 bg-white/90 px-3.5 py-1.5 text-[12px] text-on-surface focus:outline-none focus:ring-2 focus:ring-primary/20 resize-none"
          />
          <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
            <div className="flex items-center gap-2">
              <select
                value={editPriority}
                onChange={(e) => setEditPriority(e.target.value as TaskPriority)}
                className="rounded-lg border border-white/80 bg-white px-2 py-1 text-[11px] font-semibold"
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
                <option value="urgent">🔥 Urgent</option>
              </select>
              <input
                type="date"
                value={editDueDate}
                onChange={(e) => setEditDueDate(e.target.value)}
                className="rounded-lg border border-white/80 bg-white px-2 py-1 text-[11px]"
              />
              <input
                type="time"
                value={editDueTime}
                onChange={(e) => setEditDueTime(e.target.value)}
                className="rounded-lg border border-white/80 bg-white px-2 py-1 text-[11px]"
              />
            </div>
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
                className="berry-button rounded-full px-3.5 py-1 text-[11px] font-semibold text-white shadow-xs"
              >
                Save
              </button>
            </div>
          </div>
        </form>
      ) : (
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-start gap-3 flex-1 min-w-0">
            {/* Custom Bloom Checkbox */}
            <button
              type="button"
              onClick={() => onToggleComplete(task)}
              aria-label={task.completed ? 'Mark task incomplete' : 'Mark task complete'}
              className={`mt-0.5 flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-lg border transition-all ${
                task.completed
                  ? 'border-[#701F43] bg-gradient-to-br from-[#701F43] to-[#8E3159] text-white shadow-xs'
                  : 'border-outline/40 bg-white/80 hover:border-primary hover:bg-primary/5'
              }`}
            >
              {task.completed && (
                <span className="material-symbols-outlined text-[15px] font-bold">check</span>
              )}
            </button>

            <div className="flex-1 min-w-0">
              <p
                className={`text-[13px] sm:text-[14px] font-semibold leading-snug transition-all ${
                  task.completed
                    ? 'line-through text-outline'
                    : 'text-on-surface'
                }`}
              >
                {task.title}
              </p>

              {task.description && (
                <p className="mt-1 text-[12px] text-on-surface-variant line-clamp-2">
                  {task.description}
                </p>
              )}

              {/* Tags & Due date pill */}
              <div className="mt-2.5 flex flex-wrap items-center gap-2">
                <span
                  className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-[10px] font-bold ${priority.bg} ${priority.text}`}
                >
                  <span>{priority.label}</span>
                </span>

                {task.due_date && (
                  <span className="inline-flex items-center gap-1 rounded-full bg-white/70 border border-white/80 px-2.5 py-0.5 text-[10px] font-semibold text-outline">
                    <span className="material-symbols-outlined text-[12px]">event</span>
                    <span>
                      {new Date(task.due_date).toLocaleDateString(undefined, {
                        month: 'short',
                        day: 'numeric',
                      })}
                    </span>
                  </span>
                )}
                {task.due_time && (
                  <span className="inline-flex items-center gap-1 rounded-full bg-white/70 border border-white/80 px-2.5 py-0.5 text-[10px] font-semibold text-outline">
                    <span className="material-symbols-outlined text-[12px]">schedule</span>
                    <span>{task.due_time.slice(0, 5)}</span>
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Quick Action menu */}
          <div className="flex items-center gap-1 flex-shrink-0">
            <button
              type="button"
              onClick={() => setIsEditing(true)}
              aria-label="Edit task"
              className="flex h-7 w-7 items-center justify-center rounded-full text-outline hover:bg-black/5 hover:text-on-surface transition"
            >
              <span className="material-symbols-outlined text-[16px]">edit</span>
            </button>
            <button
              type="button"
              onClick={() => onDelete(task.id)}
              aria-label="Delete task"
              className="flex h-7 w-7 items-center justify-center rounded-full text-outline hover:bg-rose-50 hover:text-rose-600 transition"
            >
              <span className="material-symbols-outlined text-[16px]">delete</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default TaskItem;
