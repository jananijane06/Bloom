import React from 'react';

export interface SpaceEmptyStateProps {
  title?: string;
  description?: string;
  actionLabel?: string;
  onAction?: () => void;
  icon?: string;
}

export function SpaceEmptyState({
  title = 'No spaces planted yet',
  description = 'Create a dedicated space to organize your classes, projects, clubs, or mindful personal growth.',
  actionLabel = 'Create Space',
  onAction,
  icon = 'spa',
}: SpaceEmptyStateProps) {
  return (
    <div className="glass-card relative overflow-hidden rounded-[32px] p-8 sm:p-12 text-center border border-white/80 shadow-sm backdrop-blur-2xl flex flex-col items-center justify-center max-w-lg mx-auto my-6">
      <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-3xl bg-primary/10 text-primary ring-8 ring-primary/5 shadow-inner">
        <span className="material-symbols-outlined text-[32px]">{icon}</span>
      </div>

      <h3 className="text-xl font-bold tracking-tight text-on-surface">
        {title} 
      </h3>

      <p className="mt-2 text-[13px] text-on-surface-variant max-w-sm leading-relaxed">
        {description}
      </p>

      {onAction && (
        <div className="mt-6">
          <button
            type="button"
            onClick={onAction}
            className="berry-button inline-flex items-center gap-2 rounded-full py-3 px-6 text-[13px] font-semibold text-white shadow-md transition hover:shadow-lg active:scale-95"
          >
            <span className="material-symbols-outlined text-[18px]">add</span>
            <span>{actionLabel}</span>
          </button>
        </div>
      )}
    </div>
  );
}

export default SpaceEmptyState;
