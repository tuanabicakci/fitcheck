import { Text, View } from 'react-native';

import { Colors } from '@/lib/theme';

interface StickerBadgeProps {
  label: string;
  color?: string;
  /** Unused under the quiet-luxury style; kept for call-site compatibility. */
  rotate?: number;
  small?: boolean;
  filled?: boolean;
}

export function StickerBadge({ label, color = Colors.charcoal, small = false, filled = false }: StickerBadgeProps) {
  if (filled) {
    return (
      <View
        className={small ? 'px-2 py-0.5' : 'px-2.5 py-1'}
        style={{ backgroundColor: color }}>
        <Text
          className="font-body-medium uppercase"
          style={{ color: Colors.cream, fontSize: small ? 9 : 10, letterSpacing: 1.1 }}>
          {label}
        </Text>
      </View>
    );
  }

  return (
    <View
      className={small ? 'px-2 py-0.5' : 'px-2.5 py-1'}
      style={{ borderWidth: 1, borderColor: Colors.hairline, backgroundColor: Colors.cream }}>
      <Text
        className="font-body-medium uppercase"
        style={{ color, fontSize: small ? 9 : 10, letterSpacing: 1.1 }}>
        {label}
      </Text>
    </View>
  );
}
