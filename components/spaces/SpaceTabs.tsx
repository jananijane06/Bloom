'use client';

import React from 'react';

export type SpaceTabType = 'upcoming' | 'tasks' | 'notes' | 'resources' | 'deadlines';

export interface SpaceTabsProps {
  activeTab: SpaceTabType;
  onTabChange: (tab: SpaceTabType) => void;
  taskCount?: number;
  noteCount?: number;
  deadlineCount?: number;
  resourceCount?: number;
}

export function SpaceTabs({
  activeTab,
  onTabChange,
  taskCount,
  noteCount,
  deadlineCount,
  resourceCount,
}: SpaceTabsProps) {
  const tabs = [
    {
      id: 'upcoming' as const,
      label: 'Upcoming',
      icon: 'auto_awesome',
      count: undefined,
    },
    {
      id: 'tasks' as const,
      label: 'Tasks',
      icon: 'check_circle',
      count: taskCount,
    },
    {
      id: 'notes' as const,
      label: 'Mindful Notes',
      icon: 'menu_book',
      count: noteCount,
    },
    {
      id: 'resources' as const,
      label: 'Resources',
      icon: 'folder_open',
      count: resourceCount,
    },
    {
      id: 'deadlines' as const,
      label: 'Deadlines',
      icon: 'schedule',
      count: deadlineCount,
    },
  ];

  return (
    <div className="flex items-center justify-between border-b border-white/60 pb-3">
      <div className="flex items-center gap-2 overflow-x-auto scrollbar-hide py-1">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => onTabChange(tab.id)}
              className={`inline-flex items-center gap-2 rounded-full px-4 py-2.5 text-[12px] font-bold tracking-wide transition-all ${
                isActive
                  ? 'berry-button text-white shadow-sm ring-2 ring-primary/20'
                  : 'border border-white/80 bg-white/50 text-outline hover:bg-white hover:text-on-surface shadow-xs'
              }`}
            >
              <span className="material-symbols-outlined text-[17px]">{tab.icon}</span>
              <span>{tab.label}</span>
              {typeof tab.count === 'number' && (
                <span
                  className={`ml-0.5 rounded-full px-1.5 py-0.2 text-[10px] font-bold ${
                    isActive
                      ? 'bg-white/25 text-white'
                      : 'bg-black/5 text-outline'
                  }`}
                >
                  {tab.count}
                </span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}

export default SpaceTabs;
