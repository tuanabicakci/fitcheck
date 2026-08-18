import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import type { ReactNode } from 'react';

import { useAuth } from './auth';
import { resolveImagePath } from './imageUpload';
import { clothingItemToInsertRow, outfitToInsertRow, rowToClothingItem, rowToOutfit } from './mappers';
import { seedSampleData } from './seed';
import { CLOSET_PHOTOS_BUCKET, getSupabase } from './supabase';
import type { ClothingCategory, ClothingItem, Outfit } from './types';

interface AppDataContextValue {
  ready: boolean;
  loadError: string | null;
  closetItems: ClothingItem[];
  outfits: Outfit[];
  addClothingItem: (item: Omit<ClothingItem, 'id' | 'createdAt'>) => Promise<ClothingItem>;
  updateClothingItem: (id: string, patch: Partial<ClothingItem>) => Promise<ClothingItem>;
  deleteClothingItem: (id: string) => Promise<void>;
  getItemsByCategory: (category: ClothingCategory) => ClothingItem[];
  getItem: (id: string | null | undefined) => ClothingItem | undefined;
  getOutfitsUsingItem: (itemId: string) => Outfit[];
  addOutfit: (outfit: Omit<Outfit, 'id' | 'createdAt' | 'favorite' | 'wearCount' | 'lastWornAt'>) => Promise<Outfit>;
  updateOutfit: (id: string, patch: Partial<Outfit>) => Promise<Outfit>;
  deleteOutfit: (id: string) => Promise<void>;
  toggleFavoriteOutfit: (id: string) => Promise<void>;
  markOutfitWorn: (id: string) => Promise<void>;
  duplicateOutfit: (id: string) => Promise<Outfit | undefined>;
  resetToSampleData: () => Promise<void>;
}

const AppDataContext = createContext<AppDataContextValue | null>(null);

export function AppDataProvider({ children }: { children: ReactNode }) {
  const { userId } = useAuth();
  const [ready, setReady] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [closetItems, setClosetItems] = useState<ClothingItem[]>([]);
  const [outfits, setOutfits] = useState<Outfit[]>([]);

  useEffect(() => {
    if (!userId) return;
    let cancelled = false;

    (async () => {
      setReady(false);
      setLoadError(null);
      const supabase = getSupabase();

      const [itemsRes, outfitsRes] = await Promise.all([
        supabase.from('closet_items').select('*').order('created_at', { ascending: false }),
        supabase.from('outfits').select('*').order('created_at', { ascending: false }),
      ]);
      if (cancelled) return;

      if (itemsRes.error || outfitsRes.error) {
        setLoadError(itemsRes.error?.message ?? outfitsRes.error?.message ?? 'Could not load your closet.');
        setReady(true);
        return;
      }

      let items = itemsRes.data.map(rowToClothingItem);
      let outfitsList = outfitsRes.data.map(rowToOutfit);

      if (items.length === 0 && outfitsList.length === 0) {
        try {
          const seeded = await seedSampleData(userId);
          items = seeded.items;
          outfitsList = seeded.outfits;
        } catch {
          // Seeding is a nice-to-have for a fresh account; an empty closet is a fine fallback.
        }
      }

      if (cancelled) return;
      setClosetItems(items);
      setOutfits(outfitsList);
      setReady(true);
    })();

    return () => {
      cancelled = true;
    };
  }, [userId]);

  const addClothingItem = useCallback(
    async (item: Omit<ClothingItem, 'id' | 'createdAt'>) => {
      if (!userId) throw new Error('Not signed in');
      const imagePath = await resolveImagePath(userId, item.imageUri, null, item.backgroundSimplified);
      const row = clothingItemToInsertRow(item, userId, imagePath);
      const { data, error } = await getSupabase().from('closet_items').insert(row).select().single();
      if (error) throw error;
      const created = rowToClothingItem(data);
      setClosetItems((prev) => [created, ...prev]);
      return created;
    },
    [userId],
  );

  const updateClothingItem = useCallback(
    async (id: string, patch: Partial<ClothingItem>) => {
      if (!userId) throw new Error('Not signed in');
      const current = closetItems.find((i) => i.id === id);
      const imagePath = await resolveImagePath(
        userId,
        patch.imageUri,
        current?.imagePath ?? null,
        patch.backgroundSimplified ?? current?.backgroundSimplified,
      );
      const { user_id: _userId, ...row } = clothingItemToInsertRow(
        {
          name: patch.name ?? current?.name ?? '',
          category: patch.category ?? current?.category ?? 'tops',
          imageUri: patch.imageUri,
          swatchColor: patch.swatchColor,
          color: patch.color,
          brand: patch.brand,
          style: patch.style,
          notes: patch.notes,
          seasons: patch.seasons,
          backgroundSimplified: patch.backgroundSimplified,
        },
        userId,
        imagePath,
      );
      const { data, error } = await getSupabase()
        .from('closet_items')
        .update(row)
        .eq('id', id)
        .eq('user_id', userId)
        .select()
        .single();
      if (error) throw error;
      const updated = rowToClothingItem(data);
      setClosetItems((prev) => prev.map((i) => (i.id === id ? updated : i)));
      return updated;
    },
    [closetItems, userId],
  );

  const deleteClothingItem = useCallback(
    async (id: string) => {
      if (!userId) throw new Error('Not signed in');
      const supabase = getSupabase();
      const current = closetItems.find((i) => i.id === id);

      const { error } = await supabase.from('closet_items').delete().eq('id', id).eq('user_id', userId);
      if (error) throw error;

      if (current?.imagePath) {
        await supabase.storage.from(CLOSET_PHOTOS_BUCKET).remove([current.imagePath]);
      }

      setClosetItems((prev) => prev.filter((it) => it.id !== id));

      const affected = outfits.filter((o) => o.slots.some((s) => s.itemId === id));
      await Promise.all(
        affected.map((o) => {
          const slots = o.slots.map((s) => (s.itemId === id ? { ...s, itemId: null } : s));
          return supabase.from('outfits').update({ slots }).eq('id', o.id).eq('user_id', userId);
        }),
      );
      if (affected.length) {
        setOutfits((prev) =>
          prev.map((o) =>
            affected.some((a) => a.id === o.id)
              ? { ...o, slots: o.slots.map((s) => (s.itemId === id ? { ...s, itemId: null } : s)) }
              : o,
          ),
        );
      }
    },
    [closetItems, outfits, userId],
  );

  const getItemsByCategory = useCallback(
    (category: ClothingCategory) => closetItems.filter((it) => it.category === category),
    [closetItems],
  );

  const getItem = useCallback(
    (id: string | null | undefined) => (id ? closetItems.find((it) => it.id === id) : undefined),
    [closetItems],
  );

  const getOutfitsUsingItem = useCallback(
    (itemId: string) => outfits.filter((o) => o.slots.some((s) => s.itemId === itemId)),
    [outfits],
  );

  const addOutfit = useCallback(
    async (outfit: Omit<Outfit, 'id' | 'createdAt' | 'favorite' | 'wearCount' | 'lastWornAt'>) => {
      if (!userId) throw new Error('Not signed in');
      const row = outfitToInsertRow(outfit, userId);
      const { data, error } = await getSupabase().from('outfits').insert(row).select().single();
      if (error) throw error;
      const created = rowToOutfit(data);
      setOutfits((prev) => [created, ...prev]);
      return created;
    },
    [userId],
  );

  const updateOutfit = useCallback(
    async (id: string, patch: Partial<Outfit>) => {
      if (!userId) throw new Error('Not signed in');
      const current = outfits.find((o) => o.id === id);
      if (!current) throw new Error('Outfit not found');
      const merged = { ...current, ...patch };
      const { data, error } = await getSupabase()
        .from('outfits')
        .update({
          name: merged.name,
          mode: merged.mode,
          slots: merged.slots,
          occasion: merged.occasion ?? null,
          season: merged.season ?? null,
          mood: merged.mood ?? null,
          notes: merged.notes ?? null,
          favorite: merged.favorite,
          wear_count: merged.wearCount,
          last_worn_at: merged.lastWornAt ?? null,
        })
        .eq('id', id)
        .eq('user_id', userId)
        .select()
        .single();
      if (error) throw error;
      const updated = rowToOutfit(data);
      setOutfits((prev) => prev.map((o) => (o.id === id ? updated : o)));
      return updated;
    },
    [outfits, userId],
  );

  const deleteOutfit = useCallback(
    async (id: string) => {
      if (!userId) throw new Error('Not signed in');
      const { error } = await getSupabase().from('outfits').delete().eq('id', id).eq('user_id', userId);
      if (error) throw error;
      setOutfits((prev) => prev.filter((o) => o.id !== id));
    },
    [userId],
  );

  const toggleFavoriteOutfit = useCallback(
    async (id: string) => {
      const current = outfits.find((o) => o.id === id);
      if (!current) return;
      await updateOutfit(id, { favorite: !current.favorite });
    },
    [outfits, updateOutfit],
  );

  const markOutfitWorn = useCallback(
    async (id: string) => {
      const current = outfits.find((o) => o.id === id);
      if (!current) return;
      await updateOutfit(id, { wearCount: current.wearCount + 1, lastWornAt: new Date().toISOString() });
    },
    [outfits, updateOutfit],
  );

  const duplicateOutfit = useCallback(
    async (id: string) => {
      const source = outfits.find((o) => o.id === id);
      if (!source) return undefined;
      return addOutfit({
        name: `${source.name} (Copy)`,
        mode: source.mode,
        slots: source.slots,
        occasion: source.occasion,
        season: source.season,
        mood: source.mood,
        notes: source.notes,
      });
    },
    [outfits, addOutfit],
  );

  const resetToSampleData = useCallback(async () => {
    if (!userId) throw new Error('Not signed in');
    const supabase = getSupabase();

    const photoPaths = closetItems.map((i) => i.imagePath).filter((p): p is string => !!p);
    await Promise.all([
      supabase.from('closet_items').delete().eq('user_id', userId),
      supabase.from('outfits').delete().eq('user_id', userId),
    ]);
    if (photoPaths.length) {
      await supabase.storage.from(CLOSET_PHOTOS_BUCKET).remove(photoPaths);
    }

    const seeded = await seedSampleData(userId);
    setClosetItems(seeded.items);
    setOutfits(seeded.outfits);
  }, [closetItems, userId]);

  const value = useMemo<AppDataContextValue>(
    () => ({
      ready,
      loadError,
      closetItems,
      outfits,
      addClothingItem,
      updateClothingItem,
      deleteClothingItem,
      getItemsByCategory,
      getItem,
      getOutfitsUsingItem,
      addOutfit,
      updateOutfit,
      deleteOutfit,
      toggleFavoriteOutfit,
      markOutfitWorn,
      duplicateOutfit,
      resetToSampleData,
    }),
    [
      ready,
      loadError,
      closetItems,
      outfits,
      addClothingItem,
      updateClothingItem,
      deleteClothingItem,
      getItemsByCategory,
      getItem,
      getOutfitsUsingItem,
      addOutfit,
      updateOutfit,
      deleteOutfit,
      toggleFavoriteOutfit,
      markOutfitWorn,
      duplicateOutfit,
      resetToSampleData,
    ],
  );

  return <AppDataContext.Provider value={value}>{children}</AppDataContext.Provider>;
}

export function useAppData() {
  const ctx = useContext(AppDataContext);
  if (!ctx) throw new Error('useAppData must be used within AppDataProvider');
  return ctx;
}
