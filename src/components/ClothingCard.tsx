import { Text, View } from 'react-native';

import { Colors, Shadow } from '@/lib/theme';
import { CATEGORY_LABELS } from '@/lib/types';
import type { ClothingItem } from '@/lib/types';

import { ClothingImage } from './ClothingImage';
import { StickerBadge } from './y2k/StickerBadge';

interface ClothingCardProps {
  item: ClothingItem;
  height?: number;
}

export function ClothingCard({ item, height = 300 }: ClothingCardProps) {
  return (
    <View
      style={[
        {
          height,
          borderRadius: 4,
          borderWidth: 1,
          borderColor: Colors.hairline,
          backgroundColor: Colors.cream,
          overflow: 'hidden',
        },
        Shadow.card,
      ]}>
      <View style={{ flex: 1, padding: 8 }}>
        <ClothingImage item={item} radius={2} />
      </View>
      <View style={{ position: 'absolute', top: 14, left: 14 }}>
        <StickerBadge label={CATEGORY_LABELS[item.category]} />
      </View>
      <View
        pointerEvents="none"
        style={{
          position: 'absolute',
          left: 0,
          right: 0,
          bottom: 0,
          paddingHorizontal: 16,
          paddingVertical: 12,
          backgroundColor: Colors.cream,
          borderTopWidth: 1,
          borderColor: Colors.hairline,
        }}>
        <Text className="font-serif text-lg text-charcoal" numberOfLines={1}>
          {item.name}
        </Text>
        <Text
          className="font-body text-[10px] uppercase"
          style={{ color: Colors.stone, letterSpacing: 0.8 }}
          numberOfLines={1}>
          {[item.color, item.brand].filter(Boolean).join(' · ') || 'No details yet'}
        </Text>
      </View>
    </View>
  );
}
