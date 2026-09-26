'use client';

import React from 'react';
import { Resource } from '@/types/spaceItems';
import { ResourceCard } from './ResourceCard';
import { SpaceEmptyState } from './SpaceEmptyState';

export interface ResourceListProps {
  resources: Resource[];
  onUpdate: (resource: Resource) => void;
  onDelete: (resourceId: string) => void;
  onAddResource: () => void;
}

export function ResourceList({
  resources,
  onUpdate,
  onDelete,
  onAddResource,
}: ResourceListProps) {
  if (resources.length === 0) {
    return (
      <SpaceEmptyState
        icon="folder_open"
        title="Keep your useful things close"
        description="Save your first resource, course syllabus, textbook link, or references."
        actionLabel="Save Resource"
        onAction={onAddResource}
      />
    );
  }

  return (
    <div className="space-y-4">
      {/* HEADER & NEW RESOURCE BUTTON */}
      <div className="flex items-center justify-between">
        <p className="text-[12px] text-outline font-semibold">
          {resources.length} {resources.length === 1 ? 'Resource' : 'Resources'} preserved
        </p>

        <button
          type="button"
          onClick={onAddResource}
          className="rounded-full bg-rose-600 px-4 py-1.5 text-[11px] font-bold text-white shadow-xs transition hover:bg-rose-700"
        >
          <span className="material-symbols-outlined text-[16px] align-middle mr-1">add</span>
          <span>New Resource</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {resources.map((resource) => (
          <ResourceCard
            key={resource.id}
            resource={resource}
            onUpdate={onUpdate}
            onDelete={onDelete}
          />
        ))}
      </div>
    </div>
  );
}

export default ResourceList;
