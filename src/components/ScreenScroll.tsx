import type { ReactNode } from 'react';
import { Platform, RefreshControl, ScrollView, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Colors } from '@/lib/theme';

import { NAV_HEIGHT } from './BottomNavigation';

interface ScreenScrollProps {
  children: ReactNode;
  contentClassName?: string;
  refreshing?: boolean;
  onRefresh?: () => void;
  scrollable?: boolean;
}

export function ScreenScroll({ children, contentClassName, refreshing, onRefresh, scrollable = true }: ScreenScrollProps) {
  const insets = useSafeAreaInsets();
  const topPad = Platform.OS === 'web' ? 22 : insets.top + 14;
  const bottomPad = NAV_HEIGHT + (Platform.OS === 'web' ? 10 : Math.max(insets.bottom, 10)) + 24;

  if (!scrollable) {
    return (
      <View style={{ flex: 1, paddingTop: topPad, paddingBottom: bottomPad }} className={contentClassName}>
        {children}
      </View>
    );
  }

  return (
    <ScrollView
      style={{ flex: 1 }}
      contentContainerStyle={{ paddingTop: topPad, paddingBottom: bottomPad, paddingHorizontal: 24, gap: 24 }}
      className={contentClassName}
      showsVerticalScrollIndicator={false}
      refreshControl={onRefresh ? <RefreshControl refreshing={!!refreshing} onRefresh={onRefresh} tintColor={Colors.stone} /> : undefined}
      keyboardShouldPersistTaps="handled">
      {children}
    </ScrollView>
  );
}
