'use client';

import React from 'react';

export interface SpaceStatsProps {
  taskCount: number;
  noteCount: number;
  deadlinesCount: number;
  resourceCount: number;
  activeTab?: string;
  onTabChange?: (tab: string) => void;
}

export function SpaceStats({
  taskCount,
  noteCount,
  deadlinesCount,
  resourceCount,
  activeTab,
  onTabChange,
}: SpaceStatsProps) {
  const cards = [
    {
      id: 'tasks',
      label: 'Focus Tasks',
      count: taskCount,
      icon: 'check_circle',
      color: 'text-primary',
      bg: 'bg-primary/10',
      border: 'border-primary/20',
      note: 'Actions & milestones',
    },
    {
      id: 'notes',
      label: 'Mindful Notes',
      count: noteCount,
      icon: 'menu_book',
      color: 'text-rose-600',
      bg: 'bg-rose-500/10',
      border: 'border-rose-300/40',
      note: 'Reflections & lecture thoughts',
    },
    {
      id: 'deadlines',
      label: 'Upcoming Deadlines',
      count: deadlinesCount,
      icon: 'schedule',
      color: 'text-[#B85C7A]',
      bg: 'bg-[#B85C7A]/10',
      border: 'border-[#B85C7A]/25',
      note: 'Exams & submissions',
    },
    {
      id: 'resources',
      label: 'Saved Resources',
      count: resourceCount,
      icon: 'folder_open',
      color: 'text-rose-600',
      bg: 'bg-rose-500/10',
      border: 'border-rose-300/40',
      note: 'Links, syllabi & references',
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
                ? 'border-primary ring-2 ring-primary/20 bg-white/75 shadow-md'
                : 'border-white/80 bg-white/50 hover:bg-white/70 hover:-translate-y-0.5'
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

export default SpaceStats;
