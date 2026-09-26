'use client';

import React, { useEffect, useState } from 'react';
import { SpaceType, SpaceColor } from '@/types/space';
import { validateSpaceImageFile } from '@/lib/spaces';

export interface CreateSpaceModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: {
    name: string;
    description: string;
    icon: string;
    type: SpaceType;
    cover_color: SpaceColor;
    image_file?: File;
  }) => Promise<{ warning?: string } | void> | { warning?: string } | void;
}


const COLOR_PRESETS: { id: SpaceColor; label: string; bg: string; border: string }[] = [
  { id: 'rose', label: 'Dusty rose', bg: 'bg-rose-400', border: 'border-rose-500' },
  { id: 'berry', label: 'Wine', bg: 'bg-[#701F43]', border: 'border-[#5A1835]' },
  { id: 'coral', label: 'Burgundy', bg: 'bg-[#B85C7A]', border: 'border-[#701F43]' },
  { id: 'peach', label: 'Blush', bg: 'bg-rose-300', border: 'border-rose-400' },
  { id: 'violet', label: 'Maroon', bg: 'bg-rose-700', border: 'border-rose-800' },
  { id: 'lilac', label: 'Pale rose', bg: 'bg-rose-200', border: 'border-rose-300' },
  { id: 'sky', label: 'Warm cream', bg: 'bg-[#FFF9F7]', border: 'border-rose-200' },
  { id: 'emerald', label: 'Lavender', bg: 'bg-[#D8C8DD]', border: 'border-rose-300' },
];

const SPACE_TYPES: SpaceType[] = [
  'University',
  'Club',
  'Work',
  'Personal',
  'Project',
  'Other',
];

export function CreateSpaceModal({ isOpen, onClose, onSubmit }: CreateSpaceModalProps) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [type, setType] = useState<SpaceType>('Personal');
  const [color, setColor] = useState<SpaceColor>('rose');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [createdWithImageError, setCreatedWithImageError] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setError(null);
      setCreatedWithImageError(false);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('Please provide a name for this space ');
      return;
    }

    setError(null);
    setLoading(true);

    try {
      if (imageFile) validateSpaceImageFile(imageFile);
      const result = await onSubmit({
        name: name.trim(),
        description: description.trim(),
        icon: name.trim().charAt(0).toUpperCase(),
        type,
        cover_color: color,
        image_file: imageFile ?? undefined,
      });
      if (result?.warning) {
        setError(result.warning);
        setCreatedWithImageError(true);
        setImageFile(null);
        return;
      }
      // Reset form
      setName('');
      setDescription('');
      setType('Personal');
      setColor('rose');
      setImageFile(null);
      onClose();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Could not create space. Please try again.');
    } finally {
      setLoading(false);
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
      <div className="glass-card relative z-10 w-full max-w-lg overflow-hidden rounded-[32px] border border-white/90 bg-white/85 p-6 sm:p-8 shadow-2xl backdrop-blur-3xl animate-in fade-in zoom-in-95 duration-200">
        {/* HEADER */}
        <div className="flex items-center justify-between pb-3 border-b border-white/60">
          <div className="flex items-center gap-2.5">
            <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-primary/10 text-[20px]">
              {name.trim().charAt(0).toUpperCase() || 'B'}
            </span>
            <div>
              <h2 className="text-[18px] font-bold text-on-surface">Plant a New Space</h2>
              <p className="text-[11px] text-outline">A dedicated sanctuary domain for your projects or studies</p>
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

        {/* FORM */}
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
              placeholder="e.g. Artificial Intelligence, Bloom, or Thesis"
              className="w-full rounded-2xl border border-white/80 bg-white/60 px-4 py-2.5 text-[13px] text-on-surface placeholder:text-outline/60 outline-none backdrop-blur-md transition focus:border-primary/50 focus:bg-white focus:shadow-sm"
            />
          </div>

          {/* DESCRIPTION */}
          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-on-surface-variant mb-1.5 ml-1">
              Description
            </label>
            <textarea
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="What intentions, lectures, or goals live here?"
              className="w-full rounded-2xl border border-white/80 bg-white/60 px-4 py-2.5 text-[13px] text-on-surface placeholder:text-outline/60 outline-none backdrop-blur-md transition focus:border-primary/50 focus:bg-white focus:shadow-sm resize-none"
            />
          </div>

          {/* OPTIONAL COVER IMAGE */}
          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-on-surface-variant mb-1.5 ml-1">
              Cover image <span className="font-normal normal-case tracking-normal">(optional)</span>
            </label>
            <div className="flex items-center gap-3 rounded-2xl border border-white/80 bg-white/50 px-3 py-2">
              <input
                type="file"
                accept=".jpg,.jpeg,.png,.webp,image/jpeg,image/png,image/webp"
                onChange={(event) => setImageFile(event.target.files?.[0] ?? null)}
                className="min-w-0 flex-1 text-[12px] text-on-surface-variant file:mr-3 file:rounded-full file:border-0 file:bg-[#5A1835]/10 file:px-3 file:py-1.5 file:text-[11px] file:font-semibold file:text-[#5A1835]"
              />
              {imageFile && (
                <button
                  type="button"
                  onClick={() => setImageFile(null)}
                  aria-label="Remove selected image"
                  className="rounded-full p-1 text-outline transition hover:bg-white hover:text-primary"
                >
                  <span className="material-symbols-outlined text-[17px]">close</span>
                </button>
              )}
            </div>
            <p className="mt-1 ml-1 text-[10px] text-outline">JPG, PNG, or WEBP · up to 5 MB</p>
          </div>

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
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-white/60">
            <button
              type="button"
              onClick={onClose}
              className="rounded-full px-5 py-2.5 text-[12px] font-semibold text-outline hover:text-on-surface hover:bg-white/60 transition"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={loading || createdWithImageError}
              className="berry-button rounded-full py-2.5 px-6 text-[12px] font-semibold text-white shadow-md transition hover:shadow-lg disabled:opacity-60 flex items-center gap-2"
            >
              {loading ? (
                <>
                  <span className="h-3.5 w-3.5 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                  <span>Planting...</span>
                </>
              ) : (
                <>
                  <span>{createdWithImageError ? 'Space created' : 'Create Space'}</span>
                  <span></span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default CreateSpaceModal;
