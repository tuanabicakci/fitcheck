import { Shirt } from 'lucide-react-native';
import { View } from 'react-native';

import { useAppData } from '@/lib/store';
import { Colors } from '@/lib/theme';
import type { Outfit } from '@/lib/types';

import { ClothingImage } from './ClothingImage';

const CATEGORY_ORDER = ['dresses', 'tops', 'bottoms', 'shoes', 'jackets', 'bags', 'jewelry', 'hats', 'belts', 'accessories'];

interface OutfitPreviewProps {
  outfit: Pick<Outfit, 'slots'>;
  size?: number;
}

export function OutfitPreview({ outfit, size = 160 }: OutfitPreviewProps) {
  const { getItem } = useAppData();

  const filled = outfit.slots
    .filter((s) => s.itemId)
    .map((s) => ({ category: s.category, item: getItem(s.itemId) }))
    .filter((s) => s.item)
    .sort((a, b) => CATEGORY_ORDER.indexOf(a.category) - CATEGORY_ORDER.indexOf(b.category));

  const cols = filled.length > 4 ? 3 : 2;
  const gap = 4;
  const tileSize = (size - 16 - gap * (cols - 1)) / cols;

  return (
    <View
      style={{
        width: size,
        height: size,
        borderWidth: 1,
        borderColor: Colors.hairline,
        backgroundColor: Colors.beige,
        padding: 8,
        overflow: 'hidden',
      }}>
      {filled.length === 0 ? (
        <View className="flex-1 items-center justify-center">
          <Shirt size={26} color={Colors.taupe} strokeWidth={1.25} />
        </View>
      ) : (
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap }}>
          {filled.slice(0, 6).map(({ category, item }, i) => (
            <View key={`${category}-${i}`} style={{ width: tileSize, height: tileSize, overflow: 'hidden' }}>
              {item && <ClothingImage item={item} radius={2} />}
            </View>
          ))}
        </View>
      )}
    </View>
  );
}
