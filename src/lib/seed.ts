import { rowToClothingItem, rowToOutfit } from './mappers';
import { SAMPLE_CLOTHING_ITEMS, SAMPLE_OUTFITS } from './sampleData';
import { getSupabase } from './supabase';
import type { ClothingItem, Outfit } from './types';

/** Inserts the built-in sample wardrobe for a brand-new (empty) account. */
export async function seedSampleData(userId: string): Promise<{ items: ClothingItem[]; outfits: Outfit[] }> {
  const supabase = getSupabase();
  const itemRows = SAMPLE_CLOTHING_ITEMS.map((item) => ({
    id: item.id,
    user_id: userId,
    name: item.name,
    category: item.category,
    image_path: null,
    swatch_color: item.swatchColor ?? null,
    color: item.color ?? null,
    brand: item.brand ?? null,
    style: item.style ?? null,
    notes: item.notes ?? null,
    seasons: item.seasons ?? [],
    background_simplified: false,
    created_at: item.createdAt,
  }));

  const { data: insertedItems, error: itemsError } = await supabase.from('closet_items').insert(itemRows).select();
  if (itemsError) throw itemsError;

  const outfitRows = SAMPLE_OUTFITS.map((o) => ({
    id: o.id,
    user_id: userId,
    name: o.name,
    mode: o.mode,
    slots: o.slots,
    occasion: o.occasion ?? null,
    season: o.season ?? null,
    mood: o.mood ?? null,
    notes: o.notes ?? null,
    favorite: o.favorite,
    wear_count: o.wearCount,
    last_worn_at: o.lastWornAt ?? null,
    created_at: o.createdAt,
  }));

  const { data: insertedOutfits, error: outfitsError } = await supabase.from('outfits').insert(outfitRows).select();
  if (outfitsError) throw outfitsError;

  return {
    items: (insertedItems ?? []).map(rowToClothingItem),
    outfits: (insertedOutfits ?? []).map(rowToOutfit),
  };
}
