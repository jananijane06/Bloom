import React from 'react';
import { CalendarEvent } from '@/types/event';
import { Task } from '@/types/task';
import { GlassCard } from '@/components/ui/GlassCard';
import { Badge } from '@/components/ui/Badge';
import { formatDate, formatTime } from '@/lib/dates';
import { CheckCircle, Clock, MapPin, Pencil, Trash2 } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface EventCardProps {
  event?: CalendarEvent;
  task?: Task;
  spaceName?: string;
  onDelete?: (id: string) => void;
  onEdit?: () => void;
  className?: string;
}

export const EventCard: React.FC<EventCardProps> = ({
  event,
  task,
  spaceName,
  onDelete,
  onEdit,
  className,
}) => {
  if (!event && !task) return null;

  const title = task?.title ?? event!.title;
  const description = task?.description ?? event?.description;

  return (
    <GlassCard
      className={cn(
        'group p-4 border-l-4 transition-all duration-200 hover:shadow-md border-l-primary',
        className
      )}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="flex h-7 w-7 items-center justify-center rounded-full border border-white/80 bg-white/70 text-primary shrink-0 shadow-sm">
              <span className="material-symbols-outlined text-[16px]">
                {task ? <CheckCircle className="w-4 h-4" /> : event!.type === 'meeting' ? 'forum' : event!.type === 'class' ? 'school' : 'auto_awesome'}
              </span>
            </span>
            <h4 className="text-[14px] font-bold text-on-surface truncate">
              {title}
            </h4>
          </div>

          {description && (
            <p className="text-[12px] text-on-surface-variant mt-1.5 line-clamp-2 pl-9">
              {description}
            </p>
          )}

          {(event?.courseCode || event?.lecturer) && (
            <p className="mt-1.5 pl-9 text-[11px] text-outline">
              {[event.courseCode, event.lecturer].filter(Boolean).join(' · ')}
            </p>
          )}

          <div className="flex flex-wrap items-center gap-2 mt-3 pl-9 text-xs">
            {task?.due_date && (
              <span className="text-[11px] font-semibold text-outline bg-white/60 border border-white/80 px-2.5 py-0.5 rounded-full">
                Due {formatDate(task.due_date)}
              </span>
            )}

            {task?.due_time && (
              <span className="inline-flex items-center gap-1 font-semibold text-outline bg-white/60 border border-white/80 px-2.5 py-0.5 rounded-full text-[11px]">
                <Clock className="w-3 h-3 text-outline" />
                {formatTime(task.due_time)}
              </span>
            )}

            {event && (
              <span className="inline-flex items-center gap-1 font-semibold text-outline bg-white/60 border border-white/80 px-2.5 py-0.5 rounded-full text-[11px]">
                <Clock className="w-3 h-3 text-outline" />
                {formatTime(event.startTime)} - {formatTime(event.endTime)}
              </span>
            )}

            {event?.location && (
              <span className="inline-flex items-center gap-1 text-outline text-[11px]">
                <MapPin className="w-3 h-3" />
                {event.location}
              </span>
            )}

            <Badge variant="primary" size="sm">
              {task ? 'Task' : event!.type}
            </Badge>

            {spaceName && (
              <span className="text-[11px] text-outline font-medium">
                · {spaceName}
              </span>
            )}
          </div>
        </div>
        {(onEdit || onDelete) && event && !event.sourceTimetableClassId && (
          <div className="flex shrink-0 items-center gap-1">
            {onEdit && <button type="button" onClick={onEdit} aria-label={`Edit ${event.title}`} className="rounded-full p-2 text-outline transition hover:bg-white/70 hover:text-primary"><Pencil className="h-3.5 w-3.5" /></button>}
            {onDelete && <button type="button" onClick={() => onDelete(event.id)} aria-label={`Delete ${event.title}`} className="rounded-full p-2 text-outline transition hover:bg-[#F8E3E8] hover:text-primary"><Trash2 className="h-3.5 w-3.5" /></button>}
          </div>
        )}
      </div>
    </GlassCard>
  );
};

export default EventCard;
