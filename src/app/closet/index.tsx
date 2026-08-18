import { useRouter } from 'expo-router';
import { Plus, Search, Shirt } from 'lucide-react-native';
import { useMemo, useState } from 'react';
import { Pressable, Text, TextInput, View } from 'react-native';

import { ScreenHeader } from '@/components/ScreenHeader';
import { ScreenScroll } from '@/components/ScreenScroll';
import { ClothingImage } from '@/components/ClothingImage';
import { StickerBadge } from '@/components/y2k/StickerBadge';
import { FilterChips } from '@/components/y2k/FilterChips';
import { Y2KButton } from '@/components/y2k/Y2KButton';
import { CATEGORY_ICONS } from '@/lib/categoryIcons';
import { useAppData } from '@/lib/store';
import { Colors, Shadow } from '@/lib/theme';
import { ALL_CATEGORIES, CATEGORY_LABELS, type ClothingCategory } from '@/lib/types';

export default function ClosetScreen() {
  const router = useRouter();
  const { closetItems } = useAppData();
  const [query, setQuery] = useState('');
  const [categoryFilters, setCategoryFilters] = useState<string[]>([]);

  const filtered = useMemo(() => {
    return closetItems.filter((item) => {
      if (categoryFilters.length && !categoryFilters.includes(item.category)) return false;
      if (!query.trim()) return true;
      const q = query.trim().toLowerCase();
      return [item.name, item.brand, item.color, item.style].filter(Boolean).some((v) => v!.toLowerCase().includes(q));
    });
  }, [closetItems, query, categoryFilters]);

  return (
    <ScreenScroll>
      <ScreenHeader
        title="Your Closet"
        subtitle={`${closetItems.length} item${closetItems.length === 1 ? '' : 's'} saved`}
        right={<Y2KButton label="Add" size="sm" icon={Plus} onPress={() => router.push('/closet/new')} />}
      />

      <View className="flex-row items-center gap-2 px-1" style={{ borderBottomWidth: 1, borderColor: Colors.hairline }}>
        <Search size={15} color={Colors.stone} strokeWidth={1.5} />
        <TextInput
          placeholder="Search your closet..."
          placeholderTextColor={Colors.mushroom}
          value={query}
          onChangeText={setQuery}
          className="flex-1 font-body text-sm py-2.5"
          style={{ color: Colors.charcoal, minHeight: 40 }}
        />
      </View>

      <FilterChips
        options={ALL_CATEGORIES.map((c) => ({ value: c, label: CATEGORY_LABELS[c], icon: CATEGORY_ICONS[c] }))}
        selected={categoryFilters}
        onToggle={(v) => setCategoryFilters((prev) => (prev.includes(v) ? prev.filter((x) => x !== v) : [...prev, v]))}
      />

      {filtered.length === 0 ? (
        <View className="items-center gap-3 py-16">
          <Shirt size={30} color={Colors.taupe} strokeWidth={1.25} />
          <Text className="font-serif text-2xl text-charcoal">
            {closetItems.length === 0 ? 'Your closet is empty' : 'No matches found'}
          </Text>
          <Text className="font-body text-xs text-center" style={{ color: Colors.stone, maxWidth: 240 }}>
            {closetItems.length === 0
              ? 'Photograph or upload your first piece to start building outfits.'
              : 'Try a different search or clear your filters.'}
          </Text>
          {closetItems.length === 0 && <Y2KButton label="Add an Item" icon={Plus} onPress={() => router.push('/closet/new')} />}
        </View>
      ) : (
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 16 }}>
          {filtered.map((item) => (
            <Pressable key={item.id} onPress={() => router.push(`/closet/${item.id}`)} style={{ width: '47%' }} className="gap-2">
              <View
                style={[
                  { aspectRatio: 0.85, borderWidth: 1, borderColor: Colors.hairline, overflow: 'hidden', backgroundColor: Colors.cream },
                  Shadow.soft,
                ]}>
                <ClothingImage item={item} radius={0} />
                <View style={{ position: 'absolute', top: 10, left: 10 }}>
                  <StickerBadge label={CATEGORY_LABELS[item.category]} small />
                </View>
              </View>
              <Text className="font-serif text-base text-charcoal" numberOfLines={1}>
                {item.name}
              </Text>
            </Pressable>
          ))}
        </View>
      )}
    </ScreenScroll>
  );
}
