import type { ReactNode } from 'react';
import { View, useWindowDimensions } from 'react-native';

import { Colors, MaxContentWidth, Shadow } from '@/lib/theme';

const WIDE_BREAKPOINT = 720;

export function PhoneFrame({ children }: { children: ReactNode }) {
  const { width, height } = useWindowDimensions();
  const isWide = width >= WIDE_BREAKPOINT;

  if (!isWide) {
    return <View style={{ flex: 1, backgroundColor: Colors.ivory }}>{children}</View>;
  }

  const frameHeight = Math.min(height - 56, 900);

  return (
    <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: Colors.beige }}>
      <View
        style={[
          {
            width: MaxContentWidth,
            height: frameHeight,
            borderRadius: 6,
            borderWidth: 10,
            borderColor: Colors.charcoal,
            backgroundColor: Colors.ivory,
            overflow: 'hidden',
          },
          Shadow.lifted,
        ]}>
        <View style={{ flex: 1 }}>{children}</View>
      </View>
    </View>
  );
}
