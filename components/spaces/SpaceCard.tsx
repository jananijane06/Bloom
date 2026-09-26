'use client';

import React from 'react';
import Link from 'next/link';
import { Space } from '@/types/space';
import { cn } from '@/lib/utils';
import { getCourseInformationText } from '@/lib/courseInformation';

export interface SpaceCardProps {
  space: Space;
  onEdit?: (space: Space) => void;
  onDelete?: (space: Space) => void;
  className?: string;
}

const COLOR_ACCENTS: Record<string, { bg: string; text: string; border: string; glow: string }> = {
  rose: { bg: 'bg-rose-500/10', text: 'text-rose-600', border: 'border-rose-300/40', glow: 'from-rose-500/10' },
  berry: { bg: 'bg-[#701F43]/10', text: 'text-[#701F43]', border: 'border-[#701F43]/30', glow: 'from-[#701F43]/10' },
  coral: { bg: 'bg-[#B85C7A]/10', text: 'text-[#B85C7A]', border: 'border-[#B85C7A]/30', glow: 'from-[#B85C7A]/10' },
  peach: { bg: 'bg-rose-500/10', text: 'text-rose-700', border: 'border-rose-300/40', glow: 'from-rose-500/10' },
  violet: { bg: 'bg-rose-500/10', text: 'text-rose-600', border: 'border-rose-300/40', glow: 'from-rose-500/10' },
  lilac: { bg: 'bg-rose-500/10', text: 'text-rose-600', border: 'border-rose-300/40', glow: 'from-rose-500/10' },
  emerald: { bg: 'bg-rose-500/10', text: 'text-rose-700', border: 'border-rose-300/40', glow: 'from-rose-500/10' },
  sky: { bg: 'bg-rose-500/10', text: 'text-rose-700', border: 'border-rose-300/40', glow: 'from-rose-500/10' },
  amber: { bg: 'bg-rose-500/10', text: 'text-rose-700', border: 'border-rose-300/40', glow: 'from-rose-500/10' },
  indigo: { bg: 'bg-rose-500/10', text: 'text-rose-700', border: 'border-rose-300/40', glow: 'from-rose-500/10' },
  teal: { bg: 'bg-teal-500/10', text: 'text-teal-700', border: 'border-teal-300/40', glow: 'from-teal-500/10' },
};

export function SpaceCard({ space, onEdit, onDelete, className = '' }: SpaceCardProps) {
  const accent = COLOR_ACCENTS[space.cover_color || 'rose'] || COLOR_ACCENTS.berry;
  const description = space.description ? getCourseInformationText(space.description) : '';

  return (
    <div
      className={cn(
        'group relative flex flex-col justify-between overflow-hidden rounded-[30px] border border-white/80 bg-white/45 p-6 shadow-[0_8px_30px_rgba(216,43,110,0.04)] backdrop-blur-2xl transition-all duration-300 hover:-translate-y-1 hover:bg-white/60 hover:shadow-[0_16px_36px_rgba(216,43,110,0.12)]',
        className
      )}
    >
      {/* Top ambient highlight */}
      <div
        className={cn(
          'absolute -right-8 -top-8 h-28 w-28 rounded-full bg-gradient-to-br to-transparent opacity-40 blur-xl transition-opacity group-hover:opacity-70',
          accent.glow
        )}
      />

      {/* TOP: ICON, TITLE, TYPE & QUICK ACTIONS */}
      <div>
        <div className="flex items-start justify-between gap-3">
          <Link href={`/spaces/${space.id}`} className="flex items-center gap-3.5 group/header">
            <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-2xl bg-white/80 border border-white/90 text-[24px] shadow-sm ring-1 ring-black/5 transition-transform group-hover/header:scale-105">
              {space.image_url ? (
                <img
                  src={space.image_url}
                  alt=""
                  aria-hidden="true"
                  className="h-full w-full rounded-2xl object-cover"
                />
              ) : (
                <span>{space.name.charAt(0).toUpperCase()}</span>
              )}
            </div>

            <div className="min-w-0">
              <h3 className="truncate text-[16px] font-bold text-on-surface transition-colors group-hover:text-primary">
                {space.name}
              </h3>
              {space.type && (
                <span
                  className={cn(
                    'mt-0.5 inline-block rounded-full border px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider',
                    accent.bg,
                    accent.text,
                    accent.border
                  )}
                >
                  {space.type}
                </span>
              )}
            </div>
          </Link>

          {/* QUICK EDIT / DELETE ACTIONS */}
          <div className="flex items-center gap-1 opacity-90 transition-opacity">
            {onEdit && (
              <button
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  onEdit(space);
                }}
                title="Edit Space"
                aria-label={`Edit ${space.name}`}
                className="flex h-8 w-8 items-center justify-center rounded-full text-outline transition hover:bg-white/80 hover:text-primary"
              >
                <span className="material-symbols-outlined text-[17px]">edit</span>
              </button>
            )}

            {onDelete && (
              <button
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  onDelete(space);
                }}
                title="Delete Space"
                aria-label={`Delete ${space.name}`}
                className="flex h-8 w-8 items-center justify-center rounded-full text-outline transition hover:bg-[#B85C7A]/10 hover:text-[#B85C7A]"
              >
                <span className="material-symbols-outlined text-[17px]">delete</span>
              </button>
            )}
          </div>
        </div>

        {/* DESCRIPTION */}
        <Link href={`/spaces/${space.id}`} className="block">
          <p className="mt-3.5 text-[12px] text-on-surface-variant line-clamp-2 leading-relaxed">
            {description || 'Gentle dedicated space for tasks, notes, and goals.'}
          </p>
        </Link>
      </div>

      {/* BOTTOM: STATS BAR & ENTER ACTION */}
      <div className="mt-5 border-t border-white/60 pt-3.5 flex items-center justify-between">
        <div className="flex items-center gap-3 text-[11px] font-medium text-outline">
          <span className="flex items-center gap-1" title="Tasks">
            <span className="material-symbols-outlined text-[15px] text-primary">check_circle</span>
            <span>{space.taskCount ?? 0}</span>
          </span>
          <span className="flex items-center gap-1" title="Notes">
            <span className="material-symbols-outlined text-[15px] text-rose-500">menu_book</span>
            <span>{space.noteCount ?? 0}</span>
          </span>
          <span className="flex items-center gap-1" title="Deadlines">
            <span className="material-symbols-outlined text-[15px] text-rose-500">schedule</span>
            <span>{space.deadlinesCount ?? 0}</span>
          </span>
        </div>

        <Link
          href={`/spaces/${space.id}`}
          className="inline-flex items-center gap-1 text-[12px] font-semibold text-primary transition group-hover:translate-x-0.5"
        >
          <span>Open</span>
          <span className="material-symbols-outlined text-[15px]">arrow_forward</span>
        </Link>
      </div>
    </div>
  );
}

export default SpaceCard;
