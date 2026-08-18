import { useLocalSearchParams, useRouter } from 'expo-router';
import { Copy, Heart, Pencil, RotateCcw, Share2, Trash2 } from 'lucide-react-native';
import { useState } from 'react';
import { Pressable, Share, Text, View } from 'react-native';

import { ClothingImage } from '@/components/ClothingImage';
import { OutfitPreview } from '@/components/OutfitPreview';
import { ScreenHeader } from '@/components/ScreenHeader';
import { ScreenScroll } from '@/components/ScreenScroll';
import { ConfirmDialog } from '@/components/y2k/ConfirmDialog';
import { StickerBadge } from '@/components/y2k/StickerBadge';
import { Y2KButton } from '@/components/y2k/Y2KButton';
import { useAppData } from '@/lib/store';
import { Colors } from '@/lib/theme';
import { CATEGORY_LABELS, OCCASION_LABELS, SEASON_LABELS } from '@/lib/types';
import { formatDate, formatRelative } from '@/lib/utils';
import { useToast } from '@/lib/toast';

export default function OutfitDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { outfits, getItem, toggleFavoriteOutfit, markOutfitWorn, duplicateOutfit, deleteOutfit } = useAppData();
  const { showToast } = useToast();
  const [confirmOpen, setConfirmOpen] = useState(false);

  const outfit = outfits.find((o) => o.id === id);

  if (!outfit) {
    return (
      <ScreenScroll>
        <ScreenHeader title="Outfit not found" showBack />
      </ScreenScroll>
    );
  }

  const items = outfit.slots.map((s) => ({ category: s.category, item: getItem(s.itemId) })).filter((s) => s.item);

  async function handleShare() {
    try {
      await Share.share({ message: `Take a look at my "${outfit!.name}" fit on Fit Check.` });
    } catch {
      showToast('Sharing preview not available here', 'info');
    }
  }

  async function handleDuplicate() {
    try {
      const copy = await duplicateOutfit(outfit!.id);
      if (copy) {
        showToast('Outfit duplicated');
        router.replace(`/saved/${copy.id}`);
      }
    } catch {
      showToast('Could not duplicate this outfit', 'error');
    }
  }

  async function handleToggleFavorite() {
    try {
      await toggleFavoriteOutfit(outfit!.id);
    } catch {
      showToast('Something went wrong', 'error');
    }
  }

  async function handleMarkWorn() {
    try {
      await markOutfitWorn(outfit!.id);
      showToast('Marked as worn today');
    } catch {
      showToast('Something went wrong', 'error');
    }
  }

  async function handleDelete() {
    try {
      await deleteOutfit(outfit!.id);
      setConfirmOpen(false);
      showToast('Outfit deleted');
      router.replace('/saved');
    } catch {
      showToast('Could not delete this outfit', 'error');
      setConfirmOpen(false);
    }
  }

  return (
    <ScreenScroll>
      <ScreenHeader title={outfit.name} showBack />

      <View className="items-center gap-4">
        <View style={{ position: 'relative' }}>
          <OutfitPreview outfit={outfit} size={220} />
          <Pressable
            onPress={handleToggleFavorite}
            className="h-9 w-9 items-center justify-center"
            style={{ position: 'absolute', top: -1, right: -1, backgroundColor: Colors.cream, borderWidth: 1, borderColor: Colors.hairline }}>
            <Heart size={15} color={Colors.burgundy} fill={outfit.favorite ? Colors.burgundy : 'transparent'} strokeWidth={1.5} />
          </Pressable>
        </View>

        <View className="flex-row flex-wrap justify-center gap-2">
          {outfit.occasion && <StickerBadge label={OCCASION_LABELS[outfit.occasion]} />}
          {outfit.season && <StickerBadge label={SEASON_LABELS[outfit.season]} />}
          {outfit.mood && <StickerBadge label={outfit.mood} />}
        </View>
      </View>

      {outfit.notes ? (
        <View className="p-4" style={{ borderWidth: 1, borderColor: Colors.hairline, backgroundColor: Colors.ivory }}>
          <Text className="font-serif-italic text-base" style={{ color: Colors.espresso }}>
            {outfit.notes}
          </Text>
        </View>
      ) : null}

      <View className="flex-row justify-between px-4 py-4" style={{ borderTopWidth: 1, borderBottomWidth: 1, borderColor: Colors.hairline }}>
        <Stat label="Created" value={formatDate(outfit.createdAt)} />
        <Stat label="Last Worn" value={formatRelative(outfit.lastWornAt)} />
        <Stat label="Times Worn" value={String(outfit.wearCount)} />
      </View>

      <View className="gap-3">
        <Text className="font-body-medium text-[10px] uppercase" style={{ color: Colors.stone, letterSpacing: 1.4 }}>
          Pieces in this fit
        </Text>
        <View className="gap-2">
          {items.map(({ category, item }) => (
            <Pressable
              key={category}
              onPress={() => item && router.push(`/closet/${item.id}`)}
              className="flex-row items-center gap-3 p-2"
              style={{ borderWidth: 1, borderColor: Colors.hairline, backgroundColor: Colors.cream }}>
              <View style={{ width: 54, height: 54, overflow: 'hidden' }}>{item && <ClothingImage item={item} radius={0} />}</View>
              <View className="flex-1">
                <Text className="font-serif text-lg text-charcoal" numberOfLines={1}>
                  {item?.name}
                </Text>
                <Text className="font-body text-[10px] uppercase" style={{ color: Colors.stone, letterSpacing: 0.6 }}>
                  {CATEGORY_LABELS[category]}
                </Text>
              </View>
            </Pressable>
          ))}
        </View>
      </View>

      <View className="flex-row flex-wrap gap-2.5">
        <Y2KButton label="Edit" icon={Pencil} variant="outline" onPress={() => router.push(`/create?editId=${outfit.id}`)} />
        <Y2KButton label="Duplicate" icon={Copy} variant="outline" onPress={handleDuplicate} />
        <Y2KButton label="Mark as Worn" icon={RotateCcw} variant="primary" onPress={handleMarkWorn} />
        <Y2KButton label="Share" icon={Share2} variant="outline" onPress={handleShare} />
        <Y2KButton label="Delete" icon={Trash2} variant="danger" onPress={() => setConfirmOpen(true)} />
      </View>

      <ConfirmDialog
        visible={confirmOpen}
        title="Delete this outfit?"
        message={`"${outfit.name}" will be permanently removed from your saved outfits.`}
        confirmLabel="Delete Outfit"
        onCancel={() => setConfirmOpen(false)}
        onConfirm={handleDelete}
      />
    </ScreenScroll>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <View className="items-center gap-1">
      <Text className="font-serif text-xl text-charcoal">{value}</Text>
      <Text className="font-body text-[9px] uppercase" style={{ color: Colors.stone, letterSpacing: 1 }}>
        {label}
      </Text>
    </View>
  );
}
