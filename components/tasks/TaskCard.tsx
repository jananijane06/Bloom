'use client';

import React from 'react';
import { Task } from '@/types/task';
import { formatFriendlyDate, formatTime } from '@/lib/dates';
import { CalendarDays, Clock3, GripVertical, Tag, Trash2 } from 'lucide-react';
import { cn } from '@/lib/utils';

export type KanbanStatus = 'todo' | 'in_progress' | 'completed';

export interface TaskCardProps {
  task: Task;
  status: KanbanStatus;
  spaceName?: string;
  onChangeStatus: (taskId: string, status: KanbanStatus) => void;
  onDelete?: (taskId: string) => void;
  onDragStart: (taskId: string) => void;
  onDragEnd: () => void;
  isDragging?: boolean;
  isSaving?: boolean;
}

export const TaskCard: React.FC<TaskCardProps> = ({
  task,
  status,
  spaceName,
  onChangeStatus,
  onDelete,
  onDragStart,
  onDragEnd,
  isDragging = false,
  isSaving = false,
}) => {
  const priorityStyle =
    task.priority === 'urgent'
      ? 'border-[#5A1835]/25 bg-[#5A1835]/10 text-[#5A1835]'
      : task.priority === 'high'
      ? 'border-[#8E3159]/25 bg-[#8E3159]/10 text-[#8E3159]'
      : task.priority === 'medium'
      ? 'border-[#B85C7A]/25 bg-[#B85C7A]/10 text-[#8E3159]'
      : 'border-white/80 bg-white/70 text-[#684653]';
  const tags = task.tags?.slice(0, 3) ?? [];

  return (
    <article
      draggable={!isSaving}
      onDragStart={(event) => {
        event.dataTransfer.effectAllowed = 'move';
        event.dataTransfer.setData('text/plain', task.id);
        onDragStart(task.id);
      }}
      onDragEnd={onDragEnd}
      className={cn(
        'group rounded-[20px] border border-white/85 bg-white/65 p-4 shadow-[0_8px_24px_rgba(90,24,53,0.06)] backdrop-blur-xl transition hover:bg-white/80 hover:shadow-[0_12px_28px_rgba(90,24,53,0.10)]',
        isDragging && 'opacity-45',
        isSaving && 'pointer-events-none opacity-60'
      )}
    >
      <div className="flex items-start gap-2">
        <span className="mt-0.5 cursor-grab text-[#967783]/70 active:cursor-grabbing" aria-hidden="true">
          <GripVertical className="h-4 w-4" />
        </span>
        <div className="min-w-0 flex-1">
          <h3 className="text-[15px] font-medium leading-snug text-[#351A26]">
            {task.title}
          </h3>
          {task.description && (
            <p className="mt-1.5 line-clamp-2 text-[12px] leading-relaxed text-[#684653]">
              {task.description}
            </p>
          )}
        </div>
        {onDelete && (
          <button
            type="button"
            onClick={() => onDelete(task.id)}
            aria-label={`Delete ${task.title}`}
            className="rounded-full p-1 text-[#967783] opacity-100 transition hover:bg-[#F8E3E8] hover:text-[#701F43] sm:opacity-0 sm:group-hover:opacity-100 sm:focus:opacity-100"
          >
            <Trash2 className="h-3.5 w-3.5" />
          </button>
        )}
      </div>

      <div className="mt-3 flex flex-wrap items-center gap-1.5">
        <span
          className={cn(
            'rounded-full border px-2 py-0.5 text-[10px] font-semibold capitalize',
            priorityStyle
          )}
        >
          {task.priority}
        </span>
        <span className="rounded-full border border-[#E9A6B8]/35 bg-[#F8E3E8]/60 px-2 py-0.5 text-[10px] text-[#684653]">
          {spaceName || 'No Space / Personal'}
        </span>
      </div>

      {(task.due_date || task.due_time || task.estimated_minutes) && (
        <div className="metadata mt-3 flex flex-wrap items-center gap-x-3 gap-y-1 text-[10px] text-[#684653]">
          {task.due_date && (
            <span className="inline-flex items-center gap-1">
              <CalendarDays className="h-3 w-3" />
              {formatFriendlyDate(task.due_date)}
              {task.due_time && ` · ${formatTime(task.due_time)}`}
            </span>
          )}
          {!task.due_date && task.due_time && (
            <span className="inline-flex items-center gap-1">
              <Clock3 className="h-3 w-3" />
              {formatTime(task.due_time)}
            </span>
          )}
          {task.estimated_minutes && (
            <span className="inline-flex items-center gap-1">
              <Clock3 className="h-3 w-3" />
              {task.estimated_minutes} min
            </span>
          )}
        </div>
      )}

      {tags.length > 0 && (
        <div className="mt-2.5 flex flex-wrap items-center gap-1.5">
          <Tag className="h-3 w-3 text-[#967783]" aria-hidden="true" />
          {tags.map((tag) => (
            <span key={tag} className="text-[10px] text-[#967783]">{tag}</span>
          ))}
          {(task.tags?.length ?? 0) > tags.length && (
            <span className="text-[10px] text-[#967783]">+{(task.tags?.length ?? 0) - tags.length}</span>
          )}
        </div>
      )}

    </article>
  );
};

export default TaskCard;
