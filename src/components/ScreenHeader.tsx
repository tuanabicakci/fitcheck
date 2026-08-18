import { useRouter } from 'expo-router';
import { ChevronLeft } from 'lucide-react-native';
import type { ReactNode } from 'react';
import { Pressable, Text, View } from 'react-native';

import { Colors } from '@/lib/theme';

interface ScreenHeaderProps {
  title: string;
  subtitle?: string;
  showBack?: boolean;
  right?: ReactNode;
}

export function ScreenHeader({ title, subtitle, showBack = false, right }: ScreenHeaderProps) {
  const router = useRouter();
  return (
    <View className="flex-row items-center justify-between mb-1">
      <View className="flex-row items-center gap-3 flex-1">
        {showBack && (
          <Pressable onPress={() => router.back()} hitSlop={10}>
            <ChevronLeft size={20} color={Colors.charcoal} strokeWidth={1.5} />
          </Pressable>
        )}
        <View className="flex-1">
          <Text className="font-serif text-3xl text-charcoal" numberOfLines={1}>
            {title}
          </Text>
          {subtitle && (
            <Text
              className="font-body text-[11px] uppercase mt-1"
              style={{ color: Colors.stone, letterSpacing: 1 }}>
              {subtitle}
            </Text>
          )}
        </View>
      </View>
      {right}
    </View>
  );
}
