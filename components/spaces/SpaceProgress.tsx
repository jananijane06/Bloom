'use client';

import React from 'react';

export interface SpaceProgressProps {
  completedTasks: number;
  totalTasks: number;
  upcomingDeadlinesCount: number;
}

export function SpaceProgress({
  completedTasks,
  totalTasks,
  upcomingDeadlinesCount,
}: SpaceProgressProps) {
  const percentage =
    totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;
  const remainingTasks = Math.max(0, totalTasks - completedTasks);

  // SVG circular progress parameters
  const size = 148;
  const strokeWidth = 11;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  let affirmation = "Start your first task ";
  if (totalTasks > 0) {
    if (percentage === 100) {
      affirmation = "Nothing left for today.";
    } else if (percentage >= 50) {
      affirmation = "You're making progress.";
    } else {
      affirmation = "One thing at a time.";
    }
  }

  return (
    <div className="glass-card relative overflow-hidden rounded-[30px] sm:rounded-[32px] p-6 sm:p-8 border border-white/85 shadow-md backdrop-blur-2xl">
      {/* Decorative background glows */}
      <div className="pointer-events-none absolute -right-16 -top-16 h-56 w-56 rounded-full bg-[#701F43]/10 blur-3xl" />
      <div className="pointer-events-none absolute -left-16 -bottom-16 h-56 w-56 rounded-full bg-[#8E3159]/10 blur-3xl" />

      <div className="relative z-10 flex flex-col md:flex-row items-center gap-6 sm:gap-8 lg:gap-10">
        {/* CIRCULAR SVG PROGRESS RING */}
        <div className="relative flex-shrink-0 flex items-center justify-center">
          <svg
            width={size}
            height={size}
            className="rotate-[-90deg] drop-shadow-sm transition-transform duration-500"
          >
            <defs>
              <linearGradient id="bloomProgressGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#701F43" />
                <stop offset="60%" stopColor="#D9829B" />
                <stop offset="100%" stopColor="#8E3159" />
              </linearGradient>
              <filter id="bloomProgressGlow" x="-20%" y="-20%" width="140%" height="140%">
                <feGaussianBlur stdDeviation="3" result="blur" />
                <feComposite in="SourceGraphic" in2="blur" operator="over" />
              </filter>
            </defs>

            {/* Background ring */}
            <circle
              cx={size / 2}
              cy={size / 2}
              r={radius}
              stroke="rgba(244, 114, 182, 0.15)"
              strokeWidth={strokeWidth}
              fill="transparent"
            />

            {/* Animated progress stroke */}
            <circle
              cx={size / 2}
              cy={size / 2}
              r={radius}
              stroke="url(#bloomProgressGradient)"
              strokeWidth={strokeWidth}
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              strokeLinecap="round"
              fill="transparent"
              filter="url(#bloomProgressGlow)"
              style={{
                transition: 'stroke-dashoffset 0.8s cubic-bezier(0.4, 0, 0.2, 1)',
              }}
            />
          </svg>

          {/* Centered percentage text */}
          <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
            <span className="text-3xl sm:text-4xl font-black tracking-tight text-on-surface">
              {percentage}%
            </span>
            <span className="text-[11px] font-bold uppercase tracking-wider text-outline -mt-0.5">
              progress
            </span>
          </div>
        </div>

        {/* PROGRESS DETAILS & SUPPORTING STATS */}
        <div className="flex-1 w-full text-center md:text-left space-y-4">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 border border-primary/20 px-3 py-0.5 text-[11px] font-bold text-primary">
              <span>Space Progress</span>
            </div>

            <h3 className="text-xl sm:text-2xl font-extrabold tracking-tight text-on-surface pt-1">
              {totalTasks > 0
                ? `${completedTasks} of ${totalTasks} tasks completed`
                : 'Start with one task'}
            </h3>

            <p className="text-[13px] sm:text-[14px] font-medium text-primary">
              {affirmation}
            </p>
          </div>

          {/* SECONDARY HORIZONTAL PROGRESS BAR */}
          <div className="space-y-1.5 max-w-lg mx-auto md:mx-0">
            <div className="h-2 w-full overflow-hidden rounded-full bg-rose-100/70 p-0.5 border border-white/60">
              <div
                className="h-full rounded-full bg-gradient-to-r from-[#701F43] via-[#D9829B] to-[#8E3159] transition-all duration-700 ease-out shadow-sm"
                style={{ width: `${Math.max(percentage, totalTasks > 0 ? 3 : 0)}%` }}
              />
            </div>
          </div>

          {/* SUPPORTING COUNTS ROW */}
          <div className="pt-1 flex flex-wrap items-center justify-center md:justify-start gap-2.5 sm:gap-3">
            <div className="inline-flex items-center gap-2 rounded-2xl bg-white/70 border border-white/90 px-3.5 py-1.5 shadow-xs">
              <span className="h-2 w-2 rounded-full bg-emerald-500" />
              <span className="text-[11px] font-semibold text-outline">Completed</span>
              <span className="text-[12px] font-bold text-on-surface">{completedTasks}</span>
            </div>

            <div className="inline-flex items-center gap-2 rounded-2xl bg-white/70 border border-white/90 px-3.5 py-1.5 shadow-xs">
              <span className="h-2 w-2 rounded-full bg-rose-400" />
              <span className="text-[11px] font-semibold text-outline">Remaining</span>
              <span className="text-[12px] font-bold text-on-surface">{remainingTasks}</span>
            </div>

            <div className="inline-flex items-center gap-2 rounded-2xl bg-white/70 border border-white/90 px-3.5 py-1.5 shadow-xs">
              <span className="h-2 w-2 rounded-full bg-[#B85C7A]" />
              <span className="text-[11px] font-semibold text-outline">Upcoming Deadlines</span>
              <span className="text-[12px] font-bold text-on-surface">{upcomingDeadlinesCount}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default SpaceProgress;
