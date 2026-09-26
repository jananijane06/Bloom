import { createClient } from '@/lib/supabase/client';
import { Space } from '@/types/space';
import { unassignAllItemsFromSpace } from '@/lib/spaceItems';

type SpaceRecord = {
  id: string;
  user_id: string;
  name: string;
  description: string | null;
  image_url: string | null;
  color: string | null;
  created_at: string;
  updated_at: string;
};

const SPACE_COLUMNS = 'id,user_id,name,description,image_url,color,created_at,updated_at';
const SPACE_IMAGE_BUCKET = 'space-images';
const MAX_SPACE_IMAGE_SIZE = 5 * 1024 * 1024;
const ALLOWED_SPACE_IMAGE_TYPES = new Set(['image/jpeg', 'image/png', 'image/webp']);

function getSpaceImagePathFromPublicUrl(
  imageUrl: string | null | undefined,
  userId: string,
  spaceId: string
): string | null {
  if (!imageUrl) return null;

  try {
    const url = new URL(imageUrl);
    const bucketPrefix = `/storage/v1/object/public/${SPACE_IMAGE_BUCKET}/`;
    if (!url.pathname.startsWith(bucketPrefix)) return null;

    const path = decodeURIComponent(url.pathname.slice(bucketPrefix.length));
    return path.startsWith(`${userId}/${spaceId}/`) ? path : null;
  } catch {
    return null;
  }
}

export function validateSpaceImageFile(file: File): void {
  const extension = file.name.split('.').pop()?.toLowerCase();
  const allowedExtensions = new Set(['jpg', 'jpeg', 'png', 'webp']);
  if (
    !ALLOWED_SPACE_IMAGE_TYPES.has(file.type.toLowerCase()) ||
    !extension ||
    !allowedExtensions.has(extension) ||
    file.size > MAX_SPACE_IMAGE_SIZE
  ) {
    throw new Error('Please choose a JPG, PNG, or WEBP image under 5 MB.');
  }
}

function requireUserId(userId?: string | null): string {
  if (!userId) throw new Error('Sign in to manage your spaces.');
  return userId;
}

function mapSpaceRecord(row: SpaceRecord, userId: string): Space {
  return enrichSpaceCounts(
    {
      id: row.id,
      user_id: row.user_id,
      name: row.name,
      description: row.description,
      image_url: row.image_url,
      color: row.color,
      // Preserve the current UI's color/type fields without expecting those
      // legacy fields to exist in the database.
      cover_color: row.color,
      type: undefined,
      created_at: row.created_at,
      updated_at: row.updated_at,
      taskCount: 0,
      noteCount: 0,
      deadlinesCount: 0,
      resourceCount: 0,
    },
    userId
  );
}

function enrichSpaceCounts(space: Space, userId: string): Space {
  if (typeof window === 'undefined') return space;
  try {
    const tasksRaw = localStorage.getItem(`bloom_unified_tasks_${userId}`);
    const notesRaw = localStorage.getItem(`bloom_unified_notes_${userId}`);
    const dlRaw = localStorage.getItem(`bloom_unified_deadlines_${userId}`);
    const resRaw = localStorage.getItem(`bloom_unified_resources_${userId}`);

    const tasks = tasksRaw ? JSON.parse(tasksRaw) : [];
    const notes = notesRaw ? JSON.parse(notesRaw) : [];
    const deadlines = dlRaw ? JSON.parse(dlRaw) : [];
    const resources = resRaw ? JSON.parse(resRaw) : [];

    return {
      ...space,
      taskCount: tasksRaw
        ? tasks.filter((task: any) => (task.space_id || task.spaceId) === space.id).length
        : (space.taskCount ?? 0),
      noteCount: notesRaw
        ? notes.filter((note: any) => note.space_id === space.id).length
        : (space.noteCount ?? 0),
      deadlinesCount: dlRaw
        ? deadlines.filter((deadline: any) => deadline.space_id === space.id).length
        : (space.deadlinesCount ?? 0),
      resourceCount: resRaw
        ? resources.filter((resource: any) => resource.space_id === space.id).length
        : (space.resourceCount ?? 0),
    };
  } catch {
    return space;
  }
}

/** Load only the signed-in user's Spaces from Supabase. */
export async function fetchUserSpaces(userId?: string | null): Promise<Space[]> {
  if (!userId) return [];

  const supabase = createClient();
  const { data, error } = await supabase
    .from('spaces')
    .select(SPACE_COLUMNS)
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return ((data ?? []) as unknown as SpaceRecord[]).map((row) => mapSpaceRecord(row, userId));
}

/** Fetch a Space by its database ID, scoped to the signed-in owner. */
export async function fetchSpaceById(
  id: string,
  userId?: string | null
): Promise<Space | null> {
  if (!userId) return null;

  const supabase = createClient();
  const { data, error } = await supabase
    .from('spaces')
    .select(SPACE_COLUMNS)
    .eq('id', id)
    .eq('user_id', userId)
    .maybeSingle();

  if (error) throw error;
  return data ? mapSpaceRecord(data as unknown as SpaceRecord, userId) : null;
}

/** Create a Space and let Postgres assign its UUID. */
export async function createSpace(
  space: {
    name: string;
    description?: string;
    icon?: string;
    cover_color?: string;
    color?: string | null;
    image_url?: string | null;
    type?: string;
  },
  userId?: string | null
): Promise<Space> {
  const ownerId = requireUserId(userId);
  const supabase = createClient();
  const { data, error } = await supabase
    .from('spaces')
    .insert({
      user_id: ownerId,
      name: space.name.trim(),
      description: space.description?.trim() || null,
      image_url: space.image_url ?? null,
      color: space.color ?? space.cover_color ?? null,
    })
    .select(SPACE_COLUMNS)
    .single();

  if (error) throw new Error(`Could not create Space row: ${error.message}`);
  return mapSpaceRecord(data as unknown as SpaceRecord, ownerId);
}

/** Update only fields represented by the existing spaces table. */
export async function updateSpace(
  id: string,
  updates: Partial<Space>,
  userId?: string | null
): Promise<Space> {
  const ownerId = requireUserId(userId);
  const values: {
    name?: string;
    description?: string | null;
    image_url?: string | null;
    updated_at: string;
  } = { updated_at: new Date().toISOString() };

  if (updates.name !== undefined) values.name = updates.name.trim();
  if (updates.description !== undefined) values.description = updates.description?.trim() || null;
  if (updates.image_url !== undefined) values.image_url = updates.image_url;

  const supabase = createClient();
  const { data, error } = await supabase
    .from('spaces')
    .update(values)
    .eq('id', id)
    .eq('user_id', ownerId)
    .select(SPACE_COLUMNS)
    .single();

  if (error) throw error;
  return mapSpaceRecord(data as unknown as SpaceRecord, ownerId);
}

/** Upload a Space cover and save its public URL on the existing Space row. */
export async function uploadSpaceImage(
  space: Space,
  file: File,
  userId?: string | null
): Promise<Space> {
  const ownerId = requireUserId(userId);
  validateSpaceImageFile(file);

  const supabase = createClient();
  const extension = file.name.split('.').pop()?.toLowerCase() || 'jpg';
  const uniqueName =
    typeof crypto !== 'undefined' && 'randomUUID' in crypto
      ? crypto.randomUUID()
      : `${Date.now()}-${Math.random().toString(36).slice(2)}`;
  const path = `${ownerId}/${space.id}/${uniqueName}.${extension}`;

  const { error: uploadError } = await supabase.storage
    .from(SPACE_IMAGE_BUCKET)
    .upload(path, file, {
      cacheControl: '3600',
      contentType: file.type,
      upsert: false,
    });

  if (uploadError) {
    throw new Error(
      `Could not upload the Space image: ${uploadError.message}. Check the space-images Storage insert policy.`
    );
  }

  const { data } = supabase.storage.from(SPACE_IMAGE_BUCKET).getPublicUrl(path);
  try {
    const savedSpace = await updateSpace(space.id, { image_url: data.publicUrl }, ownerId);
    const oldPath = getSpaceImagePathFromPublicUrl(space.image_url, ownerId, space.id);
    if (oldPath && oldPath !== path) {
      await supabase.storage.from(SPACE_IMAGE_BUCKET).remove([oldPath]).catch(() => undefined);
    }
    return savedSpace;
  } catch (error) {
    await supabase.storage.from(SPACE_IMAGE_BUCKET).remove([path]).catch(() => undefined);
    throw error;
  }
}

/** Remove a Space cover by clearing its URL on the existing Space row. */
export async function removeSpaceImage(
  space: Space,
  userId?: string | null
): Promise<Space> {
  const ownerId = requireUserId(userId);
  const updatedSpace = await updateSpace(space.id, { image_url: null }, ownerId);
  const oldPath = getSpaceImagePathFromPublicUrl(space.image_url, ownerId, space.id);

  if (oldPath) {
    const supabase = createClient();
    await supabase.storage.from(SPACE_IMAGE_BUCKET).remove([oldPath]).catch(() => undefined);
  }

  return updatedSpace;
}

/** Delete the owned database row using its existing Space ID. */
export async function deleteSpace(
  id: string,
  userId?: string | null
): Promise<void> {
  const ownerId = requireUserId(userId);

  // Keep the existing behavior that preserves associated items in global views.
  await unassignAllItemsFromSpace(id, ownerId);

  const supabase = createClient();
  const { data, error } = await supabase
    .from('spaces')
    .delete()
    .eq('id', id)
    .eq('user_id', ownerId)
    .select('id')
    .maybeSingle();

  if (error) throw error;
  if (!data) throw new Error('Space not found or access denied.');
}
