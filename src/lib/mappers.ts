import { CLOSET_PHOTOS_BUCKET, getSupabase, type ClosetItemRow, type OutfitRow } from './supabase';
import type { ClothingCategory, ClothingItem, Occasion, Outfit, OutfitMode, Season } from './types';

export function rowToClothingItem(row: ClosetItemRow): ClothingItem {
  return {
    id: row.id,
    name: row.name,
    category: row.category as ClothingCategory,
    imageUri: row.image_path
      ? getSupabase().storage.from(CLOSET_PHOTOS_BUCKET).getPublicUrl(row.image_path).data.publicUrl
      : undefined,
    imagePath: row.image_path ?? undefined,
    swatchColor: row.swatch_color ?? undefined,
    color: row.color ?? undefined,
    brand: row.brand ?? undefined,
    style: row.style ?? undefined,
    notes: row.notes ?? undefined,
    seasons: row.seasons.length ? (row.seasons as Season[]) : undefined,
    backgroundSimplified: row.background_simplified,
    createdAt: row.created_at,
  };
}

export function clothingItemToInsertRow(
  item: Omit<ClothingItem, 'id' | 'createdAt'>,
  userId: string,
  imagePath: string | null,
): Omit<ClosetItemRow, 'id' | 'created_at'> {
  return {
    user_id: userId,
    name: item.name,
    category: item.category,
    image_path: imagePath,
    swatch_color: item.swatchColor ?? null,
    color: item.color ?? null,
    brand: item.brand ?? null,
    style: item.style ?? null,
    notes: item.notes ?? null,
    seasons: item.seasons ?? [],
    background_simplified: item.backgroundSimplified ?? false,
  };
}

export function rowToOutfit(row: OutfitRow): Outfit {
  return {
    id: row.id,
    name: row.name,
    mode: row.mode as OutfitMode,
    slots: row.slots.map((s) => ({ category: s.category as ClothingCategory, itemId: s.itemId })),
    occasion: (row.occasion as Occasion | null) ?? undefined,
    season: (row.season as Season | null) ?? undefined,
    mood: row.mood ?? undefined,
    notes: row.notes ?? undefined,
    favorite: row.favorite,
    createdAt: row.created_at,
    lastWornAt: row.last_worn_at,
    wearCount: row.wear_count,
  };
}

export function outfitToInsertRow(
  outfit: Omit<Outfit, 'id' | 'createdAt' | 'favorite' | 'wearCount' | 'lastWornAt'>,
  userId: string,
): Omit<OutfitRow, 'id' | 'created_at'> {
  return {
    user_id: userId,
    name: outfit.name,
    mode: outfit.mode,
    slots: outfit.slots,
    occasion: outfit.occasion ?? null,
    season: outfit.season ?? null,
    mood: outfit.mood ?? null,
    notes: outfit.notes ?? null,
    favorite: false,
    wear_count: 0,
    last_worn_at: null,
  };
}
