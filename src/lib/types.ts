export type ClothingCategory =
  | 'tops'
  | 'bottoms'
  | 'dresses'
  | 'shoes'
  | 'jackets'
  | 'bags'
  | 'jewelry'
  | 'hats'
  | 'belts'
  | 'accessories';

export const CORE_CATEGORIES: ClothingCategory[] = ['tops', 'bottoms', 'shoes'];

export const OPTIONAL_CATEGORIES: ClothingCategory[] = [
  'jackets',
  'bags',
  'jewelry',
  'hats',
  'belts',
  'accessories',
];

export const ALL_CATEGORIES: ClothingCategory[] = [
  'tops',
  'bottoms',
  'dresses',
  'shoes',
  'jackets',
  'bags',
  'jewelry',
  'hats',
  'belts',
  'accessories',
];

export const CATEGORY_LABELS: Record<ClothingCategory, string> = {
  tops: 'Top',
  bottoms: 'Bottom',
  dresses: 'Dress / Jumpsuit',
  shoes: 'Shoes',
  jackets: 'Jacket',
  bags: 'Bag',
  jewelry: 'Jewelry',
  hats: 'Hat',
  belts: 'Belt',
  accessories: 'Accessory',
};

export type Season = 'spring' | 'summer' | 'fall' | 'winter';

export const SEASONS: Season[] = ['spring', 'summer', 'fall', 'winter'];

export const SEASON_LABELS: Record<Season, string> = {
  spring: 'Spring',
  summer: 'Summer',
  fall: 'Fall',
  winter: 'Winter',
};

export interface ClothingItem {
  id: string;
  name: string;
  category: ClothingCategory;
  /** Displayable photo URL (Supabase Storage public URL, or a fresh local picker URI not yet uploaded). */
  imageUri?: string;
  /** Raw Supabase Storage object path backing `imageUri`, used to avoid re-uploading on edit. */
  imagePath?: string;
  /** Tint used for the generated placeholder swatch when no photo is set. */
  swatchColor?: string;
  color?: string;
  seasons?: Season[];
  brand?: string;
  style?: string;
  notes?: string;
  backgroundSimplified?: boolean;
  createdAt: string;
}

export type Occasion =
  | 'casual'
  | 'work'
  | 'party'
  | 'date-night'
  | 'formal'
  | 'travel';

export const OCCASIONS: Occasion[] = [
  'casual',
  'work',
  'party',
  'date-night',
  'formal',
  'travel',
];

export const OCCASION_LABELS: Record<Occasion, string> = {
  casual: 'Casual',
  work: 'Work',
  party: 'Party',
  'date-night': 'Date Night',
  formal: 'Formal',
  travel: 'Travel',
};

export type OutfitMode = 'top-bottom' | 'full-body';

export interface OutfitSlot {
  category: ClothingCategory;
  itemId: string | null;
}

export interface Outfit {
  id: string;
  name: string;
  mode: OutfitMode;
  slots: OutfitSlot[];
  occasion?: Occasion;
  season?: Season;
  mood?: string;
  notes?: string;
  favorite: boolean;
  createdAt: string;
  lastWornAt?: string | null;
  wearCount: number;
}

export const MOODS = ['Polished', 'Relaxed', 'Composed', 'Refined', 'Grounded', 'Elegant', 'Tailored', 'Understated'];
