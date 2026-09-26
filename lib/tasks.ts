import { createClient } from '@/lib/supabase/client';
import { Task, Priority, TaskStatus } from '@/types/task';
import { isUuid } from '@/lib/utils';

const TASKS_STORAGE_KEY_PREFIX = 'bloom_unified_tasks_';

function getTasksStorageKey(userId?: string | null): string {
  return `${TASKS_STORAGE_KEY_PREFIX}${userId || 'guest'}`;
}

/**
 * Temporary fallback tasks for development.
 * Once Supabase is fully populated, these are only used if
 * Supabase cannot be reached.
 */
export const INITIAL_UNIFIED_TASKS: Task[] = [
  {
    id: 'task-osi',
    user_id: 'guest',
    title: 'Finish OSI revision',
    description:
      'Review transport layer protocols, TCP/UDP sliding window, and socket programming.',
    completed: false,
    status: 'in_progress',
    priority: 'high',
    space_id: 'space-cn',
    due_date: new Date(
      Date.now() + 2 * 24 * 60 * 60 * 1000
    )
      .toISOString()
      .split('T')[0],
    due_time: null,
    tags: ['Networking', 'Exams'],
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'task-bda-1',
    user_id: 'guest',
    title: 'Set up Spark cluster pipeline demo',
    description:
      'Configure distributed worker nodes and test PySpark streaming aggregation.',
    completed: true,
    status: 'completed',
    priority: 'medium',
    space_id: 'space-bda',
    due_date: new Date().toISOString().split('T')[0],
    due_time: null,
    tags: ['BigData', 'Spark'],
    created_at: new Date(Date.now() - 86400000).toISOString(),
    updated_at: new Date(Date.now() - 86400000).toISOString(),
  },
  {
    id: 'task-bloom-1',
    user_id: 'guest',
    title: 'Design frosted-glass circular progress ring',
    description:
      'Craft smooth SVG progress ring with berry glow and responsive layout.',
    completed: true,
    status: 'completed',
    priority: 'urgent',
    space_id: 'space-bloom',
    due_date: null,
    due_time: null,
    tags: ['Design', 'UI'],
    created_at: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'task-personal-tea',
    user_id: 'guest',
    title: 'Morning mindfulness & tea ritual',
    description:
      '10 minutes of box breathing, Jasmine green tea, and setting quiet intentions.',
    completed: false,
    status: 'todo',
    priority: 'low',
    space_id: null,
    due_date: null,
    due_time: null,
    tags: ['Mindfulness', 'Personal'],
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
];

/* -------------------------------------------------------------------------- */
/* Local storage fallback                                                     */
/* -------------------------------------------------------------------------- */

function getStoredTasks(userId?: string | null): Task[] {
  if (typeof window === 'undefined') {
    return INITIAL_UNIFIED_TASKS;
  }

  try {
    const raw = localStorage.getItem(getTasksStorageKey(userId));

    if (!raw) {
      localStorage.setItem(
        getTasksStorageKey(userId),
        JSON.stringify(INITIAL_UNIFIED_TASKS)
      );

      return INITIAL_UNIFIED_TASKS;
    }

    return JSON.parse(raw) as Task[];
  } catch {
    return INITIAL_UNIFIED_TASKS;
  }
}

function saveStoredTasks(
  tasks: Task[],
  userId?: string | null
): void {
  if (typeof window === 'undefined') return;

  try {
    localStorage.setItem(
      getTasksStorageKey(userId),
      JSON.stringify(tasks)
    );
  } catch (error) {
    console.error('Failed to save tasks locally:', error);
  }
}

/* -------------------------------------------------------------------------- */
/* Database mapping                                                           */
/* -------------------------------------------------------------------------- */

function mapDatabaseTask(row: any): Task {
  return {
    id: row.id,
    user_id: row.user_id,

    title: row.title,
    description: row.description ?? null,

    completed: Boolean(row.completed),

    status:
      row.status ??
      (row.completed ? 'completed' : 'todo'),

    priority: (row.priority as Priority) || 'medium',

    space_id: row.space_id ?? null,

    due_date: row.due_date
      ? String(row.due_date).split('T')[0]
      : null,

    due_time: row.due_time ?? null,

    tags: Array.isArray(row.tags)
      ? row.tags
      : [],

    estimated_minutes:
      row.estimated_minutes ?? undefined,

    created_at: row.created_at,
    updated_at: row.updated_at,
    completed_at: row.completed_at ?? null,
  };
}

/* -------------------------------------------------------------------------- */
/* Fetch tasks                                                                */
/* -------------------------------------------------------------------------- */

export async function fetchTasks(
  options: {
    spaceId?: string | null;
    userId?: string | null;
  } = {}
): Promise<Task[]> {
  const {
    spaceId,
    userId,
  } = options;

  if (!userId) {
    const local = getStoredTasks(userId);
    if (!spaceId || spaceId === 'all') return local;
    if (spaceId === 'none' || spaceId === 'no-space') return local.filter((t) => !t.space_id);
    return local.filter((t) => t.space_id === spaceId);
  }

  try {
    const supabase = createClient();

    let query = supabase
      .from('tasks')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (spaceId && spaceId !== 'all') {
      if (spaceId === 'none' || spaceId === 'no-space') {
        query = query.is('space_id', null);
      } else if (isUuid(spaceId)) {
        query = query.eq('space_id', spaceId);
      } else {
        // Non-UUID template space ID like space-bda
        const local = getStoredTasks(userId);
        return local.filter((t) => t.space_id === spaceId);
      }
    }

    const { data, error } = await query;
    if (error) {
      console.warn('Supabase tasks fetch error, fallback to local storage:', error.message);
      const local = getStoredTasks(userId);
      if (!spaceId || spaceId === 'all') return local;
      if (spaceId === 'none' || spaceId === 'no-space') return local.filter((t) => !t.space_id);
      return local.filter((t) => t.space_id === spaceId);
    }

    const dbTasks = (data ?? []).map(mapDatabaseTask);
    const local = getStoredTasks(userId);
    const localTemplateTasks = local.filter((t) => t.space_id && !isUuid(t.space_id));

    const combined = [...dbTasks];
    for (const lt of localTemplateTasks) {
      if (!combined.some((t) => t.id === lt.id)) {
        if (!spaceId || spaceId === 'all' || spaceId === lt.space_id) {
          combined.push(lt);
        }
      }
    }

    return combined;
  } catch (error) {
    console.error('Task fetch failed, using local storage fallback:', error);
    const local = getStoredTasks(userId);
    if (!spaceId || spaceId === 'all') return local;
    if (spaceId === 'none' || spaceId === 'no-space') return local.filter((t) => !t.space_id);
    return local.filter((t) => t.space_id === spaceId);
  }
}

/** Load board tasks from Supabase only, without demo or localStorage fallbacks. */
export async function fetchTasksFromSupabase(userId?: string | null): Promise<Task[]> {
  if (!userId) return [];

  const supabase = createClient();
  const { data, error } = await supabase
    .from('tasks')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (error) throw new Error(`Could not load tasks: ${error.message}`);
  return (data ?? []).map(mapDatabaseTask);
}

/* -------------------------------------------------------------------------- */
/* Create task                                                                */
/* -------------------------------------------------------------------------- */

export async function createTask(
  taskData: {
    title: string;
    description?: string | null;

    completed?: boolean;
    status?: TaskStatus;

    priority?: Priority | string;

    space_id?: string | null;

    due_date?: string | null;
    due_time?: string | null;

    tags?: string[];

    estimated_minutes?: number | null;
  },

  userId?: string | null
): Promise<Task> {
  const completed =
    taskData.completed ?? false;

  const status =
    taskData.status ??
    (completed
      ? 'completed'
      : 'todo');

  const validUuidSpaceId = isUuid(taskData.space_id) ? taskData.space_id : null;

  if (userId) {
    try {
      const supabase = createClient();
      const insertPayload: any = {
        user_id: userId,
        space_id: validUuidSpaceId,
        title: taskData.title.trim(),
        description: taskData.description?.trim() || null,
        completed,
        status,
        priority: taskData.priority || 'medium',
        due_date: taskData.due_date ? new Date(taskData.due_date).toISOString() : null,
        due_time: taskData.due_time ?? null,
        tags: taskData.tags ?? [],
        estimated_minutes: taskData.estimated_minutes ?? null,
        completed_at: completed ? new Date().toISOString() : null,
      };

      const { data, error } = await supabase
        .from('tasks')
        .insert(insertPayload)
        .select()
        .single();

      if (!error && data) {
        const created = mapDatabaseTask(data);
        if (taskData.space_id && !isUuid(taskData.space_id)) {
          created.space_id = taskData.space_id;
        }
        const current = getStoredTasks(userId);
        saveStoredTasks([created, ...current], userId);
        return created;
      }
      console.warn('Failed to insert task into Supabase, falling back to local storage:', error);
    } catch (err) {
      console.warn('Supabase task insert threw, falling back to local storage:', err);
    }
  }

  // Fallback for guest, offline, or non-UUID template space fallback
  const fallbackTask: Task = {
    id: typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : `task-${Date.now()}`,
    user_id: userId || 'guest',
    title: taskData.title.trim(),
    description: taskData.description?.trim() || null,
    completed,
    status,
    priority: taskData.priority || 'medium',
    space_id: taskData.space_id ?? null,
    due_date: taskData.due_date ? String(taskData.due_date).split('T')[0] : null,
    due_time: taskData.due_time ?? null,
    tags: taskData.tags ?? [],
    estimated_minutes: taskData.estimated_minutes ?? null,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    completed_at: completed ? new Date().toISOString() : null,
  };

  const current = getStoredTasks(userId);
  saveStoredTasks([fallbackTask, ...current], userId);
  return fallbackTask;
}

/* -------------------------------------------------------------------------- */
/* Update task                                                                */
/* -------------------------------------------------------------------------- */

export async function updateTask(
  taskId: string,

  updates: Partial<Task>,

  userId?: string | null
): Promise<Task> {
  if (!userId) {
    throw new Error('You must be signed in to update a task.');
  }

  if (userId) {
    try {
      const supabase =
        createClient();

      const dbUpdates: Record<
        string,
        any
      > = {
        updated_at:
          new Date().toISOString(),
      };

      if (
        updates.title !==
        undefined
      ) {
        dbUpdates.title =
          updates.title.trim();
      }

      if (
        updates.description !==
        undefined
      ) {
        dbUpdates.description =
          updates.description
            ?.trim() || null;
      }

      if (
        updates.completed !==
        undefined
      ) {
        dbUpdates.completed =
          updates.completed;

        dbUpdates.status =
          updates.completed
            ? 'completed'
            : updates.status ??
              'todo';

        dbUpdates.completed_at =
          updates.completed
            ? new Date().toISOString()
            : null;
      }

      if (
        updates.status !==
        undefined
      ) {
        dbUpdates.status =
          updates.status;
      }

      if (
        updates.priority !==
        undefined
      ) {
        dbUpdates.priority =
          updates.priority;
      }

      if (
        updates.space_id !==
        undefined
      ) {
        dbUpdates.space_id =
          isUuid(updates.space_id) ? updates.space_id : null;
      }

      if (
        updates.due_date !==
        undefined
      ) {
        dbUpdates.due_date =
          updates.due_date ? new Date(updates.due_date).toISOString() : null;
      }

      if (
        updates.due_time !==
        undefined
      ) {
        dbUpdates.due_time =
          updates.due_time;
      }

      if (
        updates.tags !==
        undefined
      ) {
        dbUpdates.tags =
          updates.tags;
      }

      if (
        updates.estimated_minutes !==
        undefined
      ) {
        dbUpdates.estimated_minutes =
          updates.estimated_minutes;
      }

      if (isUuid(taskId)) {
        const {
          data,
          error,
        } = await supabase
          .from('tasks')
          .update(dbUpdates)
          .eq('id', taskId)
          .eq('user_id', userId)
          .select()
          .single();

        if (!error && data) {
          const updated = mapDatabaseTask(data);
          if (updates.space_id && !isUuid(updates.space_id)) {
            updated.space_id = updates.space_id;
          }
          const current = getStoredTasks(userId);
          saveStoredTasks(
            current.map((t) => (t.id === taskId ? updated : t)),
            userId
          );
          return updated;
        }
      }
    } catch (error) {
      console.warn(
        'Supabase task update failed, falling back to local storage:',
        error
      );
    }
  }

  /* --------------------------- Local fallback ------------------------- */

  const currentTasks =
    getStoredTasks(userId);

  const existingTask =
    currentTasks.find(
      (task) =>
        task.id === taskId
    );

  if (!existingTask) {
    throw new Error(
      'Task not found.'
    );
  }

  const updatedTask: Task = {
    ...existingTask,
    ...updates,

    id: taskId,

    title:
      updates.title ??
      existingTask.title,

    completed:
      updates.completed ??
      existingTask.completed,

    status:
      updates.status ??
      (
        updates.completed !==
        undefined
          ? updates.completed
            ? 'completed'
            : 'todo'
          : existingTask.status ??
            'todo'
      ),

    priority:
      updates.priority ??
      existingTask.priority,

    space_id:
      updates.space_id !==
      undefined
        ? updates.space_id
        : existingTask.space_id ??
          null,

    due_date:
      updates.due_date !==
      undefined
        ? updates.due_date
        : existingTask.due_date ??
          null,

    due_time:
      updates.due_time !==
      undefined
        ? updates.due_time
        : existingTask.due_time ??
          null,

    tags:
      updates.tags ??
      existingTask.tags ??
      [],

    estimated_minutes:
      updates.estimated_minutes ??
      existingTask.estimated_minutes,

    updated_at:
      new Date().toISOString(),

    completed_at:
      updates.completed
        ? new Date().toISOString()
        : updates.completed === false
          ? null
          : existingTask.completed_at ??
            null,
  };

  saveStoredTasks(
    currentTasks.map(
      (task) =>
        task.id === taskId
          ? updatedTask
          : task
    ),
    userId
  );

  return updatedTask;
}

/** Update a Kanban status on the existing Supabase task row without a local fallback. */
export async function updateTaskStatusInDatabase(
  taskId: string,
  status: Exclude<TaskStatus, 'archived'>,
  userId?: string | null
): Promise<Task> {
  if (!userId) throw new Error('Sign in to move this task.');
  if (!isUuid(taskId)) throw new Error('This task is not connected to a Supabase task row.');

  const completed = status === 'completed';
  const completedAt = completed ? new Date().toISOString() : null;
  const supabase = createClient();
  const { data, error } = await supabase
    .from('tasks')
    .update({
      status,
      completed,
      completed_at: completedAt,
      updated_at: new Date().toISOString(),
    })
    .eq('id', taskId)
    .eq('user_id', userId)
    .select('*')
    .single();

  if (error) throw new Error(`Could not update task status: ${error.message}`);
  if (!data) throw new Error('Task not found or access denied.');

  return mapDatabaseTask(data);
}

/* -------------------------------------------------------------------------- */
/* Delete task                                                                */
/* -------------------------------------------------------------------------- */

export async function deleteTask(
  taskId: string,
  userId?: string | null
): Promise<void> {
  if (userId) {
    try {
      const supabase =
        createClient();

      const {
        error,
      } = await supabase
        .from('tasks')
        .delete()
        .eq('id', taskId)
        .eq('user_id', userId);

      if (error) {
        console.error(
          'Failed to delete task from Supabase:',
          error
        );
      }
    } catch (error) {
      console.error(
        'Supabase task deletion failed:',
        error
      );
    }
  }

  const currentTasks =
    getStoredTasks(userId);

  saveStoredTasks(
    currentTasks.filter(
      (task) =>
        task.id !== taskId
    ),
    userId
  );
}

/* -------------------------------------------------------------------------- */
/* Remove Space from tasks                                                    */
/* -------------------------------------------------------------------------- */

/**
 * When a Space is deleted, keep its tasks
 * but remove their Space association.
 */
export async function unassignTasksFromSpace(
  spaceId: string,
  userId?: string | null
): Promise<void> {
  if (userId) {
    try {
      const supabase =
        createClient();

      const {
        error,
      } = await supabase
        .from('tasks')
        .update({
          space_id: null,
          updated_at:
            new Date().toISOString(),
        })
        .eq('space_id', spaceId)
        .eq('user_id', userId);

      if (error) {
        console.error(
          'Failed to unassign tasks:',
          error
        );
      }
    } catch (error) {
      console.error(
        'Failed to unassign tasks from Space:',
        error
      );
    }
  }

  const currentTasks =
    getStoredTasks(userId);

  const updatedTasks =
    currentTasks.map(
      (task) =>
        task.space_id ===
        spaceId
          ? {
              ...task,
              space_id: null,
              updated_at:
                new Date().toISOString(),
            }
          : task
    );

  saveStoredTasks(
    updatedTasks,
    userId
  );
}
