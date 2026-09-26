'use client';

import React, { useRef, useState } from 'react';
import Link from 'next/link';
import { Space } from '@/types/space';

export interface SpaceHeaderProps {
  space: Space;
  onEdit?: () => void;
  onAddItem?: () => void;
  onAddTask?: () => void;
  onChangeImage?: (file: File) => Promise<void>;
  onRemoveImage?: () => Promise<void>;
  hideDescription?: boolean;
}

export function SpaceHeader({
  space,
  onEdit,
  onAddItem,
  onAddTask,
  onChangeImage,
  onRemoveImage,
  hideDescription = false,
}: SpaceHeaderProps) {
  const handleAdd = onAddItem || onAddTask;
  const imageInputRef = useRef<HTMLInputElement>(null);
  const [imageError, setImageError] = useState<string | null>(null);
  const [imageBusy, setImageBusy] = useState(false);

  const handleImageSelection = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (!file || !onChangeImage) return;

    setImageError(null);
    setImageBusy(true);
    try {
      await onChangeImage(file);
    } catch (error) {
      setImageError(error instanceof Error ? error.message : 'Could not update the Space image.');
    } finally {
      setImageBusy(false);
    }
  };

  const handleImageRemoval = async () => {
    if (!onRemoveImage) return;
    setImageError(null);
    setImageBusy(true);
    try {
      await onRemoveImage();
    } catch (error) {
      setImageError(error instanceof Error ? error.message : 'Could not remove the Space image.');
    } finally {
      setImageBusy(false);
    }
  };

  return (
    <div className="space-y-4">
      {/* NAVIGATION BREADCRUMB */}
      <div className="flex items-center justify-between">
        <Link
          href="/spaces"
          className="inline-flex items-center gap-1.5 text-[12px] font-semibold text-outline hover:text-primary transition-colors group"
        >
          <span className="material-symbols-outlined text-[17px] transition-transform group-hover:-translate-x-0.5">
            arrow_back
          </span>
          <span>Back to All Spaces</span>
        </Link>

        {space.type && (
          <span className="glass-pill px-3 py-1 rounded-full text-[11px] font-bold text-primary border border-white/80">
            • {space.type} Domain
          </span>
        )}
      </div>

      {/* HERO BANNER CARD */}
      <div className="glass-card relative overflow-hidden rounded-[32px] p-6 sm:p-8 border border-white/85 shadow-md backdrop-blur-2xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          {/* ICON & TITLE & DESCRIPTION */}
          <div className="flex items-start sm:items-center gap-4 sm:gap-5">
            <div className="group/cover relative h-16 w-16 sm:h-20 sm:w-20 flex-shrink-0 overflow-hidden rounded-3xl bg-white/80 border border-white text-3xl sm:text-4xl shadow-md ring-4 ring-black/5">
              {space.image_url ? (
                <img
                  src={space.image_url}
                  alt={`${space.name} cover`}
                  className="absolute inset-0 h-full w-full object-cover"
                />
              ) : (
                <span className="flex h-full w-full items-center justify-center">
                  {space.name.charAt(0).toUpperCase()}
                </span>
              )}

              {onChangeImage && (
                <>
                  <input
                    ref={imageInputRef}
                    type="file"
                    accept=".jpg,.jpeg,.png,.webp,image/jpeg,image/png,image/webp"
                    className="hidden"
                    onChange={handleImageSelection}
                  />
                  <div className="absolute inset-x-0 bottom-0 flex justify-center gap-1 bg-[#351A26]/65 p-1 opacity-100 transition-opacity md:opacity-0 group-hover/cover:opacity-100 focus-within:opacity-100">
                    <button
                      type="button"
                      onClick={() => imageInputRef.current?.click()}
                      disabled={imageBusy}
                      title={space.image_url ? 'Change image' : 'Add image'}
                      aria-label={space.image_url ? 'Change image' : 'Add image'}
                      className="flex h-7 w-7 items-center justify-center rounded-full text-white transition hover:bg-white/20 disabled:opacity-60"
                    >
                      <span className="material-symbols-outlined text-[17px]">
                        {imageBusy ? 'progress_activity' : 'photo_camera'}
                      </span>
                    </button>
                    {space.image_url && onRemoveImage && (
                      <button
                        type="button"
                        onClick={handleImageRemoval}
                        disabled={imageBusy}
                        title="Remove image"
                        aria-label="Remove image"
                        className="flex h-7 w-7 items-center justify-center rounded-full text-white transition hover:bg-white/20 disabled:opacity-60"
                      >
                        <span className="material-symbols-outlined text-[16px]">close</span>
                      </button>
                    )}
                  </div>
                </>
              )}
            </div>

            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2.5">
                <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-on-surface">
                  {space.name}
                </h1>
                <span className="text-primary text-[18px]"></span>
              </div>

              {!hideDescription && <p className="mt-1.5 text-[13px] sm:text-[14px] text-on-surface-variant max-w-2xl leading-relaxed">
                {space.description || 'A dedicated mindful domain for your tasks, reflections, and milestones.'}
              </p>}
            </div>
          </div>

          {/* ACTION BUTTONS */}
          <div className="flex items-center gap-2.5 self-start md:self-center">
            {handleAdd && (
              <button
                type="button"
                onClick={handleAdd}
                className="berry-button inline-flex items-center gap-1.5 rounded-full px-4 py-2.5 text-[12px] font-semibold text-white shadow-sm transition hover:shadow-md active:scale-95"
              >
                <span className="material-symbols-outlined text-[18px]">add</span>
                <span>Add Item</span>
              </button>
            )}

            {onEdit && (
              <button
                type="button"
                onClick={onEdit}
                aria-label="Edit Space"
                className="flex items-center gap-1.5 rounded-full border border-white/80 bg-white/60 px-4 py-2.5 text-[12px] font-semibold text-on-surface transition hover:bg-white hover:text-primary shadow-sm"
              >
                <span className="material-symbols-outlined text-[17px]">tune</span>
                <span>Settings</span>
              </button>
            )}
          </div>
        </div>
        {imageError && (
          <p role="alert" className="mt-3 text-[12px] font-medium text-[#8E3159]">
            {imageError}
          </p>
        )}
      </div>
    </div>
  );
}

export default SpaceHeader;
