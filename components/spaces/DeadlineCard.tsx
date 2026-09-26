'use client';

import React, { useState } from 'react';
import { Deadline } from '@/types/spaceItems';

export interface DeadlineCardProps {
  deadline: Deadline;
  onUpdate: (deadline: Deadline) => void;
  onDelete: (deadlineId: string) => void;
}

export function DeadlineCard({
  deadline,
  onUpdate,
  onDelete,
}: DeadlineCardProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState(deadline.title);
  const [editDesc, setEditDesc] = useState(deadline.description || '');
  const [editDueDate, setEditDueDate] = useState(
    deadline.due_date ? deadline.due_date.slice(0, 16) : ''
  );

  const now = new Date().getTime();
  const dueTime = new Date(deadline.due_date).getTime();
  const diffDays = Math.ceil((dueTime - now) / (1000 * 60 * 60 * 24));

  let urgency: 'overdue' | 'approaching' | 'normal' = 'normal';
  let badgeText = '';

  if (dueTime < now) {
    urgency = 'overdue';
    const daysAgo = Math.abs(diffDays);
    badgeText = daysAgo === 0 ? 'Passed today' : `${daysAgo}d overdue`;
  } else if (diffDays <= 3) {
    urgency = 'approaching';
    badgeText = diffDays === 0 ? 'Due today' : diffDays === 1 ? 'Due tomorrow' : `In ${diffDays} days`;
  } else {
    urgency = 'normal';
    badgeText = `In ${diffDays} days`;
  }

  const urgencyStyles = {
    overdue: {
      card: 'border-rose-200/80 bg-rose-50/40',
      badge: 'bg-rose-100/80 text-rose-700 border-rose-200',
      icon: 'warning',
      accent: 'text-rose-600',
    },
    approaching: {
      card: 'border-[#B85C7A]/30 bg-[#B85C7A]/5',
      badge: 'bg-[#B85C7A]/10 text-[#B85C7A] border-[#B85C7A]/25',
      icon: 'hourglass_top',
      accent: 'text-[#B85C7A]',
    },
    normal: {
      card: 'border-white/80 bg-white/60',
      badge: 'bg-rose-50 text-rose-700 border-rose-200/60',
      icon: 'event_upcoming',
      accent: 'text-rose-600',
    },
  }[urgency];

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editTitle.trim() || !editDueDate) return;
    onUpdate({
      ...deadline,
      title: editTitle.trim(),
      description: editDesc.trim() || null,
      due_date: new Date(editDueDate).toISOString(),
    });
    setIsEditing(false);
  };

  const formattedDueDate = new Date(deadline.due_date).toLocaleDateString(undefined, {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });

  return (
    <div
      className={`glass-card rounded-[24px] p-4 sm:p-5 border transition-all duration-200 shadow-xs hover:shadow-sm ${urgencyStyles.card}`}
    >
      {isEditing ? (
        <form onSubmit={handleSave} className="space-y-3">
          <input
            type="text"
            required
            value={editTitle}
            onChange={(e) => setEditTitle(e.target.value)}
            className="w-full rounded-xl border border-white/90 bg-white px-3.5 py-1.5 text-[13px] font-bold text-on-surface focus:outline-none focus:ring-2 focus:ring-[#B85C7A]/20"
          />
          <input
            type="datetime-local"
            required
            value={editDueDate}
            onChange={(e) => setEditDueDate(e.target.value)}
            className="w-full rounded-xl border border-white/90 bg-white px-3.5 py-1.5 text-[12px] text-on-surface focus:outline-none focus:ring-2 focus:ring-[#B85C7A]/20"
          />
          <textarea
            rows={2}
            value={editDesc}
            placeholder="Details or submission link..."
            onChange={(e) => setEditDesc(e.target.value)}
            className="w-full rounded-xl border border-white/90 bg-white px-3.5 py-1.5 text-[12px] text-on-surface focus:outline-none focus:ring-2 focus:ring-[#B85C7A]/20 resize-none"
          />
          <div className="flex items-center justify-end gap-2 pt-1">
            <button
              type="button"
              onClick={() => setIsEditing(false)}
              className="rounded-full px-3 py-1 text-[11px] font-semibold text-outline hover:bg-black/5"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="rounded-full bg-[#B85C7A] px-3.5 py-1 text-[11px] font-semibold text-white shadow-xs hover:bg-[#8E3159]"
            >
              Save
            </button>
          </div>
        </form>
      ) : (
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-start gap-3 flex-1 min-w-0">
            <div
              className={`flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-2xl bg-white border border-white shadow-xs ${urgencyStyles.accent}`}
            >
              <span className="material-symbols-outlined text-[20px]">
                {urgencyStyles.icon}
              </span>
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <h4 className="text-[14px] sm:text-[15px] font-bold text-on-surface">
                  {deadline.title}
                </h4>
                <span
                  className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-[10px] font-bold ${urgencyStyles.badge}`}
                >
                  <span>{badgeText}</span>
                </span>
              </div>

              {deadline.description && (
                <p className="mt-1 text-[12px] text-on-surface-variant line-clamp-2">
                  {deadline.description}
                </p>
              )}

              <p className="mt-2 text-[11px] font-medium text-outline flex items-center gap-1">
                <span className="material-symbols-outlined text-[13px]">schedule</span>
                <span>{formattedDueDate}</span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1 flex-shrink-0">
            <button
              type="button"
              onClick={() => setIsEditing(true)}
              aria-label="Edit deadline"
              className="flex h-7 w-7 items-center justify-center rounded-full text-outline hover:bg-black/5 hover:text-on-surface transition"
            >
              <span className="material-symbols-outlined text-[16px]">edit</span>
            </button>
            <button
              type="button"
              onClick={() => onDelete(deadline.id)}
              aria-label="Delete deadline"
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

export default DeadlineCard;
