'use client';

import React, { useState, useEffect, useMemo } from 'react';
import AppShell from '@/components/layout/AppShell';
import { SpaceCard } from '@/components/spaces/SpaceCard';
import { CreateSpaceModal } from '@/components/spaces/CreateSpaceModal';
import { EditSpaceModal } from '@/components/spaces/EditSpaceModal';
import { SpaceEmptyState } from '@/components/spaces/SpaceEmptyState';
import { useAuth } from '@/components/auth/AuthProvider';
import {
  fetchUserSpaces,
  createSpace,
  updateSpace,
  deleteSpace,
  uploadSpaceImage,
} from '@/lib/spaces';
import { Space, SpaceType } from '@/types/space';

const TYPE_FILTERS: (SpaceType | 'All')[] = [
  'All',
  'University',
  'Club',
  'Work',
  'Personal',
  'Project',
  'Other',
];

export default function SpacesPage() {
  const { user } = useAuth();
  const [spaces, setSpaces] = useState<Space[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState<SpaceType | 'All'>('All');

  // Modals
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingSpace, setEditingSpace] = useState<Space | null>(null);

  // Load spaces
  useEffect(() => {
    let mounted = true;
    const loadSpaces = async () => {
      setLoading(true);
      try {
        const data = await fetchUserSpaces(user?.id);
        if (mounted) {
          setSpaces(data);
        }
      } catch (err) {
        console.error('Error loading spaces:', err);
      } finally {
        if (mounted) setLoading(false);
      }
    };

    loadSpaces();
    return () => {
      mounted = false;
    };
  }, [user?.id]);

  // Handle Create
  const handleCreateSpace = async (data: {
    name: string;
    description: string;
    icon: string;
    type: SpaceType;
    cover_color: any;
    image_file?: File;
  }) => {
    const created = await createSpace(data, user?.id);
    setSpaces((prev) => [created, ...prev]);

    if (data.image_file) {
      try {
        const withImage = await uploadSpaceImage(created, data.image_file, user?.id);
        setSpaces((prev) => prev.map((space) => (space.id === created.id ? withImage : space)));
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Image upload failed.';
        return {
          warning: `The Space was created, but its image could not be saved. ${message} You can retry from the Space page.`,
        };
      }
    }
  };

  // Handle Edit
  const handleUpdateSpace = async (id: string, updates: Partial<Space>) => {
    const updated = await updateSpace(id, updates, user?.id);
    setSpaces((prev) => prev.map((s) => (s.id === id ? { ...s, ...updated } : s)));
    setEditingSpace(null);
  };

  // Handle Delete
  const handleDeleteSpace = async (id: string) => {
    await deleteSpace(id, user?.id);
    setSpaces((prev) => prev.filter((s) => s.id !== id));
    setEditingSpace(null);
  };

  // Filtered spaces
  const filteredSpaces = useMemo(() => {
    return spaces.filter((space) => {
      const matchesSearch =
        space.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (space.description &&
          space.description.toLowerCase().includes(searchQuery.toLowerCase()));

      const matchesType =
        selectedType === 'All' || space.type === selectedType;

      return matchesSearch && matchesType;
    });
  }, [spaces, searchQuery, selectedType]);

  return (
    <AppShell>
      {/* Ambient background glows */}
      <div className="bloom-ambient">
        <div className="bloom-glow-pink" />
        <div className="bloom-glow-peach" />
        <div className="bloom-glow-lilac" />
      </div>

      <div className="sanctuary-bg relative min-h-[calc(100vh-64px)] p-4 sm:p-6 lg:p-8">
        <div className="relative z-10 mx-auto max-w-[1400px] space-y-6 sm:space-y-8">
          {/* PAGE HEADER */}
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full border border-white/80 bg-white/50 px-3 py-1 shadow-sm backdrop-blur-md mb-2">
                <span className="h-2 w-2 rounded-full bg-primary animate-pulse" />
                <span className="text-[10px] font-bold uppercase tracking-[0.16em] text-primary">
                  Core Architecture
                </span>
              </div>

              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight text-on-surface">
                Sanctuary Spaces 
              </h1>

              <p className="mt-1 text-[13px] sm:text-[14px] text-on-surface-variant max-w-xl leading-relaxed">
                Dedicated context domains for university courses, research sprints, clubs, and personal reflections.
              </p>
            </div>

            <button
              type="button"
              onClick={() => setIsCreateOpen(true)}
              className="berry-button self-start sm:self-auto inline-flex items-center gap-2 rounded-full px-5 py-3 text-[13px] font-semibold text-white shadow-md transition hover:shadow-lg active:scale-95"
            >
              <span className="material-symbols-outlined text-[19px]">add</span>
              <span>Create Space</span>
            </button>
          </div>

          {/* SEARCH & CATEGORY FILTER BAR */}
          <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 pt-2">
            {/* SEARCH */}
            <div className="relative flex-1 max-w-md">
              <span className="material-symbols-outlined absolute left-3.5 top-3 text-[19px] text-outline pointer-events-none">
                search
              </span>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search spaces by name or purpose..."
                className="w-full rounded-full border border-white/80 bg-white/60 py-2.5 pl-10 pr-4 text-[13px] text-on-surface placeholder:text-outline/70 outline-none backdrop-blur-md transition focus:border-primary/50 focus:bg-white focus:shadow-sm"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-3 text-outline hover:text-on-surface text-[13px]"
                >
                  <span className="material-symbols-outlined text-[16px]">close</span>
                </button>
              )}
            </div>

            {/* CATEGORY CHIPS */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-hide">
              {TYPE_FILTERS.map((type) => {
                const isActive = selectedType === type;
                return (
                  <button
                    key={type}
                    type="button"
                    onClick={() => setSelectedType(type)}
                    className={`whitespace-nowrap rounded-full px-3.5 py-1.5 text-[11px] font-bold uppercase tracking-wider transition ${
                      isActive
                        ? 'berry-button text-white shadow-sm'
                        : 'border border-white/80 bg-white/60 text-outline hover:bg-white hover:text-on-surface'
                    }`}
                  >
                    {type}
                  </button>
                );
              })}
            </div>
          </div>

          {/* SPACES CONTENT */}
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {[1, 2, 3].map((n) => (
                <div
                  key={n}
                  className="glass-card h-48 rounded-[30px] p-6 animate-pulse bg-white/30 border border-white/60"
                />
              ))}
            </div>
          ) : filteredSpaces.length === 0 ? (
            <SpaceEmptyState
              title={searchQuery ? 'No matching spaces' : 'No spaces yet'}
              description={
                searchQuery
                  ? `No spaces found matching "${searchQuery}". Try a different search or clear your filter.`
                  : 'Plant your first space to organize your courses, projects, tasks, and notes.'
              }
              actionLabel="Create Space"
              onAction={() => {
                if (searchQuery) {
                  setSearchQuery('');
                  setSelectedType('All');
                } else {
                  setIsCreateOpen(true);
                }
              }}
            />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 items-stretch">
              {filteredSpaces.map((space) => (
                <SpaceCard
                  key={space.id}
                  space={space}
                  onEdit={(s) => setEditingSpace(s)}
                  onDelete={(s) => setEditingSpace(s)}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* CREATE MODAL */}
      <CreateSpaceModal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        onSubmit={handleCreateSpace}
      />

      {/* EDIT MODAL */}
      <EditSpaceModal
        space={editingSpace}
        isOpen={Boolean(editingSpace)}
        onClose={() => setEditingSpace(null)}
        onSubmit={handleUpdateSpace}
        onDelete={handleDeleteSpace}
      />
    </AppShell>
  );
}
