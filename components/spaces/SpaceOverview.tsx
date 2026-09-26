import React from 'react';
import { Space } from '@/types/space';

export interface SpaceOverviewProps {
  space?: Space;
  taskCount?: number;
  noteCount?: number;
  deadlinesCount?: number;
  resourceCount?: number;
  activeTab?: string;
  onTabChange?: (tab: string) => void;
}

export function SpaceOverview({
  space,
  taskCount,
  noteCount,
  deadlinesCount,
  resourceCount,
  activeTab,
  onTabChange,
}: SpaceOverviewProps) {
  const cards = [
    {
      id: 'tasks',
      label: 'Focus Tasks',
      count: taskCount ?? space?.taskCount ?? 0,
      icon: 'check_circle',
      color: 'text-primary',
      bg: 'bg-primary/10',
      border: 'border-primary/20',
      note: 'Actions & milestones',
    },
    {
      id: 'notes',
      label: 'Mindful Notes',
      count: noteCount ?? space?.noteCount ?? 0,
      icon: 'menu_book',
      color: 'text-rose-600',
      bg: 'bg-rose-500/10',
      border: 'border-rose-300/40',
      note: 'Summaries & lecture thoughts',
    },
    {
      id: 'deadlines',
      label: 'Upcoming Deadlines',
      count: deadlinesCount ?? space?.deadlinesCount ?? 0,
      icon: 'schedule',
      color: 'text-[#B85C7A]',
      bg: 'bg-[#B85C7A]/10',
      border: 'border-[#B85C7A]/25',
      note: 'Exams & submissions',
    },
    {
      id: 'resources',
      label: 'Saved Resources',
      count: resourceCount ?? space?.resourceCount ?? 0,
      icon: 'folder_open',
      color: 'text-rose-600',
      bg: 'bg-rose-500/10',
      border: 'border-rose-300/40',
      note: 'Links, syllabi & PDFs',
    },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
      {cards.map((card) => {
        const isSelected = activeTab === card.id;

        return (
          <button
            key={card.id}
            type="button"
            onClick={() => onTabChange && onTabChange(card.id)}
            className={`glass-card group text-left relative overflow-hidden rounded-[24px] sm:rounded-[28px] p-4 sm:p-5 transition-all duration-200 border ${
              isSelected
                ? 'border-primary ring-2 ring-primary/20 bg-white/70 shadow-md'
                : 'border-white/80 bg-white/45 hover:bg-white/60 hover:-translate-y-0.5'
            }`}
          >
            <div className="flex items-center justify-between">
              <div
                className={`flex h-10 w-10 items-center justify-center rounded-2xl ${card.bg} ${card.color} border ${card.border} shadow-inner`}
              >
                <span className="material-symbols-outlined text-[20px]">{card.icon}</span>
              </div>

              <span className="text-2xl sm:text-3xl font-extrabold tracking-tight text-on-surface">
                {card.count}
              </span>
            </div>

            <div className="mt-3">
              <h4 className="text-[13px] sm:text-[14px] font-bold text-on-surface group-hover:text-primary transition-colors">
                {card.label}
              </h4>
              <p className="text-[11px] text-outline mt-0.5 truncate">{card.note}</p>
            </div>
          </button>
        );
      })}
    </div>
  );
}

export default SpaceOverview;
