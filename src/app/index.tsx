import { useRouter } from 'expo-router';
import { Heart, Shirt, ShoppingBag, Shuffle } from 'lucide-react-native';
import { useMemo, useState } from 'react';
import { Pressable, Text, View } from 'react-native';

import { ClothingImage } from '@/components/ClothingImage';
import { OutfitPreview } from '@/components/OutfitPreview';
import { ScreenScroll } from '@/components/ScreenScroll';
import { WeatherCard } from '@/components/WeatherCard';
import { Y2KButton } from '@/components/y2k/Y2KButton';
import { useAppData } from '@/lib/store';
import { Colors } from '@/lib/theme';
import { pickRandom } from '@/lib/utils';

function greeting(): string {
  const h = new Date().getHours();
  if (h < 12) return 'Good morning';
  if (h < 18) return 'Good afternoon';
  return 'Good evening';
}

export default function HomeScreen() {
  const router = useRouter();
  const { closetItems, outfits } = useAppData();
  const [inspoSeed, setInspoSeed] = useState(0);

  const recentItems = useMemo(() => closetItems.slice(0, 8), [closetItems]);
  const favoriteOutfits = useMemo(() => outfits.filter((o) => o.favorite), [outfits]);
  const inspo = useMemo(() => pickRandom(outfits), [outfits, inspoSeed]);

  return (
    <ScreenScroll>
      <View className="gap-1">
        <Text className="font-serif text-3xl text-charcoal">{greeting()}</Text>
        <Text className="font-body text-sm" style={{ color: Colors.stone }}>
          Let&apos;s put something considered together.
        </Text>
      </View>

      <WeatherCard />

      <View className="flex-row gap-4">
        <StatTile icon={Shirt} label="Closet Items" value={closetItems.length} onPress={() => router.push('/closet')} />
        <StatTile icon={ShoppingBag} label="Saved Outfits" value={outfits.length} onPress={() => router.push('/saved')} />
      </View>

      {inspo && (
        <View className="gap-3">
          <View className="flex-row items-center justify-between">
            <Text className="font-serif text-xl text-charcoal">Today&apos;s Inspiration</Text>
            <Pressable onPress={() => setInspoSeed((s) => s + 1)} hitSlop={8}>
              <Shuffle size={15} color={Colors.stone} strokeWidth={1.5} />
            </Pressable>
          </View>
          <Pressable
            onPress={() => router.push(`/saved/${inspo.id}`)}
            className="flex-row gap-4 p-3"
            style={{ borderWidth: 1, borderColor: Colors.hairline, backgroundColor: Colors.cream }}>
            <OutfitPreview outfit={inspo} size={90} />
            <View className="flex-1 justify-center gap-1">
              <Text className="font-serif text-lg text-charcoal" numberOfLines={1}>
                {inspo.name}
              </Text>
              <Text className="font-body text-[10px] uppercase" style={{ color: Colors.stone, letterSpacing: 0.6 }}>
                Wear it again
              </Text>
            </View>
          </Pressable>
        </View>
      )}

      {favoriteOutfits.length > 0 && (
        <View className="gap-3">
          <View className="flex-row items-center gap-2">
            <Heart size={14} color={Colors.burgundy} fill={Colors.burgundy} strokeWidth={1.5} />
            <Text className="font-serif text-xl text-charcoal">Favorite Outfits</Text>
          </View>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 14 }}>
            {favoriteOutfits.slice(0, 4).map((o) => (
              <Pressable key={o.id} onPress={() => router.push(`/saved/${o.id}`)} className="gap-2" style={{ width: '47%' }}>
                <OutfitPreview outfit={o} size={150} />
                <Text className="font-serif text-base text-charcoal" numberOfLines={1}>
                  {o.name}
                </Text>
              </Pressable>
            ))}
          </View>
        </View>
      )}

      <View className="gap-3">
        <View className="flex-row items-center justify-between">
          <Text className="font-serif text-xl text-charcoal">Recently Added</Text>
          <Pressable onPress={() => router.push('/closet')}>
            <Text className="font-body-medium text-[10px] uppercase" style={{ color: Colors.stone, letterSpacing: 0.8 }}>
              See closet
            </Text>
          </Pressable>
        </View>
        {recentItems.length === 0 ? (
          <View className="items-center gap-3 p-10" style={{ borderWidth: 1, borderStyle: 'dashed', borderColor: Colors.hairline }}>
            <Text className="font-body text-xs text-center" style={{ color: Colors.stone }}>
              Add your first closet item to see it here.
            </Text>
            <Y2KButton label="Add Item" size="sm" variant="outline" onPress={() => router.push('/closet/new')} />
          </View>
        ) : (
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 12 }}>
            {recentItems.map((item) => (
              <Pressable key={item.id} onPress={() => router.push(`/closet/${item.id}`)} style={{ width: '30%' }}>
                <View style={{ aspectRatio: 1, borderWidth: 1, borderColor: Colors.hairline, overflow: 'hidden' }}>
                  <ClothingImage item={item} radius={0} />
                </View>
              </Pressable>
            ))}
          </View>
        )}
      </View>
    </ScreenScroll>
  );
}

function StatTile({
  icon: Icon,
  label,
  value,
  onPress,
}: {
  icon: typeof Shirt;
  label: string;
  value: number;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      className="flex-1 p-4 gap-3"
      style={{ borderWidth: 1, borderColor: Colors.hairline, backgroundColor: Colors.cream }}>
      <Icon size={17} color={Colors.espresso} strokeWidth={1.25} />
      <Text className="font-serif text-2xl text-charcoal">{value}</Text>
      <Text className="font-body-medium text-[9px] uppercase" style={{ color: Colors.stone, letterSpacing: 0.8 }}>
        {label}
      </Text>
    </Pressable>
  );
}
