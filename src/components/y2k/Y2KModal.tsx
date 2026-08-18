import { BlurView } from 'expo-blur';
import { X } from 'lucide-react-native';
import type { ReactNode } from 'react';
import { Modal, Pressable, ScrollView, Text, View } from 'react-native';
import Animated, { FadeIn, FadeInDown, FadeOut } from 'react-native-reanimated';

import { Colors, MaxContentWidth, Shadow } from '@/lib/theme';

interface Y2KModalProps {
  visible: boolean;
  onClose: () => void;
  title?: string;
  children: ReactNode;
  footer?: ReactNode;
  maxHeight?: number;
}

export function Y2KModal({ visible, onClose, title, children, footer, maxHeight }: Y2KModalProps) {
  return (
    <Modal visible={visible} transparent animationType="none" onRequestClose={onClose}>
      <Animated.View entering={FadeIn.duration(180)} exiting={FadeOut.duration(150)} style={{ flex: 1 }}>
        <BlurView intensity={16} tint="dark" style={{ flex: 1 }}>
          <Pressable
            onPress={onClose}
            style={{ flex: 1, alignItems: 'center', justifyContent: 'center', padding: 20, backgroundColor: '#2A272333' }}>
            <Pressable onPress={(e) => e.stopPropagation()} style={{ width: '100%', maxWidth: MaxContentWidth - 40 }}>
              <Animated.View
                entering={FadeInDown.springify().damping(20).mass(0.7)}
                style={[
                  {
                    backgroundColor: Colors.cream,
                    borderRadius: 4,
                    borderWidth: 1,
                    borderColor: Colors.hairline,
                    overflow: 'hidden',
                    maxHeight: maxHeight ?? '85%',
                  },
                  Shadow.lifted,
                ]}>
                <View
                  className="flex-row items-center justify-between px-6 py-5"
                  style={{ borderBottomWidth: 1, borderColor: Colors.hairline }}>
                  <Text className="font-serif text-2xl text-charcoal flex-1 pr-3" numberOfLines={1}>
                    {title}
                  </Text>
                  <Pressable onPress={onClose} hitSlop={10}>
                    <X size={18} color={Colors.charcoal} strokeWidth={1.5} />
                  </Pressable>
                </View>
                <ScrollView contentContainerStyle={{ padding: 24, gap: 18 }} keyboardShouldPersistTaps="handled">
                  {children}
                </ScrollView>
                {footer && (
                  <View className="px-6 py-5 gap-2" style={{ borderTopWidth: 1, borderColor: Colors.hairline }}>
                    {footer}
                  </View>
                )}
              </Animated.View>
            </Pressable>
          </Pressable>
        </BlurView>
      </Animated.View>
    </Modal>
  );
}
