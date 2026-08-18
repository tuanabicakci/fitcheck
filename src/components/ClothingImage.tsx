import { Image } from 'expo-image';
import { View } from 'react-native';

import { CATEGORY_ICONS } from '@/lib/categoryIcons';
import { CategoryColors, Colors } from '@/lib/theme';
import type { ClothingItem } from '@/lib/types';

interface ClothingImageProps {
  item: Pick<ClothingItem, 'imageUri' | 'category' | 'swatchColor' | 'backgroundSimplified'>;
  radius?: number;
  iconRatio?: number;
}

/** Renders a real photo when present, otherwise a generated muted swatch card. */
export function ClothingImage({ item, radius = 4, iconRatio = 0.3 }: ClothingImageProps) {
  const Icon = CATEGORY_ICONS[item.category];
  const tint = item.swatchColor ?? CategoryColors[item.category] ?? Colors.beige;

  if (item.imageUri) {
    return (
      <View
        style={{
          width: '100%',
          height: '100%',
          borderRadius: radius,
          overflow: 'hidden',
          backgroundColor: item.backgroundSimplified ? Colors.ivory : undefined,
        }}>
        <Image
          source={{ uri: item.imageUri }}
          style={{ width: '100%', height: '100%' }}
          contentFit={item.backgroundSimplified ? 'contain' : 'cover'}
          transition={150}
        />
      </View>
    );
  }

  return (
    <View
      style={{
        width: '100%',
        height: '100%',
        borderRadius: radius,
        backgroundColor: tint,
        alignItems: 'center',
        justifyContent: 'center',
        overflow: 'hidden',
      }}>
      <Icon size={100 * iconRatio * 0.6} color={Colors.espresso} strokeWidth={1.25} />
    </View>
  );
}
