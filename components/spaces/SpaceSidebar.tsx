'use client';

import React from 'react';
import Link from 'next/link';
import { Space } from '@/types/space';
import { cn } from '@/lib/utils';

export interface SpaceSidebarProps {
  spaces: Space[];
  activeSpaceId?: string;
  onSelectSpace?: (id: string) => void;
  onAddSpace?: () => void;
}

export function SpaceSidebar({
  spaces,
  activeSpaceId,
  onSelectSpace,
  onAddSpace,
}: SpaceSidebarProps) {
  return (
    <div className="space-y-2">
      {/* HEADER */}
      <div className="flex items-center justify-between px-3 py-1">
        <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-outline">
          Sanctuary Spaces
        </span>
        {onAddSpace && (
          <button
            type="button"
            onClick={onAddSpace}
            title="Create Space"
            className="flex h-6 w-6 items-center justify-center rounded-full text-outline hover:text-primary hover:bg-white/60 transition"
          >
            <span className="material-symbols-outlined text-[16px]">add</span>
          </button>
        )}
      </div>

      {/* ALL TASKS / OVERVIEW LINK */}
      {onSelectSpace ? (
        <button
          type="button"
          onClick={() => onSelectSpace('all')}
          className={cn(
            'w-full flex items-center justify-between px-3.5 py-2 rounded-full text-[13px] font-semibold transition-all text-left',
            !activeSpaceId || activeSpaceId === 'all'
              ? 'berry-button text-white shadow-sm'
              : 'text-on-surface-variant hover:bg-white/60 hover:text-on-surface'
          )}
        >
          <div className="flex items-center gap-2.5">
            <span className="material-symbols-outlined text-[18px]">grid_view</span>
            <span>All Tasks</span>
          </div>
          <span className="text-[11px] opacity-80">{spaces.length}</span>
        </button>
      ) : (
        <Link
          href="/spaces"
          className={cn(
            'w-full flex items-center justify-between px-3.5 py-2 rounded-full text-[13px] font-medium transition-all text-left',
            !activeSpaceId || activeSpaceId === 'all'
              ? 'berry-button text-white shadow-sm'
              : 'text-on-surface-variant hover:bg-white/60 hover:text-on-surface'
          )}
        >
          <div className="flex items-center gap-2.5">
            <span className="material-symbols-outlined text-[18px]">grid_view</span>
            <span>All Spaces Overview</span>
          </div>
          <span className="text-[11px] opacity-80">{spaces.length}</span>
        </Link>
      )}

      {/* NO SPACE OPTION */}
      {onSelectSpace && (
        <button
          type="button"
          onClick={() => onSelectSpace('none')}
          className={cn(
            'w-full flex items-center justify-between px-3.5 py-2 rounded-full text-[13px] font-medium transition-all text-left',
            activeSpaceId === 'none'
              ? 'berry-button text-white shadow-sm font-semibold'
              : 'text-on-surface-variant hover:bg-white/60 hover:text-on-surface'
          )}
        >
          <div className="flex items-center gap-2.5">
            
            <span>No Space (Personal)</span>
          </div>
        </button>
      )}

      {/* INDIVIDUAL SPACES */}
      <div className="space-y-1 pt-1">
        {spaces.map((space) => {
          const isActive = activeSpaceId === space.id;

          const buttonContent = (
            <>
              <div className="flex items-center gap-2.5 min-w-0">
                
                <span className="truncate">{space.name}</span>
              </div>
              {space.type && (
                <span
                  className={cn(
                    'text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border',
                    isActive
                      ? 'border-white/40 bg-white/20 text-white'
                      : 'border-white/80 bg-white/70 text-outline'
                  )}
                >
                  {space.type}
                </span>
              )}
            </>
          );

          if (onSelectSpace) {
            return (
              <button
                key={space.id}
                type="button"
                onClick={() => onSelectSpace(space.id)}
                className={cn(
                  'w-full flex items-center justify-between px-3.5 py-2 rounded-full text-[13px] font-medium transition-all text-left',
                  isActive
                    ? 'berry-button text-white shadow-sm font-semibold'
                    : 'text-on-surface-variant hover:bg-white/50 hover:text-on-surface'
                )}
              >
                {buttonContent}
              </button>
            );
          }

          return (
            <Link
              key={space.id}
              href={`/spaces/${space.id}`}
              className={cn(
                'w-full flex items-center justify-between px-3.5 py-2 rounded-full text-[13px] font-medium transition-all text-left',
                isActive
                  ? 'berry-button text-white shadow-sm font-semibold'
                  : 'text-on-surface-variant hover:bg-white/50 hover:text-on-surface'
              )}
            >
              {buttonContent}
            </Link>
          );
        })}
      </div>
    </div>
  );
}

export default SpaceSidebar;
