'use client';

import React, { useState } from 'react';
import AppShell from '@/components/layout/AppShell';
import { GlassCard } from '@/components/ui/GlassCard';
import { Button } from '@/components/ui/Button';
import { ProgressRing } from '@/components/ui/ProgressRing';
import { INITIAL_MOOD_LOGS } from '@/lib/constants';
import { MoodLog, MoodType } from '@/types/journal';
import { Wind, Smile } from 'lucide-react';
import { generateId, cn } from '@/lib/utils';

export default function MoodPage() {
  const [logs, setLogs] = useState<MoodLog[]>(INITIAL_MOOD_LOGS);
  const [selectedMood, setSelectedMood] = useState<MoodType>('serene');
  const [energyLevel, setEnergyLevel] = useState<number>(4);
  const [selectedTags, setSelectedTags] = useState<string[]>(['Calm']);
  const [note, setNote] = useState('');
  const [isBreathingActive, setIsBreathingActive] = useState(false);

  const availableTags = [
    'Calm',
    'Grounded',
    'Energized',
    'In the flow',
    'Rested',
    'Thoughtful',
    'Tired',
    'Anxious',
    'Grateful',
  ];

  const moodOptions: { type: MoodType; label: string }[] = [
    { type: 'serene', label: 'Serene' },
    { type: 'radiant', label: 'Radiant' },
    { type: 'focused', label: 'Focused' },
    { type: 'reflective', label: 'Reflective' },
    { type: 'drained', label: 'Drained' },
    { type: 'anxious', label: 'Anxious' },
  ];

  const toggleTag = (t: string) => {
    setSelectedTags((prev) =>
      prev.includes(t) ? prev.filter((item) => item !== t) : [...prev, t]
    );
  };

  const handleLogMood = (e: React.FormEvent) => {
    e.preventDefault();
    const newLog: MoodLog = {
      id: `mood-${generateId()}`,
      date: new Date().toISOString().split('T')[0],
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      mood: selectedMood,
      energyLevel,
      tags: selectedTags,
      note: note.trim() || undefined,
    };

    setLogs((prev) => [newLog, ...prev]);
    setNote('');
  };

  const toggleBreathExercise = () => {
    setIsBreathingActive(!isBreathingActive);
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
        <div className="relative z-10 mx-auto max-w-[1400px] space-y-8">
          {/* Header */}
          <div>
            <p className="editorial-label mb-2 text-primary">A MOMENT TO CHECK IN</p>
            <div className="flex items-center gap-3">
              <h1 className="text-3xl font-bold tracking-tight text-on-surface flex items-center gap-2">
                How are you, really?
              </h1>
              <span className="px-3 py-1 rounded-full text-xs font-semibold bg-primary/10 text-primary border border-primary/20">
                Wellness
              </span>
            </div>
            <p className="text-xs sm:text-sm text-on-surface-variant mt-1">
              Acknowledge your emotional weather without judgement.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
            {/* Left 2 Cols: Log Mood & History */}
            <div className="lg:col-span-2 space-y-6">
              {/* Mood Logging Card */}
              <GlassCard className="p-6">
                <h2 className="text-base font-bold text-on-surface mb-4 flex items-center gap-2">
                  <Smile className="w-5 h-5 text-primary" />
                  Check In With Yourself
                </h2>

                <form onSubmit={handleLogMood} className="space-y-5">
                  {/* Emotion Selector */}
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-outline mb-2">
                      Dominant Emotion
                    </label>
                    <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
                      {moodOptions.map((opt) => (
                        <button
                          key={opt.type}
                          type="button"
                          onClick={() => setSelectedMood(opt.type)}
                          className={cn(
                            'flex flex-col items-center justify-center p-3 rounded-2xl border text-xs font-medium transition-all duration-200',
                            selectedMood === opt.type
                              ? 'border-primary bg-primary/10 text-primary ring-2 ring-primary/20 scale-[1.03] font-semibold'
                              : 'border-white/60 bg-white/40 text-on-surface-variant hover:bg-white/80 hover:text-on-surface'
                          )}
                        >
                      <span>{opt.label}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Energy Level Slider */}
                  <div>
                    <div className="flex items-center justify-between text-xs mb-1.5 font-semibold">
                      <span className="uppercase tracking-wider text-outline">Energy Level</span>
                      <span className="text-primary font-bold">
                        {energyLevel} / 5
                      </span>
                    </div>
                    <input
                      type="range"
                      min="1"
                      max="5"
                      value={energyLevel}
                      onChange={(e) => setEnergyLevel(Number(e.target.value))}
                      className="w-full h-2 bg-white/60 rounded-lg appearance-none cursor-pointer accent-[#5A1835]"
                    />
                    <div className="flex justify-between text-[10px] text-outline mt-1 font-medium">
                      <span>Drained</span>
                      <span>Steady</span>
                      <span>Radiant</span>
                    </div>
                  </div>

                  {/* Quick Feeling Tags */}
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-outline mb-2">
                      Contextual Tags
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {availableTags.map((tag) => {
                        const isSelected = selectedTags.includes(tag);
                        return (
                          <button
                            key={tag}
                            type="button"
                            onClick={() => toggleTag(tag)}
                            className={cn(
                              'px-3 py-1 rounded-full text-xs font-medium border transition-colors',
                              isSelected
                                ? 'bg-primary text-white border-primary shadow-sm'
                                : 'bg-white/60 border-white/80 text-on-surface-variant hover:bg-white/90'
                            )}
                          >
                            {tag}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Note */}
                  <div>
                    <textarea
                      placeholder="What has been taking up space in your mind?"
                      value={note}
                      onChange={(e) => setNote(e.target.value)}
                      rows={2}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-white/60 border border-white/80 text-xs text-on-surface placeholder:text-outline/70 focus:outline-none focus:ring-2 focus:ring-primary/20 resize-none"
                    />
                  </div>

                  <div className="flex justify-end">
                    <Button type="submit" variant="primary" size="sm">
                      Record Pulse
                    </Button>
                  </div>
                </form>
              </GlassCard>

              {/* Past Logs */}
              <div className="space-y-3">
                <h3 className="text-sm font-bold text-on-surface">
                  Recent Mood History
                </h3>
                <div className="space-y-3">
                  {logs.map((log) => (
                    <GlassCard key={log.id} className="p-4 flex items-start justify-between gap-4">
                      <div className="flex items-start gap-3">
                        <div className="w-10 h-10 rounded-2xl bg-primary/10 text-primary flex items-center justify-center text-xl shrink-0">
                          {log.mood}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-semibold capitalize text-on-surface">
                              {log.mood}
                            </span>
                            <span className="text-[11px] text-outline">
                              · {log.date} at {log.time}
                            </span>
                          </div>
                          {log.note && (
                            <p className="text-xs text-on-surface-variant mt-1 italic">
                              "{log.note}"
                            </p>
                          )}
                          <div className="flex flex-wrap gap-1.5 mt-2">
                            {log.tags.map((t) => (
                              <span
                                key={t}
                                className="px-2 py-0.5 rounded-md bg-white/60 border border-white/80 text-[10px] text-on-surface-variant font-medium"
                              >
                                {t}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>

                      <div className="text-right shrink-0">
                        <span className="text-xs font-bold text-primary">
                          Energy {log.energyLevel}/5
                        </span>
                      </div>
                    </GlassCard>
                  ))}
                </div>
              </div>
            </div>

            {/* Right Col: Breathing Widget & Mindful Metrics */}
            <div className="space-y-6">
              {/* Calming Breath Widget */}
              <GlassCard className="p-6 text-center border-primary/20">
                <div className="flex items-center justify-center gap-1.5 text-xs font-bold uppercase tracking-wider text-primary mb-2">
                  <Wind className="w-4 h-4" />
                  Mindful Breath
                </div>

                <p className="text-xs text-on-surface-variant mb-6">
                  A 1-minute calming breathing session to reset your nervous system.
                </p>

                <div className="relative w-36 h-36 mx-auto flex items-center justify-center">
                  <div
                    className={cn(
                      'w-32 h-32 rounded-full border-4 border-primary/30 bg-primary/10 flex items-center justify-center transition-all duration-1000 shadow-[0_4px_25px_rgba(182,0,86,0.15)]',
                      isBreathingActive && 'animate-pulse-slow scale-110'
                    )}
                  >
                    <span className="text-sm font-bold text-primary">
                      {isBreathingActive ? 'Breathe...' : 'Rest'}
                    </span>
                  </div>
                </div>

                <div className="mt-6">
                  <Button
                    variant={isBreathingActive ? 'secondary' : 'primary'}
                    size="sm"
                    onClick={toggleBreathExercise}
                  >
                    {isBreathingActive ? 'End Session' : 'Begin Breathing'}
                  </Button>
                </div>
              </GlassCard>

              {/* Weekly Mood Insight */}
              <GlassCard className="p-5">
                <h4 className="text-xs font-bold uppercase tracking-wider text-outline mb-3">
                  Weekly Balance Insight
                </h4>
                <div className="flex items-center gap-4">
                  <ProgressRing value={80} size={64} strokeWidth={6} color="primary" />
                  <div>
                    <p className="text-xs font-bold text-on-surface">
                      80% Serene & Grounded
                    </p>
                    <p className="text-[11px] text-on-surface-variant mt-1">
                      Your emotional resilience is high. Keep protecting your morning ritual.
                    </p>
                  </div>
                </div>
              </GlassCard>
            </div>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
