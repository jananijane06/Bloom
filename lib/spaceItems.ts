import { createClient } from '@/lib/supabase/client';
import {
  SpaceTask,
  MindfulNote,
  Deadline,
  Resource,
} from '@/types/spaceItems';
import {
  fetchTasks,
  createTask,
  updateTask,
  deleteTask,
  unassignTasksFromSpace,
} from '@/lib/tasks';
import { isUuid } from '@/lib/utils';

// Unified localStorage keys
const NOTES_STORAGE_KEY_PREFIX = 'bloom_unified_notes_';
const DEADLINES_STORAGE_KEY_PREFIX = 'bloom_unified_deadlines_';
const RESOURCES_STORAGE_KEY_PREFIX = 'bloom_unified_resources_';

function getNotesKey(userId?: string | null): string {
  return `${NOTES_STORAGE_KEY_PREFIX}${userId || 'guest'}`;
}

function getDeadlinesKey(userId?: string | null): string {
  return `${DEADLINES_STORAGE_KEY_PREFIX}${userId || 'guest'}`;
}

function getResourcesKey(userId?: string | null): string {
  return `${RESOURCES_STORAGE_KEY_PREFIX}${userId || 'guest'}`;
}

// ============================================================================
// INITIAL SEED DATA
// ============================================================================

export const INITIAL_UNIFIED_NOTES: MindfulNote[] = [
  {
    id: 'note-1',
    space_id: 'space-bloom',
    title: 'Aesthetic Reflections',
    content: 'Keep interfaces calm, breathable, and grounded in gentle pinks and soft lilacs. Every card should feel light like frosted glass.',
    mood: 'calm',
    pinned: true,
    created_at: new Date(Date.now() - 3600000 * 10).toISOString(),
    updated_at: new Date(Date.now() - 3600000 * 10).toISOString(),
  },
  {
    id: 'note-2',
    space_id: 'space-bloom',
    title: 'Daily Sanctuary Intention',
    content: 'One mindful step at a time. Code with patience and intentionality. Technology in service of tranquility.',
    mood: 'grateful',
    pinned: false,
    created_at: new Date(Date.now() - 3600000 * 2).toISOString(),
    updated_at: new Date(Date.now() - 3600000 * 2).toISOString(),
  },
  {
    id: 'note-cn-1',
    space_id: 'space-cn',
    title: 'TCP Three-Way Handshake Summary',
    content: 'SYN (client seq=x) -> SYN-ACK (server seq=y, ack=x+1) -> ACK (client ack=y+1). Essential for reliable byte stream transmission.',
    mood: 'focused',
    pinned: true,
    created_at: new Date(Date.now() - 86400000).toISOString(),
    updated_at: new Date(Date.now() - 86400000).toISOString(),
  },
];

export const INITIAL_UNIFIED_DEADLINES: Deadline[] = [
  {
    id: 'dl-cn-1',
    space_id: 'space-cn',
    title: 'Computer Networks Lab Submission',
    description: 'Wireshark packet capture analysis & TCP window scaling report.',
    due_date: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(),
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'dl-bloom-1',
    space_id: 'space-bloom',
    title: 'Bloom Functional Spaces Feature Release',
    description: 'Finalize workspace interaction tests, real-time stats, and documentation.',
    due_date: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(),
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
];

export const INITIAL_UNIFIED_RESOURCES: Resource[] = [
  {
    id: 'res-cn-1',
    space_id: 'space-cn',
    title: 'Kurose & Ross - Computer Networking Course Portal',
    url: 'https://gaia.cs.umass.edu/kurose_ross/',
    description: 'Official slides, interactive Wireshark labs, and textbook errata.',
    resource_type: 'Link',
    created_at: new Date().toISOString(),
  },
  {
    id: 'res-bloom-1',
    space_id: 'space-bloom',
    title: 'Tailwind Design System Tokens',
    url: 'https://tailwindcss.com/docs',
    description: 'Design tokens, custom typography scales, and blur utilities.',
    resource_type: 'Link',
    created_at: new Date().toISOString(),
  },
  {
    id: 'res-bloom-2',
    space_id: 'space-bloom',
    title: 'Mindful UI Guidelines',
    url: 'https://bloom-sanctuary.app',
    description: 'Color palette specs, corner radiuses, and ambient lighting recipes.',
    resource_type: 'PDF/reference',
    created_at: new Date().toISOString(),
  },
];

function getStored<T>(key: string, defaultVal: T[]): T[] {
  if (typeof window === 'undefined') return defaultVal;
  try {
    const raw = localStorage.getItem(key);
    if (!raw) {
      localStorage.setItem(key, JSON.stringify(defaultVal));
      return defaultVal;
    }
    return JSON.parse(raw);
  } catch {
    return defaultVal;
  }
}

function saveStored<T>(key: string, data: T[]): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch (err) {
    console.error('Failed to save to localStorage:', err);
  }
}

// ============================================================================
// TASKS (Delegates directly to unified lib/tasks.ts single source of truth!)
// ============================================================================

export async function fetchSpaceTasks(
  spaceId: string,
  userId?: string | null
): Promise<SpaceTask[]> {
  const tasks = await fetchTasks({ spaceId, userId });
  return tasks as unknown as SpaceTask[];
}

export async function createSpaceTask(
  task: {
    space_id?: string | null;
    title: string;
    description?: string | null;
    completed?: boolean;
    priority?: string;
    due_date?: string | null;
    due_time?: string | null;
    tags?: string[];
    estimated_minutes?: number | null;
  },
  userId?: string | null
): Promise<SpaceTask> {
  const created = await createTask(task, userId);
  return created as unknown as SpaceTask;
}

export async function updateSpaceTask(
  taskId: string,
  updates: Partial<SpaceTask>,
  spaceId?: string | null,
  userId?: string | null
): Promise<SpaceTask> {
  const updated = await updateTask(taskId, updates, userId);
  return updated as unknown as SpaceTask;
}

export async function deleteSpaceTask(
  taskId: string,
  spaceId?: string | null,
  userId?: string | null
): Promise<void> {
  await deleteTask(taskId, userId);
}

// ============================================================================
// MINDFUL NOTES CRUD (Unified across Space & Global views)
// ============================================================================

export async function fetchSpaceNotes(
  spaceId?: string | null,
  userId?: string | null
): Promise<MindfulNote[]> {
  const localKey = getNotesKey(userId);

  if (userId) {
    try {
      const supabase = createClient();
      let query = supabase
        .from('mindful_notes')
        .select('*')
        .eq('user_id', userId)
        .order('pinned', { ascending: false })
        .order('created_at', { ascending: false });

      if (spaceId && spaceId !== 'all') {
        if (spaceId === 'none' || spaceId === 'no-space') {
          query = query.is('space_id', null);
        } else if (isUuid(spaceId)) {
          query = query.eq('space_id', spaceId);
        } else {
          // Template non-UUID space like space-bda
          const allNotes = getStored<MindfulNote>(localKey, INITIAL_UNIFIED_NOTES);
          return allNotes.filter((n) => n.space_id === spaceId);
        }
      }

      const { data, error } = await query;
      if (!error && data) {
        if (!spaceId || spaceId === 'all') {
          saveStored(localKey, data);
        }
        return data as MindfulNote[];
      }
    } catch {
      // Fallback
    }
  }

  const allNotes = getStored<MindfulNote>(localKey, INITIAL_UNIFIED_NOTES);
  const filtered =
    !spaceId || spaceId === 'all'
      ? allNotes
      : spaceId === 'none' || spaceId === 'no-space'
      ? allNotes.filter((n) => !n.space_id)
      : allNotes.filter((n) => n.space_id === spaceId);

  return filtered.sort((a, b) => {
    if (a.pinned === b.pinned) {
      return new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime();
    }
    return a.pinned ? -1 : 1;
  });
}

export async function createSpaceNote(
  note: {
    space_id?: string | null;
    title: string;
    content: string;
    mood?: string | null;
    pinned?: boolean;
  },
  userId?: string | null
): Promise<MindfulNote> {
  const newNote: MindfulNote = {
    id: typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : `note-${Date.now()}`,
    user_id: userId || undefined,
    space_id: note.space_id ?? null,
    title: note.title.trim(),
    content: note.content.trim(),
    mood: note.mood || 'calm',
    pinned: note.pinned ?? false,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  const localKey = getNotesKey(userId);

  if (userId) {
    try {
      const supabase = createClient();
      const { data, error } = await supabase
        .from('mindful_notes')
        .insert({
          user_id: userId,
          space_id: isUuid(newNote.space_id) ? newNote.space_id : null,
          title: newNote.title,
          content: newNote.content,
          mood: newNote.mood,
          pinned: newNote.pinned,
        })
        .select()
        .single();

      if (!error && data) {
        const saved = data as MindfulNote;
        const current = getStored<MindfulNote>(localKey, INITIAL_UNIFIED_NOTES);
        saveStored(localKey, [saved, ...current.filter((n) => n.id !== saved.id)]);
        return saved;
      }
    } catch {
      // Fallback
    }
  }

  const current = getStored<MindfulNote>(localKey, INITIAL_UNIFIED_NOTES);
  saveStored(localKey, [newNote, ...current]);
  return newNote;
}

export async function updateSpaceNote(
  noteId: string,
  updates: Partial<MindfulNote>,
  spaceId?: string | null,
  userId?: string | null
): Promise<MindfulNote> {
  const localKey = getNotesKey(userId);

  if (userId) {
    try {
      const supabase = createClient();
      const { data, error } = await supabase
        .from('mindful_notes')
        .update({
          ...updates,
          updated_at: new Date().toISOString(),
        })
        .eq('id', noteId)
        .eq('user_id', userId)
        .select()
        .single();

      if (!error && data) {
        const saved = data as MindfulNote;
        const current = getStored<MindfulNote>(localKey, INITIAL_UNIFIED_NOTES);
        saveStored(localKey, current.map((n) => (n.id === noteId ? saved : n)));
        return saved;
      }
    } catch {
      // Fallback
    }
  }

  const current = getStored<MindfulNote>(localKey, INITIAL_UNIFIED_NOTES);
  const existing = current.find((n) => n.id === noteId);
  const updatedNote: MindfulNote = {
    ...existing,
    ...updates,
    id: noteId,
    space_id: updates.space_id !== undefined ? updates.space_id : existing?.space_id ?? null,
    title: updates.title ?? existing?.title ?? 'Note',
    content: updates.content ?? existing?.content ?? '',
    pinned: updates.pinned ?? existing?.pinned ?? false,
    updated_at: new Date().toISOString(),
  };

  saveStored(localKey, current.map((n) => (n.id === noteId ? updatedNote : n)));
  return updatedNote;
}

export async function deleteSpaceNote(
  noteId: string,
  spaceId?: string | null,
  userId?: string | null
): Promise<void> {
  const localKey = getNotesKey(userId);

  if (userId) {
    try {
      const supabase = createClient();
      await supabase.from('mindful_notes').delete().eq('id', noteId).eq('user_id', userId);
    } catch {
      // Fallback
    }
  }

  const current = getStored<MindfulNote>(localKey, INITIAL_UNIFIED_NOTES);
  saveStored(localKey, current.filter((n) => n.id !== noteId));
}

// ============================================================================
// DEADLINES CRUD (Unified across Space & Global views)
// ============================================================================

export async function fetchSpaceDeadlines(
  spaceId?: string | null,
  userId?: string | null
): Promise<Deadline[]> {
  const localKey = getDeadlinesKey(userId);

  if (userId) {
    try {
      const supabase = createClient();
      let query = supabase
        .from('deadlines')
        .select('*')
        .eq('user_id', userId)
        .order('due_date', { ascending: true });

      if (spaceId && spaceId !== 'all') {
        if (spaceId === 'none' || spaceId === 'no-space') {
          query = query.is('space_id', null);
        } else if (isUuid(spaceId)) {
          query = query.eq('space_id', spaceId);
        } else {
          const list = getStored<Deadline>(localKey, INITIAL_UNIFIED_DEADLINES);
          return list.filter((d) => d.space_id === spaceId);
        }
      }

      const { data, error } = await query;
      if (!error && data) {
        if (!spaceId || spaceId === 'all') {
          saveStored(localKey, data);
        }
        return data as Deadline[];
      }
    } catch {
      // Fallback
    }
  }

  const list = getStored<Deadline>(localKey, INITIAL_UNIFIED_DEADLINES);
  const filtered =
    !spaceId || spaceId === 'all'
      ? list
      : spaceId === 'none' || spaceId === 'no-space'
      ? list.filter((d) => !d.space_id)
      : list.filter((d) => d.space_id === spaceId);

  return filtered.sort((a, b) => new Date(a.due_date).getTime() - new Date(b.due_date).getTime());
}

export async function createSpaceDeadline(
  deadline: {
    space_id?: string | null;
    title: string;
    description?: string | null;
    due_date: string;
  },
  userId?: string | null
): Promise<Deadline> {
  const newDeadline: Deadline = {
    id: typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : `dl-${Date.now()}`,
    user_id: userId || undefined,
    space_id: deadline.space_id ?? null,
    title: deadline.title.trim(),
    description: deadline.description?.trim() || null,
    due_date: deadline.due_date,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  const localKey = getDeadlinesKey(userId);

  if (userId) {
    try {
      const supabase = createClient();
      const { data, error } = await supabase
        .from('deadlines')
        .insert({
          user_id: userId,
          space_id: isUuid(newDeadline.space_id) ? newDeadline.space_id : null,
          title: newDeadline.title,
          description: newDeadline.description,
          due_date: newDeadline.due_date,
        })
        .select()
        .single();

      if (!error && data) {
        const saved = data as Deadline;
        const current = getStored<Deadline>(localKey, INITIAL_UNIFIED_DEADLINES);
        saveStored(localKey, [...current.filter((d) => d.id !== saved.id), saved]);
        return saved;
      }
    } catch {
      // Fallback
    }
  }

  const current = getStored<Deadline>(localKey, INITIAL_UNIFIED_DEADLINES);
  const updated = [...current, newDeadline];
  saveStored(localKey, updated);
  return newDeadline;
}

export async function updateSpaceDeadline(
  deadlineId: string,
  updates: Partial<Deadline>,
  spaceId?: string | null,
  userId?: string | null
): Promise<Deadline> {
  const localKey = getDeadlinesKey(userId);

  if (userId) {
    try {
      const supabase = createClient();
      const { data, error } = await supabase
        .from('deadlines')
        .update({
          ...updates,
          updated_at: new Date().toISOString(),
        })
        .eq('id', deadlineId)
        .eq('user_id', userId)
        .select()
        .single();

      if (!error && data) {
        const saved = data as Deadline;
        const current = getStored<Deadline>(localKey, INITIAL_UNIFIED_DEADLINES);
        saveStored(localKey, current.map((d) => (d.id === deadlineId ? saved : d)));
        return saved;
      }
    } catch {
      // Fallback
    }
  }

  const current = getStored<Deadline>(localKey, INITIAL_UNIFIED_DEADLINES);
  const existing = current.find((d) => d.id === deadlineId);
  const updatedDeadline: Deadline = {
    ...existing,
    ...updates,
    id: deadlineId,
    space_id: updates.space_id !== undefined ? updates.space_id : existing?.space_id ?? null,
    title: updates.title ?? existing?.title ?? 'Deadline',
    due_date: updates.due_date ?? existing?.due_date ?? new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  saveStored(localKey, current.map((d) => (d.id === deadlineId ? updatedDeadline : d)));
  return updatedDeadline;
}

export async function deleteSpaceDeadline(
  deadlineId: string,
  spaceId?: string | null,
  userId?: string | null
): Promise<void> {
  const localKey = getDeadlinesKey(userId);

  if (userId) {
    try {
      const supabase = createClient();
      await supabase.from('deadlines').delete().eq('id', deadlineId).eq('user_id', userId);
    } catch {
      // Fallback
    }
  }

  const current = getStored<Deadline>(localKey, INITIAL_UNIFIED_DEADLINES);
  saveStored(localKey, current.filter((d) => d.id !== deadlineId));
}

// ============================================================================
// RESOURCES CRUD (Unified across Space & Global views)
// ============================================================================

export async function fetchSpaceResources(
  spaceId?: string | null,
  userId?: string | null
): Promise<Resource[]> {
  const localKey = getResourcesKey(userId);

  if (userId) {
    try {
      const supabase = createClient();
      let query = supabase
        .from('resources')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (spaceId && spaceId !== 'all') {
        if (spaceId === 'none' || spaceId === 'no-space') {
          query = query.is('space_id', null);
        } else if (isUuid(spaceId)) {
          query = query.eq('space_id', spaceId);
        } else {
          const all = getStored<Resource>(localKey, INITIAL_UNIFIED_RESOURCES);
          return all.filter((r) => r.space_id === spaceId);
        }
      }

      const { data, error } = await query;
      if (!error && data) {
        if (!spaceId || spaceId === 'all') {
          saveStored(localKey, data);
        }
        return data as Resource[];
      }
    } catch {
      // Fallback
    }
  }

  const all = getStored<Resource>(localKey, INITIAL_UNIFIED_RESOURCES);
  if (!spaceId || spaceId === 'all') return all;
  if (spaceId === 'none' || spaceId === 'no-space') return all.filter((r) => !r.space_id);
  return all.filter((r) => r.space_id === spaceId);
}

export async function createSpaceResource(
  resource: {
    space_id?: string | null;
    title: string;
    url?: string | null;
    description?: string | null;
    resource_type?: string;
  },
  userId?: string | null
): Promise<Resource> {
  const newResource: Resource = {
    id: typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : `res-${Date.now()}`,
    user_id: userId || undefined,
    space_id: resource.space_id ?? null,
    title: resource.title.trim(),
    url: resource.url?.trim() || null,
    description: resource.description?.trim() || null,
    resource_type: resource.resource_type || 'Link',
    created_at: new Date().toISOString(),
  };

  const localKey = getResourcesKey(userId);

  if (userId) {
    try {
      const supabase = createClient();
      const { data, error } = await supabase
        .from('resources')
        .insert({
          user_id: userId,
          space_id: isUuid(newResource.space_id) ? newResource.space_id : null,
          title: newResource.title,
          url: newResource.url,
          description: newResource.description,
          resource_type: newResource.resource_type,
        })
        .select()
        .single();

      if (!error && data) {
        const saved = data as Resource;
        const current = getStored<Resource>(localKey, INITIAL_UNIFIED_RESOURCES);
        saveStored(localKey, [saved, ...current.filter((r) => r.id !== saved.id)]);
        return saved;
      }
    } catch {
      // Fallback
    }
  }

  const current = getStored<Resource>(localKey, INITIAL_UNIFIED_RESOURCES);
  saveStored(localKey, [newResource, ...current]);
  return newResource;
}

export async function updateSpaceResource(
  resourceId: string,
  updates: Partial<Resource>,
  spaceId?: string | null,
  userId?: string | null
): Promise<Resource> {
  const localKey = getResourcesKey(userId);

  if (userId) {
    try {
      const supabase = createClient();
      const { data, error } = await supabase
        .from('resources')
        .update(updates)
        .eq('id', resourceId)
        .eq('user_id', userId)
        .select()
        .single();

      if (!error && data) {
        const saved = data as Resource;
        const current = getStored<Resource>(localKey, INITIAL_UNIFIED_RESOURCES);
        saveStored(localKey, current.map((r) => (r.id === resourceId ? saved : r)));
        return saved;
      }
    } catch {
      // Fallback
    }
  }

  const current = getStored<Resource>(localKey, INITIAL_UNIFIED_RESOURCES);
  const existing = current.find((r) => r.id === resourceId);
  const updatedResource: Resource = {
    ...existing,
    ...updates,
    id: resourceId,
    space_id: updates.space_id !== undefined ? updates.space_id : existing?.space_id ?? null,
    title: updates.title ?? existing?.title ?? 'Resource',
    resource_type: updates.resource_type ?? existing?.resource_type ?? 'Link',
  };

  saveStored(localKey, current.map((r) => (r.id === resourceId ? updatedResource : r)));
  return updatedResource;
}

export async function deleteSpaceResource(
  resourceId: string,
  spaceId?: string | null,
  userId?: string | null
): Promise<void> {
  const localKey = getResourcesKey(userId);

  if (userId) {
    try {
      const supabase = createClient();
      await supabase.from('resources').delete().eq('id', resourceId).eq('user_id', userId);
    } catch {
      // Fallback
    }
  }

  const current = getStored<Resource>(localKey, INITIAL_UNIFIED_RESOURCES);
  saveStored(localKey, current.filter((r) => r.id !== resourceId));
}

/**
 * Handle Space deletion safely:
 * Nullify space_id on all items (tasks, notes, deadlines, resources)
 * so they remain preserved in global views without being lost.
 */
export async function unassignAllItemsFromSpace(
  spaceId: string,
  userId?: string | null
): Promise<void> {
  // 1. Unassign tasks
  await unassignTasksFromSpace(spaceId, userId);

  // 2. Unassign notes
  if (userId) {
    try {
      const supabase = createClient();
      await supabase
        .from('mindful_notes')
        .update({ space_id: null, updated_at: new Date().toISOString() })
        .eq('space_id', spaceId)
        .eq('user_id', userId);
    } catch {
      // Fallback
    }
  }
  const notesKey = getNotesKey(userId);
  const notes = getStored<MindfulNote>(notesKey, INITIAL_UNIFIED_NOTES);
  saveStored(
    notesKey,
    notes.map((n) => (n.space_id === spaceId ? { ...n, space_id: null } : n))
  );

  // 3. Unassign deadlines
  if (userId) {
    try {
      const supabase = createClient();
      await supabase
        .from('deadlines')
        .update({ space_id: null, updated_at: new Date().toISOString() })
        .eq('space_id', spaceId)
        .eq('user_id', userId);
    } catch {
      // Fallback
    }
  }
  const dlKey = getDeadlinesKey(userId);
  const deadlines = getStored<Deadline>(dlKey, INITIAL_UNIFIED_DEADLINES);
  saveStored(
    dlKey,
    deadlines.map((d) => (d.space_id === spaceId ? { ...d, space_id: null } : d))
  );

  // 4. Unassign resources
  if (userId) {
    try {
      const supabase = createClient();
      await supabase
        .from('resources')
        .update({ space_id: null })
        .eq('space_id', spaceId)
        .eq('user_id', userId);
    } catch {
      // Fallback
    }
  }
  const resKey = getResourcesKey(userId);
  const resources = getStored<Resource>(resKey, INITIAL_UNIFIED_RESOURCES);
  saveStored(
    resKey,
    resources.map((r) => (r.space_id === spaceId ? { ...r, space_id: null } : r))
  );
}
