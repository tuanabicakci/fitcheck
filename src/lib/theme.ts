import { Platform } from 'react-native';

// Quiet Luxury palette — keep in sync with tailwind.config.js `theme.extend.colors`
export const Colors = {
  ivory: '#F7F3EC',
  cream: '#FBF8F3',
  beige: '#E9E1D4',
  mushroom: '#C9BEB0',
  taupe: '#A99880',
  stone: '#8C8577',
  espresso: '#4A392E',
  charcoal: '#2A2723',
  olive: '#6B6B4F',
  burgundy: '#5E2A2E',
  hairline: '#DCD3C4',
} as const;

export const CategoryColors: Record<string, string> = {
  tops: Colors.beige,
  bottoms: Colors.mushroom,
  dresses: Colors.beige,
  shoes: Colors.mushroom,
  jackets: Colors.beige,
  bags: Colors.mushroom,
  jewelry: Colors.beige,
  hats: Colors.mushroom,
  belts: Colors.beige,
  accessories: Colors.mushroom,
};

export const MaxContentWidth = 480;

export const Shadow = {
  soft: {
    shadowColor: Colors.charcoal,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 10,
    elevation: 2,
  },
  card: {
    shadowColor: Colors.charcoal,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 16,
    elevation: 3,
  },
  button: {
    shadowColor: Colors.charcoal,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 2,
  },
  lifted: {
    shadowColor: Colors.charcoal,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.12,
    shadowRadius: 28,
    elevation: 6,
  },
} as const;

export const FontFamily = {
  serif: 'CormorantGaramond_500Medium',
  serifRegular: 'CormorantGaramond_400Regular',
  serifSemi: 'CormorantGaramond_600SemiBold',
  serifItalic: 'CormorantGaramond_500Medium_Italic',
  body: 'Inter_400Regular',
  bodyMedium: 'Inter_500Medium',
  bodySemi: 'Inter_600SemiBold',
} as const;

export const isWeb = Platform.OS === 'web';
