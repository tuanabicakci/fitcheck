/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/app/**/*.{js,jsx,ts,tsx}', './src/components/**/*.{js,jsx,ts,tsx}'],
  presets: [require('nativewind/preset')],
  theme: {
    extend: {
      colors: {
        // Quiet Luxury palette
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
      },
      fontFamily: {
        serif: ['CormorantGaramond_500Medium'],
        'serif-regular': ['CormorantGaramond_400Regular'],
        'serif-semi': ['CormorantGaramond_600SemiBold'],
        'serif-italic': ['CormorantGaramond_500Medium_Italic'],
        body: ['Inter_400Regular'],
        'body-medium': ['Inter_500Medium'],
        'body-semi': ['Inter_600SemiBold'],
      },
      borderRadius: {
        xl2: '1.25rem',
        xl3: '1.5rem',
        xl4: '1.75rem',
      },
      letterSpacing: {
        wide: '0.06em',
        wider: '0.1em',
        widest: '0.16em',
      },
    },
  },
  plugins: [],
};
