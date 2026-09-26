'use client';

import React, { useEffect, useState } from 'react';
import { CalendarDays, Check, LoaderCircle } from 'lucide-react';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { TimetableCalendarPeriod } from '@/lib/calendarEvents';
import { TimetableClassRow } from '@/types/timetable';

interface TimetableCalendarPromptProps {
  isOpen: boolean;
  classes: TimetableClassRow[];
  onAdd: (period: TimetableCalendarPeriod) => Promise<void>;
  onClose: () => void;
}

const PERIODS: { id: TimetableCalendarPeriod; title: string; description: string }[] = [
  { id: 'week', title: 'This week', description: 'Add the classes for the rest of this week.' },
  { id: 'month', title: 'This month', description: 'Repeat each class through the end of this month.' },
  { id: 'year', title: 'Whole year', description: 'Repeat classes for the next 12 months.' },
];

export function TimetableCalendarPrompt({ isOpen, classes, onAdd, onClose }: TimetableCalendarPromptProps) {
  const [selected, setSelected] = useState<TimetableCalendarPeriod | null>(null);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (isOpen) {
      setSelected(null);
      setBusy(false);
      setMessage('');
      setError('');
    }
  }, [isOpen]);

  const skip = () => setMessage('Saved to your Timetable. You can add it to Calendar later.');

  const add = async () => {
    if (!selected || busy) return;
    setBusy(true);
    setError('');
    try {
      await onAdd(selected);
      setMessage('Your timetable has bloomed into your Calendar ✦');
    } catch (cause) {
      const failure = cause as { code?: string; message?: string };
      if (failure.code === '42501' || failure.code === 'PGRST301') {
        setError('Supabase denied the Calendar save. Check that you are signed in and that the Calendar owner policies are applied. Your timetable classes are still saved.');
      } else if (failure.message?.toLowerCase().includes('fetch')) {
        setError('Bloom could not reach Supabase to save these Calendar dates. Check your connection and try again. Your timetable classes are still saved.');
      } else {
        setError(failure.message
          ? `Bloom could not add those classes to Calendar: ${failure.message}`
          : 'Bloom could not add those classes to Calendar. Your timetable classes are still saved; please try again.');
      }
    } finally {
      setBusy(false);
    }
  };

  const complete = !!message;

  return (
    <Modal
      isOpen={isOpen}
      onClose={() => !busy && (complete ? onClose() : skip())}
      title={complete ? 'All set' : 'Add these classes to your Calendar? ✦'}
      description={complete ? undefined : 'Choose how far you want Bloom to schedule your recurring classes.'}
      maxWidth="lg"
    >
      {complete ? (
        <div className="flex min-h-40 flex-col items-center justify-center gap-3 py-4 text-center">
          <span className="flex h-11 w-11 items-center justify-center rounded-full bg-[#F8E3E8] text-[#701F43]"><Check className="h-5 w-5" /></span>
          <p className="max-w-sm font-serif text-xl leading-relaxed text-[#351A26]">{message}</p>
          <Button type="button" size="sm" onClick={onClose}>Done</Button>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="space-y-2">
            {PERIODS.map((period) => (
              <label key={period.id} className={`flex cursor-pointer items-start gap-3 rounded-2xl border px-4 py-3 transition ${selected === period.id ? 'border-[#8E3159]/35 bg-[#F8E3E8]/50 shadow-sm' : 'border-white/85 bg-white/55 hover:bg-white/80'}`}>
                <input type="radio" name="timetable-calendar-period" value={period.id} checked={selected === period.id} onChange={() => setSelected(period.id)} className="mt-1 accent-[#701F43]" />
                <span className="min-w-0 flex-1">
                  <span className="block text-sm font-semibold text-[#351A26]">{period.title}</span>
                  <span className="mt-0.5 block text-xs leading-relaxed text-[#684653]">{period.description}</span>
                </span>
                <CalendarDays className={`mt-0.5 h-4 w-4 shrink-0 ${selected === period.id ? 'text-[#8E3159]' : 'text-[#967783]'}`} />
              </label>
            ))}
          </div>
          <p className="text-[11px] text-[#967783]">{classes.length} {classes.length === 1 ? 'class' : 'classes'} saved as recurring timetable entries.</p>
          {error && <p role="alert" className="rounded-xl bg-[#F8E3E8]/70 px-3 py-2 text-xs text-[#701F43]">{error}</p>}
          {busy && <p role="status" className="inline-flex w-full items-center justify-center gap-2 text-xs text-[#684653]"><LoaderCircle className="h-4 w-4 animate-spin" /> Bloom is adding your classes...</p>}
          <div className="flex flex-wrap items-center justify-between gap-2 border-t border-white/70 pt-3">
            <button type="button" disabled={busy} onClick={skip} className="rounded-full px-3.5 py-2 text-xs font-medium text-[#684653] transition hover:bg-white/70 disabled:opacity-50">Skip for now</button>
            <Button type="button" size="sm" disabled={!selected || busy} isLoading={busy} onClick={() => void add()}>Add to Calendar</Button>
          </div>
        </div>
      )}
    </Modal>
  );
}
