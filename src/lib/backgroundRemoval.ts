import { File, Paths } from 'expo-file-system';

const REMOVE_BG_API_KEY = process.env.EXPO_PUBLIC_REMOVEBG_API_KEY ?? '';

export const isBackgroundRemovalConfigured = Boolean(REMOVE_BG_API_KEY);

/**
 * Sends a photo to remove.bg and saves the transparent-background result to
 * a local cache file, returning its `file://` uri.
 */
export async function removeBackground(imageUri: string): Promise<string> {
  if (!REMOVE_BG_API_KEY) {
    throw new Error('Background cutout isn’t set up — add EXPO_PUBLIC_REMOVEBG_API_KEY to .env');
  }

  const form = new FormData();
  form.append('image_file', { uri: imageUri, name: 'photo.jpg', type: 'image/jpeg' } as unknown as Blob);
  form.append('size', 'auto');

  const response = await fetch('https://api.remove.bg/v1.0/removebg', {
    method: 'POST',
    headers: { 'X-Api-Key': REMOVE_BG_API_KEY },
    body: form,
  });

  if (!response.ok) {
    if (response.status === 402) throw new Error('Free cutout quota used up for this month');
    if (response.status === 403) throw new Error('Cutout API key was rejected');
    throw new Error(`Cutout failed (${response.status})`);
  }

  const bytes = new Uint8Array(await response.arrayBuffer());
  const file = new File(Paths.cache, `cutout-${Date.now()}.png`);
  file.write(bytes);
  return file.uri;
}
