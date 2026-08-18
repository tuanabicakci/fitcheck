import {
  Crown,
  Diamond,
  Footprints,
  Gem,
  Layers,
  Shapes,
  Shirt,
  ShoppingBag,
  Sparkle,
  type LucideIcon,
} from 'lucide-react-native';

import type { ClothingCategory } from './types';

export const CATEGORY_ICONS: Record<ClothingCategory, LucideIcon> = {
  tops: Shirt,
  bottoms: Layers,
  dresses: Sparkle,
  shoes: Footprints,
  jackets: Shirt,
  bags: ShoppingBag,
  jewelry: Gem,
  hats: Crown,
  belts: Shapes,
  accessories: Diamond,
};
