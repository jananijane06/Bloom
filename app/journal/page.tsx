'use client';

import React, { useState } from 'react';
import AppShell from '@/components/layout/AppShell';
import { JournalEntry } from '@/types/journal';
import { JournalEditor } from '@/components/journal/JournalEditor';
import { JournalCard } from '@/components/journal/JournalCard';
import { PromptCard } from '@/components/journal/PromptCard';
import { Button } from '@/components/ui/Button';
import { GlassCard } from '@/components/ui/GlassCard';
import { Modal } from '@/components/ui/Modal';
import { INITIAL_JOURNAL_ENTRIES, REFLECTIVE_PROMPTS } from '@/lib/constants';
import { BookOpen, Plus, Bookmark } from 'lucide-react';

export default function JournalPage() {
  const [entries, setEntries] = useState<JournalEntry[]>(INITIAL_JOURNAL_ENTRIES);
  const [selectedEntry, setSelectedEntry] = useState<JournalEntry | null>(null);
  const [filterBookmark, setFilterBookmark] = useState(false);
  const [activePrompt, setActivePrompt] = useState<string>('');
  const [activeTag, setActiveTag] = useState<string>('');
  const [isEditorOpen, setIsEditorOpen] = useState(false);

  const handleSaveEntry = (newEntry: JournalEntry) => {
    setEntries((prev) => [newEntry, ...prev]);
    setIsEditorOpen(false);
    setActivePrompt('');
    setActiveTag('');
  };

  const handleToggleBookmark = (id: string) => {
    setEntries((prev) =>
      prev.map((e) => (e.id === id ? { ...e, isBookmarked: !e.isBookmarked } : e))
    );
  };

  const handleUsePrompt = (prompt: string, tag: string) => {
    setActivePrompt(prompt);
    setActiveTag(tag);
    setIsEditorOpen(true);
  };

  const filteredEntries = filterBookmark
    ? entries.filter((e) => e.isBookmarked)
    : entries;

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
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <p className="editorial-label mb-2 text-primary">A QUIET PLACE TO REFLECT</p>
              <div className="flex items-center gap-3">
                <h1 className="text-3xl font-bold tracking-tight text-on-surface flex items-center gap-2">
                  your journal
                </h1>
                <span className="px-3 py-1 rounded-full text-xs font-semibold bg-primary/10 text-primary border border-primary/20">
                  {entries.length} reflections
                </span>
              </div>
              <p className="text-xs sm:text-sm text-on-surface-variant mt-1">
                Things worth remembering. Thoughts with room to wander.
              </p>
            </div>

            <div className="flex items-center gap-3">
              <Button
                variant={filterBookmark ? 'primary' : 'glass'}
                size="sm"
                leftIcon={<Bookmark className="w-4 h-4" />}
                onClick={() => setFilterBookmark(!filterBookmark)}
              >
                {filterBookmark ? 'Showing Bookmarks' : 'Saved'}
              </Button>

              <Button
                variant="primary"
                size="sm"
                leftIcon={<Plus className="w-4 h-4" />}
                onClick={() => setIsEditorOpen(true)}
              >
                Write Reflection
              </Button>
            </div>
          </div>

          {/* Mindful Inspiration Prompts Carousel / Grid */}
          <div>
            <h2 className="text-lg font-medium text-outline mb-3">
              A few things to begin with
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {REFLECTIVE_PROMPTS.map((p) => (
                <PromptCard
                  key={p.id}
                  id={p.id}
                  category={p.category}
                  prompt={p.prompt}
                  tag={p.tag}
                  onUsePrompt={handleUsePrompt}
                />
              ))}
            </div>
          </div>

          {/* Editor Modal */}
          <Modal
            isOpen={isEditorOpen}
            onClose={() => setIsEditorOpen(false)}
            maxWidth="lg"
          >
            <JournalEditor
              initialPrompt={activePrompt}
              initialTag={activeTag}
              onSaveEntry={handleSaveEntry}
              onCancel={() => setIsEditorOpen(false)}
            />
          </Modal>

          {/* Journal Entries Grid */}
          <div className="space-y-4">
            <h2 className="text-lg font-bold text-on-surface flex items-center gap-2">
              Things you’ve written
              {filterBookmark && (
                <span className="text-xs font-normal text-primary">(Bookmarked only)</span>
              )}
            </h2>

            {filteredEntries.length === 0 ? (
              <GlassCard className="p-12 text-center">
                <BookOpen className="w-10 h-10 mx-auto text-primary/50 mb-3" />
                <h3 className="text-sm font-semibold text-on-surface">
                  A fresh page
                </h3>
                <p className="text-xs text-on-surface-variant mt-1 max-w-sm mx-auto">
                  Choose a prompt above, or begin wherever you are.
                </p>
              </GlassCard>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {filteredEntries.map((entry) => (
                  <JournalCard
                    key={entry.id}
                    entry={entry}
                    onSelect={(ent) => setSelectedEntry(ent)}
                    onToggleBookmark={handleToggleBookmark}
                  />
                ))}
              </div>
            )}
          </div>

          {/* Read Entry Detail Modal */}
          {selectedEntry && (
            <Modal
              isOpen={Boolean(selectedEntry)}
              onClose={() => setSelectedEntry(null)}
              title={selectedEntry.title}
              description={`Logged on ${selectedEntry.date}`}
              maxWidth="lg"
            >
              <div className="space-y-4 pt-2">
                {selectedEntry.promptUsed && (
                  <div className="p-3 rounded-xl bg-primary/5 border border-primary/20 text-xs text-primary italic">
                    "{selectedEntry.promptUsed}"
                  </div>
                )}

                <div className="p-4 rounded-2xl bg-white/60 border border-white/80 text-sm leading-relaxed text-on-surface whitespace-pre-wrap">
                  {selectedEntry.content}
                </div>

                <div className="flex flex-wrap gap-2 pt-2">
                  {selectedEntry.tags.map((tag) => (
                    <span
                      key={tag}
                      className="px-2.5 py-1 text-xs rounded-full bg-primary/10 text-primary border border-primary/20 font-medium"
                    >
                      #{tag}
                    </span>
                  ))}
                </div>
              </div>
            </Modal>
          )}
        </div>
      </div>
    </AppShell>
  );
}
