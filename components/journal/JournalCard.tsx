import React from 'react';
import { JournalEntry } from '@/types/journal';
import { GlassCard } from '@/components/ui/GlassCard';
import { Badge } from '@/components/ui/Badge';
import { formatFriendlyDate } from '@/lib/dates';
import { Bookmark, Calendar } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface JournalCardProps {
  entry: JournalEntry;
  onSelect?: (entry: JournalEntry) => void;
  onToggleBookmark?: (id: string) => void;
}

export const JournalCard: React.FC<JournalCardProps> = ({
  entry,
  onSelect,
  onToggleBookmark,
}) => {
  const moodLabels: Record<string, string> = {
    serene: 'Serene',
    radiant: 'Radiant',
    focused: 'Focused',
    reflective: 'Reflective',
    drained: 'Drained',
    anxious: 'Anxious',
  };

  return (
    <GlassCard
      hoverEffect
      onClick={() => onSelect && onSelect(entry)}
      className="p-5 sm:p-6 cursor-pointer relative group flex flex-col justify-between"
    >
      <div>
        <div className="flex items-start justify-between gap-3 mb-2">
          <Badge variant="primary" size="sm">
            {moodLabels[entry.mood] || 'Serene'}
          </Badge>

          <div className="flex items-center gap-1.5">
              <span className="typewriter text-[11px] text-outline flex items-center gap-1">
              <Calendar className="w-3 h-3 text-outline" />
              {formatFriendlyDate(entry.date)}
            </span>
            {onToggleBookmark && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onToggleBookmark(entry.id);
                }}
                aria-label={entry.isBookmarked ? 'Remove bookmark' : 'Bookmark entry'}
                className={cn(
                  'p-1 rounded-md transition-colors',
                  entry.isBookmarked
                    ? 'text-primary'
                    : 'text-outline/40 hover:text-primary'
                )}
              >
                <Bookmark className={cn('w-4 h-4', entry.isBookmarked && 'fill-current')} />
              </button>
            )}
          </div>
        </div>

        <h3 className="text-[15px] font-bold text-on-surface group-hover:text-primary transition-colors">
          {entry.title}
        </h3>

        {entry.promptUsed && (
          <div className="editorial text-sm text-primary my-2">
            <span className="truncate italic">"{entry.promptUsed}"</span>
          </div>
        )}

        <p className="text-[12px] text-on-surface-variant line-clamp-3 mt-2 leading-relaxed">
          {entry.content}
        </p>
      </div>

      <div className="flex flex-wrap items-center gap-1.5 mt-4 pt-3 border-t border-white/60">
        {entry.tags.map((tag) => (
          <span
            key={tag}
            className="text-[10px] font-semibold text-outline bg-white/70 border border-white/80 px-2.5 py-0.5 rounded-full"
          >
            #{tag}
          </span>
        ))}
      </div>
    </GlassCard>
  );
};

export default JournalCard;
