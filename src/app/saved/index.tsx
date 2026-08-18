import { useRouter } from 'expo-router';
import { Heart, Pencil, RotateCcw, Shirt, Trash2 } from 'lucide-react-native';
import { useMemo, useState } from 'react';
import { Pressable, Text, View } from 'react-native';

import { OutfitPreview } from '@/components/OutfitPreview';
import { ScreenHeader } from '@/components/ScreenHeader';
import { ScreenScroll } from '@/components/ScreenScroll';
import { ConfirmDialog } from '@/components/y2k/ConfirmDialog';
import { FilterChips } from '@/components/y2k/FilterChips';
import { StickerBadge } from '@/components/y2k/StickerBadge';
import { Y2KButton } from '@/components/y2k/Y2KButton';
import { useAppData } from '@/lib/store';
import { Colors } from '@/lib/theme';
import { OCCASIONS, OCCASION_LABELS, type Outfit } from '@/lib/types';
import { formatDate } from '@/lib/utils';
import { useToast } from '@/lib/toast';

const FILTERS = [
  ...OCCASIONS.map((o) => ({ value: o, label: OCCASION_LABELS[o] })),
  { value: 'seasonal', label: 'Seasonal' },
  { value: 'favorites', label: 'Favorites' },
];

export default function SavedOutfitsScreen() {
  const router = useRouter();
  const { outfits, toggleFavoriteOutfit, deleteOutfit, markOutfitWorn } = useAppData();
  const { showToast } = useToast();
  const [filters, setFilters] = useState<string[]>([]);
  const [pendingDelete, setPendingDelete] = useState<Outfit | null>(null);

  const filtered = useMemo(() => {
    if (filters.length === 0) return outfits;
    return outfits.filter((o) => {
      return filters.some((f) => {
        if (f === 'favorites') return o.favorite;
        if (f === 'seasonal') return !!o.season;
        return o.occasion === f;
      });
    });
  }, [outfits, filters]);

  return (
    <ScreenScroll>
      <ScreenHeader title="Saved Outfits" subtitle={`${outfits.length} fit${outfits.length === 1 ? '' : 's'} in your archive`} />

      <FilterChips options={FILTERS} selected={filters} onToggle={(v) => setFilters((prev) => (prev.includes(v) ? prev.filter((x) => x !== v) : [...prev, v]))} />

      {filtered.length === 0 ? (
        <View className="items-center gap-3 py-16">
          <Shirt size={30} color={Colors.taupe} strokeWidth={1.25} />
          <Text className="font-serif text-2xl text-charcoal">
            {outfits.length === 0 ? 'No outfits yet' : 'Nothing matches those filters'}
          </Text>
          <Text className="font-body text-xs text-center" style={{ color: Colors.stone, maxWidth: 240 }}>
            {outfits.length === 0 ? 'Build your first fit and save it here.' : 'Try clearing a filter or two.'}
          </Text>
          {outfits.length === 0 && <Y2KButton label="Create an Outfit" onPress={() => router.push('/create')} />}
        </View>
      ) : (
        <View className="gap-5">
          {filtered.map((outfit) => (
            <Pressable
              key={outfit.id}
              onPress={() => router.push(`/saved/${outfit.id}`)}
              className="flex-row gap-4 p-3"
              style={{ borderWidth: 1, borderColor: Colors.hairline, backgroundColor: Colors.cream }}>
              <OutfitPreview outfit={outfit} size={96} />
              <View className="flex-1 gap-1.5">
                <View className="flex-row items-center gap-1.5">
                  <Text className="font-serif text-xl text-charcoal flex-1" numberOfLines={1}>
                    {outfit.name}
                  </Text>
                  {outfit.favorite && <Heart size={13} color={Colors.burgundy} fill={Colors.burgundy} strokeWidth={1.5} />}
                </View>
                <View className="flex-row flex-wrap gap-1.5">
                  {outfit.occasion && <StickerBadge label={OCCASION_LABELS[outfit.occasion]} small />}
                  {outfit.season && <StickerBadge label={outfit.season} small />}
                </View>
                <Text className="font-body text-[10px] uppercase" style={{ color: Colors.mushroom, letterSpacing: 0.6 }}>
                  Created {formatDate(outfit.createdAt)}
                </Text>
                <View className="flex-row gap-2 mt-1">
                  <IconAction
                    icon={Heart}
                    active={outfit.favorite}
                    onPress={async () => {
                      try {
                        await toggleFavoriteOutfit(outfit.id);
                      } catch {
                        showToast('Something went wrong', 'error');
                      }
                    }}
                  />
                  <IconAction icon={Pencil} onPress={() => router.push(`/create?editId=${outfit.id}`)} />
                  <IconAction
                    icon={RotateCcw}
                    onPress={async () => {
                      try {
                        await markOutfitWorn(outfit.id);
                        showToast('Marked as worn today');
                      } catch {
                        showToast('Something went wrong', 'error');
                      }
                    }}
                  />
                  <IconAction icon={Trash2} danger onPress={() => setPendingDelete(outfit)} />
                </View>
              </View>
            </Pressable>
          ))}
        </View>
      )}

      <ConfirmDialog
        visible={!!pendingDelete}
        title="Delete this outfit?"
        message={`"${pendingDelete?.name}" will be permanently removed from your saved outfits.`}
        confirmLabel="Delete Outfit"
        onCancel={() => setPendingDelete(null)}
        onConfirm={async () => {
          if (pendingDelete) {
            try {
              await deleteOutfit(pendingDelete.id);
              showToast('Outfit deleted');
            } catch {
              showToast('Could not delete this outfit', 'error');
            }
          }
          setPendingDelete(null);
        }}
      />
    </ScreenScroll>
  );
}

function IconAction({ icon: Icon, onPress, active, danger }: { icon: typeof Heart; onPress: () => void; active?: boolean; danger?: boolean }) {
  return (
    <Pressable
      onPress={onPress}
      hitSlop={6}
      className="h-8 w-8 items-center justify-center"
      style={{
        borderWidth: 1,
        borderColor: active || danger ? Colors.charcoal : Colors.hairline,
        backgroundColor: 'transparent',
      }}>
      <Icon
        size={13}
        color={danger ? Colors.burgundy : Colors.charcoal}
        fill={active ? Colors.burgundy : 'transparent'}
        strokeWidth={1.5}
      />
    </Pressable>
  );
}
