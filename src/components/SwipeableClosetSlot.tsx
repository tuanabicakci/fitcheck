import * as Haptics from 'expo-haptics';
import { ChevronLeft, ChevronRight, Lock, LockOpen, Plus, X } from 'lucide-react-native';
import { useEffect, useState } from 'react';
import { Platform, Pressable, Text, View } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, {
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from 'react-native-reanimated';

import { Colors } from '@/lib/theme';
import { CATEGORY_LABELS } from '@/lib/types';
import type { ClothingCategory, ClothingItem } from '@/lib/types';

import { ClothingCard } from './ClothingCard';
import { Y2KButton } from './y2k/Y2KButton';

interface SwipeableClosetSlotProps {
  category: ClothingCategory;
  items: ClothingItem[];
  selectedItemId: string | null;
  onChangeItem: (itemId: string) => void;
  locked: boolean;
  onToggleLock: () => void;
  removable?: boolean;
  onRemove?: () => void;
  onAddItem: () => void;
  height?: number;
}

const OFFSCREEN = 460;
const SWIPE_THRESHOLD = 90;

export function SwipeableClosetSlot({
  category,
  items,
  selectedItemId,
  onChangeItem,
  locked,
  onToggleLock,
  removable = false,
  onRemove,
  onAddItem,
  height = 290,
}: SwipeableClosetSlotProps) {
  const translateX = useSharedValue(0);
  const [renderIndex, setRenderIndex] = useState(() =>
    Math.max(0, items.findIndex((i) => i.id === selectedItemId)),
  );
  const [label, setLabel] = useState<'NEXT' | 'BACK' | null>(null);

  useEffect(() => {
    const idx = items.findIndex((i) => i.id === selectedItemId);
    if (idx >= 0) setRenderIndex(idx);
  }, [selectedItemId, items]);

  const current = items[renderIndex];

  function commitIndex(direction: 1 | -1) {
    if (items.length === 0) return;
    const nextIndex = (renderIndex + direction + items.length) % items.length;
    setRenderIndex(nextIndex);
    onChangeItem(items[nextIndex].id);
    translateX.value = -direction * OFFSCREEN;
    translateX.value = withSpring(0, { damping: 18, stiffness: 150 });
  }

  function triggerSwipe(direction: 1 | -1) {
    if (locked || items.length <= 1) {
      translateX.value = withSpring(0);
      return;
    }
    if (Platform.OS !== 'web') Haptics.selectionAsync();
    translateX.value = withTiming(direction * OFFSCREEN, { duration: 220 }, (finished) => {
      if (finished) runOnJS(commitIndex)(direction);
    });
  }

  const pan = Gesture.Pan()
    .enabled(!locked && items.length > 1)
    .onUpdate((e) => {
      translateX.value = e.translationX;
      runOnJS(setLabel)(e.translationX > 20 ? 'NEXT' : e.translationX < -20 ? 'BACK' : null);
    })
    .onEnd((e) => {
      runOnJS(setLabel)(null);
      if (e.translationX > SWIPE_THRESHOLD) {
        runOnJS(triggerSwipe)(1);
      } else if (e.translationX < -SWIPE_THRESHOLD) {
        runOnJS(triggerSwipe)(-1);
      } else {
        translateX.value = withSpring(0, { damping: 18, stiffness: 170 });
      }
    });

  const cardStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: translateX.value },
      { rotate: `${(translateX.value / OFFSCREEN) * 5}deg` },
    ],
  }));

  const nextLabelStyle = useAnimatedStyle(() => ({
    opacity: Math.min(1, Math.abs(translateX.value) / SWIPE_THRESHOLD),
  }));

  if (items.length === 0) {
    return (
      <View
        style={{
          height,
          borderWidth: 1,
          borderStyle: 'dashed',
          borderColor: Colors.hairline,
          backgroundColor: Colors.ivory,
          alignItems: 'center',
          justifyContent: 'center',
          gap: 10,
          padding: 20,
        }}>
        {removable && (
          <Pressable onPress={onRemove} hitSlop={10} style={{ position: 'absolute', top: 14, right: 14 }}>
            <X size={15} color={Colors.stone} strokeWidth={1.5} />
          </Pressable>
        )}
        <Text
          className="font-body-medium text-[10px] uppercase"
          style={{ color: Colors.stone, letterSpacing: 1.2 }}>
          {CATEGORY_LABELS[category]}
        </Text>
        <Text className="font-serif text-xl text-charcoal">Nothing here yet</Text>
        <Text className="font-body text-xs text-center" style={{ color: Colors.stone, maxWidth: 220 }}>
          Add a piece to your closet to fill this slot.
        </Text>
        <Y2KButton label="Add Item" icon={Plus} size="sm" variant="outline" onPress={onAddItem} />
      </View>
    );
  }

  return (
    <View style={{ height }}>
      <View
        pointerEvents="none"
        style={{ position: 'absolute', left: 0, right: 0, top: 0, bottom: 0, alignItems: 'center', justifyContent: 'center', zIndex: 5 }}>
        <Animated.View style={nextLabelStyle}>
          {label && (
            <View style={{ backgroundColor: Colors.charcoal, paddingHorizontal: 14, paddingVertical: 6 }}>
              <Text className="font-body-semi text-[11px] uppercase" style={{ color: Colors.cream, letterSpacing: 2 }}>
                {label}
              </Text>
            </View>
          )}
        </Animated.View>
      </View>

      <GestureDetector gesture={pan}>
        <Animated.View style={[{ flex: 1 }, cardStyle]}>
          <ClothingCard item={current} height={height} />
        </Animated.View>
      </GestureDetector>

      <View style={{ position: 'absolute', top: 14, right: 14, flexDirection: 'row', alignItems: 'center', gap: 6 }}>
        {items.length > 1 && (
          <View
            style={{
              backgroundColor: Colors.cream,
              borderWidth: 1,
              borderColor: Colors.hairline,
              paddingHorizontal: 8,
              paddingVertical: 3,
              marginRight: 2,
            }}>
            <Text className="font-body-medium text-[10px]" style={{ color: Colors.stone, letterSpacing: 0.5 }}>
              {renderIndex + 1} / {items.length}
            </Text>
          </View>
        )}
        {removable && (
          <Pressable
            onPress={onRemove}
            hitSlop={8}
            className="h-8 w-8 items-center justify-center"
            style={{ backgroundColor: Colors.cream, borderWidth: 1, borderColor: Colors.hairline }}>
            <X size={13} color={Colors.stone} strokeWidth={1.5} />
          </Pressable>
        )}
        <Pressable
          onPress={onToggleLock}
          hitSlop={8}
          className="h-8 w-8 items-center justify-center"
          style={{
            backgroundColor: locked ? Colors.charcoal : Colors.cream,
            borderWidth: 1,
            borderColor: locked ? Colors.charcoal : Colors.hairline,
          }}>
          {locked ? (
            <Lock size={13} color={Colors.cream} strokeWidth={1.5} />
          ) : (
            <LockOpen size={13} color={Colors.stone} strokeWidth={1.5} />
          )}
        </Pressable>
      </View>

      {items.length > 1 && !locked && (
        <>
          <Pressable
            onPress={() => triggerSwipe(-1)}
            hitSlop={8}
            className="h-8 w-8 items-center justify-center"
            style={{
              position: 'absolute',
              left: 10,
              top: '50%',
              marginTop: -16,
              backgroundColor: Colors.cream + 'E6',
              borderWidth: 1,
              borderColor: Colors.hairline,
            }}>
            <ChevronLeft size={16} color={Colors.charcoal} strokeWidth={1.5} />
          </Pressable>
          <Pressable
            onPress={() => triggerSwipe(1)}
            hitSlop={8}
            className="h-8 w-8 items-center justify-center"
            style={{
              position: 'absolute',
              right: 10,
              top: '50%',
              marginTop: -16,
              backgroundColor: Colors.cream + 'E6',
              borderWidth: 1,
              borderColor: Colors.hairline,
            }}>
            <ChevronRight size={16} color={Colors.charcoal} strokeWidth={1.5} />
          </Pressable>
        </>
      )}
    </View>
  );
}
