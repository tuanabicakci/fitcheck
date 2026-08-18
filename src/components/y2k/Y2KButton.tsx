import * as Haptics from 'expo-haptics';
import type { LucideIcon } from 'lucide-react-native';
import { Platform, Pressable, Text, View } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';

import { Colors, Shadow } from '@/lib/theme';

export type Y2KButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
export type Y2KButtonSize = 'sm' | 'md' | 'lg';

interface Y2KButtonProps {
  label: string;
  onPress?: () => void;
  variant?: Y2KButtonVariant;
  size?: Y2KButtonSize;
  icon?: LucideIcon;
  iconPosition?: 'left' | 'right';
  fullWidth?: boolean;
  disabled?: boolean;
  loading?: boolean;
}

const FILL: Record<Y2KButtonVariant, string> = {
  primary: Colors.charcoal,
  secondary: Colors.beige,
  outline: 'transparent',
  ghost: 'transparent',
  danger: Colors.burgundy,
};

const TEXT_COLOR: Record<Y2KButtonVariant, string> = {
  primary: Colors.cream,
  secondary: Colors.charcoal,
  outline: Colors.charcoal,
  ghost: Colors.charcoal,
  danger: Colors.cream,
};

const SIZE_STYLES: Record<Y2KButtonSize, { padY: number; padX: number; fontSize: number; iconSize: number }> = {
  sm: { padY: 9, padX: 16, fontSize: 11, iconSize: 13 },
  md: { padY: 13, padX: 22, fontSize: 12, iconSize: 15 },
  lg: { padY: 16, padX: 28, fontSize: 13, iconSize: 17 },
};

export function Y2KButton({
  label,
  onPress,
  variant = 'primary',
  size = 'md',
  icon: Icon,
  iconPosition = 'left',
  fullWidth = false,
  disabled = false,
  loading = false,
}: Y2KButtonProps) {
  const pressed = useSharedValue(0);
  const s = SIZE_STYLES[size];
  const textColor = TEXT_COLOR[variant];

  const animStyle = useAnimatedStyle(() => ({
    opacity: 1 - pressed.value * 0.16,
  }));

  return (
    <Pressable
      disabled={disabled || loading}
      onPressIn={() => {
        pressed.value = withTiming(1, { duration: 80 });
      }}
      onPressOut={() => {
        pressed.value = withTiming(0, { duration: 140 });
      }}
      onPress={() => {
        if (Platform.OS !== 'web') Haptics.selectionAsync();
        onPress?.();
      }}
      style={{ alignSelf: fullWidth ? 'stretch' : 'flex-start', opacity: disabled ? 0.45 : 1 }}>
      <Animated.View style={animStyle}>
        <View
          style={[
            {
              borderRadius: 8,
              paddingVertical: s.padY,
              paddingHorizontal: s.padX,
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 8,
              backgroundColor: FILL[variant],
              borderWidth: variant === 'outline' ? 1 : 0,
              borderColor: Colors.charcoal,
            },
            variant === 'primary' || variant === 'danger' ? Shadow.button : null,
          ]}>
          {Icon && iconPosition === 'left' && <Icon size={s.iconSize} color={textColor} strokeWidth={1.75} />}
          <Text
            className="font-body-medium"
            style={{
              color: textColor,
              fontSize: s.fontSize,
              letterSpacing: 1,
              textTransform: 'uppercase',
            }}>
            {loading ? 'One moment' : label}
          </Text>
          {Icon && iconPosition === 'right' && <Icon size={s.iconSize} color={textColor} strokeWidth={1.75} />}
        </View>
      </Animated.View>
    </Pressable>
  );
}
