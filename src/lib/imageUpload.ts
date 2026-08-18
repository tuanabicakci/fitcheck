import { CLOSET_PHOTOS_BUCKET, getSupabase } from './supabase';
import { generateId } from './utils';

/**
 * Resolves what should be written to a closet item's `image_path` column.
 *
 * - No photo at all → null (renders the generated swatch instead).
 * - `imageUri` is already an http(s) URL → it's an existing Supabase-hosted
 *   photo the user didn't change, so keep the existing path as-is.
 * - Otherwise `imageUri` is a fresh local picker/crop URI → upload it and
 *   return its new path.
 */
export async function resolveImagePath(
  userId: string,
  imageUri: string | undefined,
  existingPath: string | null,
  isCutout = false,
): Promise<string | null> {
  if (!imageUri) return null;
  if (imageUri.startsWith('http')) return existingPath;

  const contentType = isCutout ? 'image/png' : 'image/jpeg';
  const path = `${userId}/${generateId('photo')}.${isCutout ? 'png' : 'jpg'}`;
  const response = await fetch(imageUri);
  const arrayBuffer = await response.arrayBuffer();
  const { error } = await getSupabase()
    .storage.from(CLOSET_PHOTOS_BUCKET)
    .upload(path, arrayBuffer, { contentType, upsert: true });
  if (error) throw error;
  return path;
}
