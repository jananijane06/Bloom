import React from 'react';

export interface AuthCardProps {
  children: React.ReactNode;
  title: string;
  subtitle?: string;
  badge?: string;
}

export function AuthCard({
  children,
  title,
  subtitle,
  badge = 'Bloom Sanctuary OS',
}: AuthCardProps) {
  return (
    <main className="sanctuary-bg relative min-h-screen flex items-center justify-center p-4 sm:p-6 overflow-hidden">
      {/* Ambient background glow */}
      <div className="bloom-ambient">
        <div className="bloom-glow-pink" />
        <div className="bloom-glow-peach" />
        <div className="bloom-glow-lilac" />
      </div>

      <div className="relative z-10 w-full max-w-[460px]">
        {/* BRAND LOGO / BADGE */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center gap-2 rounded-full border border-white/80 bg-white/50 px-4 py-1.5 shadow-sm backdrop-blur-md mb-3">
            <span className="h-2 w-2 rounded-full bg-primary animate-pulse" />
            <span className="text-[11px] font-bold uppercase tracking-[0.16em] text-primary">
              {badge}
            </span>
          </div>

          <h1 className="text-[30px] sm:text-[34px] font-bold tracking-tight text-on-surface">
            {title}
          </h1>
          {subtitle && (
            <p className="mt-1 text-[13px] text-outline">
              {subtitle}
            </p>
          )}
        </div>

        {/* FROSTED GLASS CARD */}
        <div className="glass-card relative overflow-hidden rounded-[32px] p-6 sm:p-8 border border-white/80 shadow-2xl backdrop-blur-2xl">
          {children}
        </div>

        {/* FOOTER NOTE */}
        <p className="mt-6 text-center text-[11px] text-outline">
          Your personal data is encrypted & stored with Row Level Security 🔒
        </p>
      </div>
    </main>
  );
}
