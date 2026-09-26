'use client';

import React, { useState } from 'react';
import { Resource, ResourceType } from '@/types/spaceItems';

export interface ResourceCardProps {
  resource: Resource;
  onUpdate: (resource: Resource) => void;
  onDelete: (resourceId: string) => void;
}

export function ResourceCard({
  resource,
  onUpdate,
  onDelete,
}: ResourceCardProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState(resource.title);
  const [editUrl, setEditUrl] = useState(resource.url || '');
  const [editDesc, setEditDesc] = useState(resource.description || '');
  const [editType, setEditType] = useState<ResourceType>(
    (resource.resource_type as ResourceType) || 'Link'
  );

  const typeConfig: Record<string, { icon: string; label: string; bg: string; text: string }> = {
    Link: { icon: 'link', label: 'Link', bg: 'bg-rose-50 border-rose-200/60', text: 'text-rose-700' },
    'PDF/reference': { icon: 'description', label: 'PDF / Ref', bg: 'bg-rose-50 border-rose-200/60', text: 'text-rose-700' },
    Other: { icon: 'folder', label: 'Resource', bg: 'bg-rose-50 border-rose-200/60', text: 'text-rose-700' },
  };

  const currentType = typeConfig[resource.resource_type] || typeConfig.Link;

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editTitle.trim()) return;
    onUpdate({
      ...resource,
      title: editTitle.trim(),
      url: editUrl.trim() || null,
      description: editDesc.trim() || null,
      resource_type: editType,
    });
    setIsEditing(false);
  };

  return (
    <div className="glass-card rounded-[24px] p-4 sm:p-5 border border-white/80 bg-white/60 hover:bg-white/75 transition-all duration-200 shadow-xs hover:shadow-sm">
      {isEditing ? (
        <form onSubmit={handleSave} className="space-y-3">
          <input
            type="text"
            required
            value={editTitle}
            onChange={(e) => setEditTitle(e.target.value)}
            className="w-full rounded-xl border border-white/90 bg-white px-3.5 py-1.5 text-[13px] font-bold text-on-surface focus:outline-none focus:ring-2 focus:ring-rose-400/20"
          />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            <select
              value={editType}
              onChange={(e) => setEditType(e.target.value as ResourceType)}
              className="rounded-lg border border-white/80 bg-white px-2 py-1 text-[11px] font-semibold"
            >
              <option value="Link">🔗 Web Link</option>
              <option value="PDF/reference">📄 PDF / Reference</option>
              <option value="Other">📁 Other</option>
            </select>
            <input
              type="url"
              placeholder="https://..."
              value={editUrl}
              onChange={(e) => setEditUrl(e.target.value)}
              className="rounded-lg border border-white/80 bg-white px-2 py-1 text-[11px]"
            />
          </div>
          <textarea
            rows={2}
            value={editDesc}
            placeholder="Description or notes..."
            onChange={(e) => setEditDesc(e.target.value)}
            className="w-full rounded-xl border border-white/90 bg-white px-3.5 py-1.5 text-[12px] text-on-surface focus:outline-none focus:ring-2 focus:ring-rose-400/20 resize-none"
          />
          <div className="flex items-center justify-end gap-2 pt-1">
            <button
              type="button"
              onClick={() => setIsEditing(false)}
              className="rounded-full px-3 py-1 text-[11px] font-semibold text-outline hover:bg-black/5"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="rounded-full bg-rose-600 px-3.5 py-1 text-[11px] font-semibold text-white shadow-xs hover:bg-rose-700"
            >
              Save
            </button>
          </div>
        </form>
      ) : (
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-start gap-3 flex-1 min-w-0">
            <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-2xl bg-rose-50 text-rose-600 border border-rose-200/50 shadow-xs">
              <span className="material-symbols-outlined text-[20px]">
                {currentType.icon}
              </span>
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <h4 className="text-[14px] sm:text-[15px] font-bold text-on-surface">
                  {resource.title}
                </h4>
                <span
                  className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.2 text-[10px] font-bold ${currentType.bg} ${currentType.text}`}
                >
                  <span>{currentType.label}</span>
                </span>
              </div>

              {resource.description && (
                <p className="mt-1 text-[12px] text-on-surface-variant line-clamp-2">
                  {resource.description}
                </p>
              )}

              {resource.url && (
                <div className="mt-2.5">
                  <a
                    href={resource.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-rose-600 hover:text-rose-700 hover:underline max-w-full truncate"
                  >
                    <span className="material-symbols-outlined text-[13px]">open_in_new</span>
                    <span className="truncate">{resource.url}</span>
                  </a>
                </div>
              )}
            </div>
          </div>

          <div className="flex items-center gap-1 flex-shrink-0">
            <button
              type="button"
              onClick={() => setIsEditing(true)}
              aria-label="Edit resource"
              className="flex h-7 w-7 items-center justify-center rounded-full text-outline hover:bg-black/5 hover:text-on-surface transition"
            >
              <span className="material-symbols-outlined text-[16px]">edit</span>
            </button>
            <button
              type="button"
              onClick={() => onDelete(resource.id)}
              aria-label="Delete resource"
              className="flex h-7 w-7 items-center justify-center rounded-full text-outline hover:bg-rose-50 hover:text-rose-600 transition"
            >
              <span className="material-symbols-outlined text-[16px]">delete</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default ResourceCard;
