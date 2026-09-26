'use client';

import React, { useState, useEffect } from 'react';
import { Space, SpaceType, SpaceColor } from '@/types/space';

export interface EditSpaceModalProps {
  space: Space | null;
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (id: string, updates: Partial<Space>) => Promise<void> | void;
  onDelete?: (id: string) => Promise<void> | void;
}


const COLOR_PRESETS: { id: SpaceColor; label: string; bg: string }[] = [
  { id: 'rose', label: 'Dusty rose', bg: 'bg-rose-400' },
  { id: 'berry', label: 'Wine', bg: 'bg-[#701F43]' },
  { id: 'coral', label: 'Burgundy', bg: 'bg-[#B85C7A]' },
  { id: 'peach', label: 'Blush', bg: 'bg-rose-300' },
  { id: 'violet', label: 'Maroon', bg: 'bg-rose-700' },
  { id: 'lilac', label: 'Pale rose', bg: 'bg-rose-200' },
  { id: 'sky', label: 'Warm cream', bg: 'bg-[#FFF9F7]' },
  { id: 'emerald', label: 'Lavender', bg: 'bg-[#D8C8DD]' },
];

const SPACE_TYPES: SpaceType[] = [
  'University',
  'Club',
  'Work',
  'Personal',
  'Project',
  'Other',
];

export function EditSpaceModal({
  space,
  isOpen,
  onClose,
  onSubmit,
  onDelete,
}: EditSpaceModalProps) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [type, setType] = useState<SpaceType>('Personal');
  const [color, setColor] = useState<SpaceColor>('rose');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Delete confirmation step state
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const hasFormattedDescription = /<\/?(?:p|h[1-6]|ul|ol|li|table|blockquote|pre)(?:\s|>)/i.test(space?.description || '');

  useEffect(() => {
    if (space) {
      setName(space.name || '');
      setDescription(space.description || '');
      setType((space.type as SpaceType) || 'Personal');
      setColor((space.cover_color as SpaceColor) || 'rose');
      setConfirmDelete(false);
      setError(null);
    }
  }, [space, isOpen]);

  if (!isOpen || !space) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('Please provide a name for this space ');
      return;
    }

    setError(null);
    setLoading(true);

    try {
      await onSubmit(space.id, {
        name: name.trim(),
        description: description.trim(),
        type,
        cover_color: color,
      });
      onClose();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Could not update space. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!onDelete) return;
    setDeleting(true);
    try {
      await onDelete(space.id);
      onClose();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Could not delete space. Please try again.');
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-[#351A26]/40 backdrop-blur-md transition-opacity"
        onClick={onClose}
      />

      {/* Modal Dialog */}
      <div className="glass-card relative z-10 w-full max-w-lg overflow-hidden rounded-[32px] border border-white/90 bg-white/85 p-6 sm:p-8 shadow-2xl backdrop-blur-3xl animate-in fade-in zoom-in-95 duration-200 max-h-[90vh] overflow-y-auto scrollbar-hide">
        {/* HEADER */}
        <div className="flex items-center justify-between pb-3 border-b border-white/60">
          <div className="flex items-center gap-2.5">
            <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-primary/10 text-[20px]">
              {name.trim().charAt(0).toUpperCase() || 'B'}
            </span>
            <div>
              <h2 className="text-[18px] font-bold text-on-surface">Edit Space</h2>
              <p className="text-[11px] text-outline">Update details or aesthetics of {space.name}</p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-full text-outline hover:bg-white hover:text-on-surface transition"
          >
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>
        </div>

        {/* ERROR */}
        {error && (
          <div className="mt-4 flex items-center gap-2 rounded-2xl border border-[#B85C7A]/30 bg-[#B85C7A]/10 p-3 text-[12px] font-medium text-[#B85C7A]">
            <span className="material-symbols-outlined text-[16px]">error</span>
            <span>{error}</span>
          </div>
        )}

        {/* DELETE CONFIRMATION BANNER */}
        {confirmDelete ? (
          <div className="mt-5 rounded-2xl border border-[#B85C7A]/40 bg-[#B85C7A]/10 p-4 space-y-3 animate-in fade-in">
            <div className="flex items-start gap-2.5 text-[#B85C7A]">
              <span className="material-symbols-outlined text-[20px] shrink-0 mt-0.5">warning</span>
              <div>
                <h4 className="font-bold text-[13px]">Delete this space?</h4>
                <p className="text-[12px] opacity-90 mt-0.5 leading-snug">
                  Are you sure you want to delete <strong className="font-semibold text-on-surface">{space.name}</strong>?
                  All associated notes, milestones, and tasks will be permanently removed.
                </p>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2.5 pt-1">
              <button
                type="button"
                onClick={() => setConfirmDelete(false)}
                className="rounded-full px-4 py-1.5 text-[12px] font-semibold text-outline hover:bg-white transition"
              >
                Keep Space
              </button>
              <button
                type="button"
                onClick={handleDelete}
                disabled={deleting}
                className="rounded-full bg-[#B85C7A] hover:bg-[#701F43] text-white px-4 py-1.5 text-[12px] font-semibold shadow-sm transition disabled:opacity-60 flex items-center gap-1.5"
              >
                {deleting && <span className="h-3 w-3 border-2 border-white/40 border-t-white rounded-full animate-spin" />}
                <span>Delete Permanently</span>
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="mt-5 space-y-4">
            {/* NAME */}
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-on-surface-variant mb-1.5 ml-1">
                Space Name *
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Artificial Intelligence"
                className="w-full rounded-2xl border border-white/80 bg-white/60 px-4 py-2.5 text-[13px] text-on-surface placeholder:text-outline/60 outline-none backdrop-blur-md transition focus:border-primary/50 focus:bg-white focus:shadow-sm"
              />
            </div>

            {/* Keep legacy descriptions editable here; formatted course information has its own editor. */}
            {hasFormattedDescription ? (
              <p className="rounded-xl border border-white/80 bg-white/45 px-3.5 py-3 text-xs leading-relaxed text-on-surface-variant">
                Course information keeps its formatting. Edit it from the Course Information section.
              </p>
            ) : (
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-on-surface-variant mb-1.5 ml-1">Description</label>
                <textarea
                  rows={2}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="What focus goals live here?"
                  className="w-full rounded-2xl border border-white/80 bg-white/60 px-4 py-2.5 text-[13px] text-on-surface placeholder:text-outline/60 outline-none backdrop-blur-md transition focus:border-primary/50 focus:bg-white focus:shadow-sm resize-none"
                />
              </div>
            )}

            {/* TYPE */}
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-on-surface-variant mb-1.5 ml-1">
                Category Type
              </label>
              <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
                {SPACE_TYPES.map((t) => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => setType(t)}
                    className={`rounded-xl py-2 px-2 text-[11px] font-semibold border transition text-center ${
                      type === t
                        ? 'berry-button text-white border-transparent shadow-sm'
                        : 'border-white/80 bg-white/60 text-on-surface-variant hover:bg-white'
                    }`}
                  >
                    {t}
                  </button>
                ))}
              </div>
            </div>


            {/* COLOR ACCENT */}
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-on-surface-variant mb-1.5 ml-1">
                Accent Color
              </label>
              <div className="flex flex-wrap gap-2.5 p-2 rounded-2xl bg-white/40 border border-white/70">
                {COLOR_PRESETS.map((col) => (
                  <button
                    key={col.id}
                    type="button"
                    onClick={() => setColor(col.id)}
                    title={col.label}
                    className={`h-7 w-7 rounded-full transition-transform ${col.bg} ${
                      color === col.id
                        ? 'ring-2 ring-offset-2 ring-primary scale-110 shadow-sm'
                        : 'hover:scale-105 opacity-80 hover:opacity-100'
                    }`}
                  />
                ))}
              </div>
            </div>

            {/* FOOTER ACTIONS */}
            <div className="flex items-center justify-between pt-4 border-t border-white/60">
              {onDelete ? (
                <button
                  type="button"
                  onClick={() => setConfirmDelete(true)}
                  className="rounded-full px-3 py-2 text-[12px] font-semibold text-[#B85C7A] hover:bg-[#B85C7A]/10 transition flex items-center gap-1.5"
                >
                  <span className="material-symbols-outlined text-[16px]">delete</span>
                  <span>Delete Space</span>
                </button>
              ) : <div />}

              <div className="flex items-center gap-2.5">
                <button
                  type="button"
                  onClick={onClose}
                  className="rounded-full px-5 py-2.5 text-[12px] font-semibold text-outline hover:text-on-surface hover:bg-white/60 transition"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={loading}
                  className="berry-button rounded-full py-2.5 px-6 text-[12px] font-semibold text-white shadow-md transition hover:shadow-lg disabled:opacity-60 flex items-center gap-2"
                >
                  {loading ? (
                    <>
                      <span className="h-3.5 w-3.5 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                      <span>Saving...</span>
                    </>
                  ) : (
                    <>
                      <span>Save Changes</span>
                      <span></span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}

export default EditSpaceModal;
