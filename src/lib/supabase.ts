import 'react-native-url-polyfill/auto';

import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL ?? '';
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY ?? '';

export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey);

export interface ClosetItemRow {
  id: string;
  user_id: string;
  name: string;
  category: string;
  image_path: string | null;
  swatch_color: string | null;
  color: string | null;
  brand: string | null;
  style: string | null;
  notes: string | null;
  seasons: string[];
  background_simplified: boolean;
  created_at: string;
}

export interface OutfitRow {
  id: string;
  user_id: string;
  name: string;
  mode: string;
  slots: { category: string; itemId: string | null }[];
  occasion: string | null;
  season: string | null;
  mood: string | null;
  notes: string | null;
  favorite: boolean;
  wear_count: number;
  last_worn_at: string | null;
  created_at: string;
}

// NOTE: this client is intentionally untyped (no Database generic). The
// installed @supabase/supabase-js + TypeScript 6 combination has a generic
// inference bug where a typed `Database` param collapses every `.insert()` /
// `.update()` payload type to `never[]`, even though the Database type itself
// resolves correctly in isolation. Row shapes are still fully typed via
// `ClosetItemRow` / `OutfitRow` and enforced at the mapper boundary
// (see mappers.ts), so this only gives up compile-time checking on the raw
// `.from(...)` calls themselves, not on the rest of the app.
// A plain (non-generic) wrapper so `ReturnType<typeof createSupabaseClient>`
// resolves the same untyped shape this concrete call produces — going
// through `ReturnType<typeof createClient>` directly re-triggers the
// never[] inference bug described above, even with no Database argument.
function createSupabaseClient() {
  return createClient(supabaseUrl || 'https://placeholder.supabase.co', supabaseAnonKey || 'placeholder-anon-key', {
    auth: {
      storage: AsyncStorage,
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: false,
    },
  });
}

type SupabaseClient = ReturnType<typeof createSupabaseClient>;
let client: SupabaseClient | null = null;

// Expo Router's web build prerenders each route once in Node (no `window`/
// `localStorage`) before it ever reaches the browser. Constructing the
// client eagerly kicks off GoTrueClient's session bootstrap immediately,
// which crashes in that Node pass. getSupabase() defers construction to
// first call — which only ever happens client-side, inside effects/handlers
// — sidestepping that entirely without changing the app's SSR/output mode.
// Call this instead of holding a top-level `const supabase = ...`.
export function getSupabase(): SupabaseClient {
  if (!client) {
    client = createSupabaseClient();
  }
  return client;
}

export const CLOSET_PHOTOS_BUCKET = 'closet-photos';
