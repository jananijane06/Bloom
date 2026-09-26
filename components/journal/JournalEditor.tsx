'use client';

import React, { useState, useEffect } from 'react';
import { JournalEntry, MoodType } from '@/types/journal';
import { GlassCard } from '@/components/ui/GlassCard';
import { Button } from '@/components/ui/Button';
import { Save, X, Tag } from 'lucide-react';
import { generateId } from '@/lib/utils';
import { cn } from '@/lib/utils';

export interface JournalEditorProps {
  initialPrompt?: string;
  initialTag?: string;
  onSaveEntry: (entry: JournalEntry) => void;
  onCancel?: () => void;
}

export const JournalEditor: React.FC<JournalEditorProps> = ({
  initialPrompt,
  initialTag,
  onSaveEntry,
  onCancel,
}) => {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [mood, setMood] = useState<MoodType>('serene');
  const [prompt, setPrompt] = useState(initialPrompt || '');
  const [tags, setTags] = useState<string>(initialTag ? initialTag : 'Mindfulness');

  useEffect(() => {
    if (initialPrompt) setPrompt(initialPrompt);
    if (initialTag) setTags(initialTag);
  }, [initialPrompt, initialTag]);

  const moodOptions: { type: MoodType; label: string }[] = [
    { type: 'serene', label: 'Serene' },
    { type: 'radiant', label: 'Radiant' },
    { type: 'focused', label: 'Focused' },
    { type: 'reflective', label: 'Reflective' },
    { type: 'drained', label: 'Drained' },
    { type: 'anxious', label: 'Anxious' },
  ];

  const wordCount = content.trim() ? content.trim().split(/\s+/).length : 0;

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() && !content.trim()) return;

    const parsedTags = tags
      .split(',')
      .map((t) => t.trim())
      .filter(Boolean);

    const newEntry: JournalEntry = {
      id: `journal-${generateId()}`,
      title: title.trim() || 'Untitled Reflection',
      content: content.trim(),
      date: new Date().toISOString().split('T')[0],
      createdAt: new Date().toISOString(),
      mood,
      promptUsed: prompt || undefined,
      tags: parsedTags.length > 0 ? parsedTags : ['Reflection'],
    };

    onSaveEntry(newEntry);
    setTitle('');
    setContent('');
    setPrompt('');
  };

  return (
    <GlassCard className="p-6 relative border-primary/20 shadow-[0_8px_32px_rgba(182,0,86,0.06)]">
      <form onSubmit={handleSave} className="space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <div>
              <h3 className="text-base font-bold text-on-surface">
                A moment to write
              </h3>
              <p className="text-xs text-on-surface-variant">
                A quiet place for unfinished thoughts.
              </p>
            </div>
          </div>

          {onCancel && (
            <button
              type="button"
              onClick={onCancel}
              className="p-1.5 text-outline hover:text-on-surface rounded-lg hover:bg-white/60 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Selected Prompt Banner (if any) */}
        {prompt && (
          <div className="p-3 rounded-xl bg-primary/5 border border-primary/20 flex items-start justify-between gap-2">
            <div className="flex items-start text-sm text-primary">
              <span className="editorial italic font-medium">{prompt}</span>
            </div>
            <button
              type="button"
              onClick={() => setPrompt('')}
              className="text-outline hover:text-on-surface text-xs"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        {/* Mood Selector */}
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-outline mb-2">
            How are you feeling right now?
          </label>
          <div className="flex flex-wrap items-center gap-2">
            {moodOptions.map((opt) => (
              <button
                key={opt.type}
                type="button"
                onClick={() => setMood(opt.type)}
                className={cn(
                  'flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium border transition-all duration-200',
                  mood === opt.type
                    ? 'border-primary bg-primary/10 text-primary ring-2 ring-primary/20 font-semibold'
                    : 'border-white/60 bg-white/50 text-on-surface-variant hover:bg-white/80 hover:text-on-surface'
                )}
              >
                <span>{opt.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Title */}
        <div>
          <input
            type="text"
            placeholder="Give this entry a name, if you like"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="journal-writing w-full px-4 py-2.5 rounded-xl bg-white/60 border border-white/80 text-sm font-medium text-on-surface placeholder:text-outline/70 focus:outline-none focus:ring-2 focus:ring-primary/20"
          />
        </div>

        {/* Content */}
        <div className="relative">
          <textarea
            placeholder="How are you, really? Write whatever comes to mind."
            value={content}
            onChange={(e) => setContent(e.target.value)}
            rows={6}
            className="journal-writing w-full px-4 py-3 rounded-2xl bg-white/60 border border-white/80 text-sm text-on-surface placeholder:text-outline/70 focus:outline-none focus:ring-2 focus:ring-primary/20 resize-none"
          />
          <div className="absolute right-3 bottom-3 text-[10px] text-outline font-medium">
            {wordCount} words
          </div>
        </div>

        {/* Tags */}
        <div className="flex items-center gap-2">
          <Tag className="w-3.5 h-3.5 text-outline shrink-0" />
          <input
            type="text"
            placeholder="Tags: Gratitude, Habits, Mindset"
            value={tags}
            onChange={(e) => setTags(e.target.value)}
            className="flex-1 px-3 py-1.5 rounded-lg bg-white/60 border border-white/80 text-xs text-on-surface placeholder:text-outline/70 focus:outline-none focus:ring-2 focus:ring-primary/20"
          />
        </div>

        {/* Footer Save */}
        <div className="flex items-center justify-end gap-2 pt-2">
          <Button
            type="submit"
            variant="primary"
            size="sm"
            leftIcon={<Save className="w-4 h-4" />}
            disabled={!content.trim() && !title.trim()}
          >
            Save Reflection
          </Button>
        </div>
      </form>
    </GlassCard>
  );
};
