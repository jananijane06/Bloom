'use client';

import React, { useState } from 'react';
import AppShell from '@/components/layout/AppShell';
import { GlassCard } from '@/components/ui/GlassCard';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Modal } from '@/components/ui/Modal';
import { Plus, Clock, Check, Trash2, Repeat } from 'lucide-react';
import { generateId, cn } from '@/lib/utils';

interface Reminder {
  id: string;
  title: string;
  time: string;
  category: 'wellness' | 'focus' | 'admin';
  isActive: boolean;
  repeat: 'daily' | 'weekdays' | 'once';
}

const INITIAL_REMINDERS: Reminder[] = [
  { id: 'rem-1', title: 'Hydration & Lemon Water Check', time: '10:30', category: 'wellness', isActive: true, repeat: 'daily' },
  { id: 'rem-2', title: 'Unplug and stretch eye muscles (20-20-20 rule)', time: '14:00', category: 'wellness', isActive: true, repeat: 'daily' },
  { id: 'rem-3', title: 'Deep focus lock-in: Silence phone notifications', time: '09:15', category: 'focus', isActive: true, repeat: 'weekdays' },
  { id: 'rem-4', title: 'Review daily intentions & wind-down', time: '17:30', category: 'wellness', isActive: false, repeat: 'daily' },
];

export default function RemindersPage() {
  const [reminders, setReminders] = useState<Reminder[]>(INITIAL_REMINDERS);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newTime, setNewTime] = useState('11:00');
  const [newCategory, setNewCategory] = useState<Reminder['category']>('wellness');
  const [newRepeat, setNewRepeat] = useState<Reminder['repeat']>('daily');

  const handleToggle = (id: string) => {
    setReminders((prev) =>
      prev.map((r) => (r.id === id ? { ...r, isActive: !r.isActive } : r))
    );
  };

  const handleDelete = (id: string) => {
    setReminders((prev) => prev.filter((r) => r.id !== id));
  };

  const handleAddReminder = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    const reminder: Reminder = {
      id: `rem-${generateId()}`,
      title: newTitle.trim(),
      time: newTime,
      category: newCategory,
      isActive: true,
      repeat: newRepeat,
    };

    setReminders((prev) => [reminder, ...prev]);
    setNewTitle('');
    setIsModalOpen(false);
  };

  return (
    <AppShell>
      {/* Ambient background */}
      <div className="bloom-ambient">
        <div className="bloom-glow-pink" />
        <div className="bloom-glow-peach" />
        <div className="bloom-glow-lilac" />
      </div>

      <div className="sanctuary-bg relative min-h-[calc(100vh-64px)] p-6 lg:p-8">
        <div className="relative z-10 mx-auto max-w-[1400px] space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <p className="editorial-label mb-2 text-primary">A FEW THINGS TO REMEMBER</p>
              <div className="flex items-center gap-3">
                <h1 className="text-3xl font-bold tracking-tight text-on-surface">
                  small things to remember
                </h1>
                <span className="px-3 py-1 rounded-full text-xs font-semibold bg-primary/10 text-primary border border-primary/20">
                  {reminders.filter((r) => r.isActive).length} active
                </span>
              </div>
              <p className="text-xs sm:text-sm text-on-surface-variant mt-1">
                A few quiet reminders for the day ahead.
              </p>
            </div>

            <Button
              variant="primary"
              size="sm"
              leftIcon={<Plus className="w-4 h-4" />}
              onClick={() => setIsModalOpen(true)}
            >
              Add Reminder
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {reminders.map((r) => (
              <GlassCard
                key={r.id}
                className={cn(
                  'p-5 transition-all flex items-start justify-between gap-3',
                  !r.isActive && 'opacity-60 bg-white/30'
                )}
              >
                <div className="flex items-start gap-3">
                  <button
                    onClick={() => handleToggle(r.id)}
                    className={cn(
                      'mt-0.5 w-5 h-5 rounded-lg border flex items-center justify-center transition-colors',
                      r.isActive
                        ? 'bg-primary border-primary text-white shadow-sm'
                        : 'border-white/90 bg-white/40'
                    )}
                  >
                    {r.isActive && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                  </button>

                  <div>
                    <h4
                      className={cn(
                        'text-sm font-semibold text-on-surface',
                        !r.isActive && 'line-through text-outline'
                      )}
                    >
                      {r.title}
                    </h4>

                    <div className="flex items-center gap-2 mt-2 text-xs">
                      <span className="inline-flex items-center gap-1 font-semibold text-on-surface bg-white/70 px-2 py-0.5 rounded-full text-[11px] border border-white/60">
                        <Clock className="w-3 h-3 text-outline" />
                        {r.time}
                      </span>
                      <span className="inline-flex items-center gap-1 text-[11px] text-outline">
                        <Repeat className="w-3 h-3" />
                        {r.repeat}
                      </span>
                      <Badge variant={r.category === 'wellness' ? 'coral' : 'primary'} size="sm">
                        {r.category}
                      </Badge>
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => handleDelete(r.id)}
                  className="p-1.5 text-outline hover:text-primary rounded-lg hover:bg-white/60 transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </GlassCard>
            ))}
          </div>

          <Modal
            isOpen={isModalOpen}
            onClose={() => setIsModalOpen(false)}
            title="Add Mindful Reminder"
            description="Schedule a gentle alert for your wellbeing."
          >
            <form onSubmit={handleAddReminder} className="space-y-4 pt-2">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-outline mb-1">
                  Title
                </label>
                <input
                  type="text"
                  placeholder="e.g. 5-minute tea & breathing break"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  required
                  autoFocus
                  className="w-full px-3.5 py-2.5 rounded-xl bg-white/70 border border-white/90 text-sm text-on-surface placeholder:text-outline/70 focus:outline-none focus:ring-2 focus:ring-primary/20"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-outline mb-1">
                    Time
                  </label>
                  <input
                    type="time"
                    value={newTime}
                    onChange={(e) => setNewTime(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl bg-white/70 border border-white/90 text-sm text-on-surface focus:outline-none focus:ring-2 focus:ring-primary/20"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-outline mb-1">
                    Frequency
                  </label>
                  <select
                    value={newRepeat}
                    onChange={(e) => setNewRepeat(e.target.value as Reminder['repeat'])}
                    className="w-full px-3.5 py-2 rounded-xl bg-white/70 border border-white/90 text-sm text-on-surface focus:outline-none focus:ring-2 focus:ring-primary/20"
                  >
                    <option value="daily">Daily</option>
                    <option value="weekdays">Weekdays</option>
                    <option value="once">Once</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-outline mb-1">
                  Category
                </label>
                <select
                  value={newCategory}
                  onChange={(e) => setNewCategory(e.target.value as Reminder['category'])}
                  className="w-full px-3.5 py-2 rounded-xl bg-white/70 border border-white/90 text-sm text-on-surface focus:outline-none focus:ring-2 focus:ring-primary/20"
                >
                  <option value="wellness">Wellbeing</option>
                  <option value="focus">Focus time</option>
                  <option value="admin">Daily routine</option>
                </select>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <Button type="button" variant="ghost" size="sm" onClick={() => setIsModalOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" variant="primary" size="sm">
                  Save Reminder
                </Button>
              </div>
            </form>
          </Modal>
        </div>
      </div>
    </AppShell>
  );
}
