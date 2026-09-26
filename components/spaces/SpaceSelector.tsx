'use client';

import React, { useState, useEffect } from 'react';
import { Space } from '@/types/space';
import { fetchUserSpaces } from '@/lib/spaces';
import { useAuth } from '@/components/auth/AuthProvider';

export interface SpaceSelectorProps {
  value?: string | null;
  onChange: (spaceId: string | null) => void;
  spaces?: Space[];
  label?: string;
  allowNoSpace?: boolean;
  disabled?: boolean;
  className?: string;
}

export function SpaceSelector({
  value,
  onChange,
  spaces: passedSpaces,
  label = 'Space',
  allowNoSpace = true,
  disabled = false,
  className = '',
}: SpaceSelectorProps) {
  const { user } = useAuth();
  const [spaces, setSpaces] = useState<Space[]>(passedSpaces || []);
  const [loading, setLoading] = useState(!passedSpaces);

  useEffect(() => {
    if (passedSpaces) {
      setSpaces(passedSpaces);
      return;
    }

    let mounted = true;
    fetchUserSpaces(user?.id)
      .then((data) => {
        if (mounted) {
          setSpaces(data);
          setLoading(false);
        }
      })
      .catch((err) => {
        console.error('Failed to load spaces for selector:', err);
        if (mounted) setLoading(false);
      });

    return () => {
      mounted = false;
    };
  }, [passedSpaces, user?.id]);

  const selectedValue = value ?? '';

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const val = e.target.value;
    onChange(val ? val : null);
  };

  const selectedSpace = spaces.find((s) => s.id === selectedValue);

  return (
    <div className={`space-y-1.5 ${className}`}>
      {label && (
        <label className="block text-[11px] font-bold uppercase tracking-wider text-outline flex items-center justify-between">
          <span>{label}</span>
          {selectedSpace && (
            <span className="text-[10px] text-primary font-semibold lowercase">
              {selectedSpace.type || 'space'}
            </span>
          )}
        </label>
      )}

      <div className="relative">
        <select
          value={selectedValue}
          onChange={handleChange}
          disabled={disabled || loading}
          className="w-full appearance-none rounded-2xl border border-white/80 bg-white/70 px-4 py-2.5 pr-10 text-[13px] text-on-surface font-medium outline-none transition-all duration-200 focus:border-primary/50 focus:bg-white focus:ring-2 focus:ring-primary/20 shadow-sm cursor-pointer disabled:opacity-50"
        >
          {allowNoSpace && (
            <option value="">
              No Space (General Sanctuary)
            </option>
          )}

          {spaces.map((s) => (
            <option key={s.id} value={s.id}>
              {s.name}
            </option>
          ))}
        </select>

        {/* Custom Caret Icon */}
        <div className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 flex items-center text-outline">
          <span className="material-symbols-outlined text-[18px]">
            unfold_more
          </span>
        </div>
      </div>
    </div>
  );
}

export default SpaceSelector;
