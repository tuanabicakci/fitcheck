import { Plus } from 'lucide-react-native';
import { useState } from 'react';
import { Pressable, Text, View } from 'react-native';

import { CATEGORY_ICONS } from '@/lib/categoryIcons';
import { Colors } from '@/lib/theme';
import { CATEGORY_LABELS, type ClothingCategory } from '@/lib/types';

import { Y2KModal } from './y2k/Y2KModal';

interface AddCategoryButtonProps {
  available: ClothingCategory[];
  onAdd: (category: ClothingCategory) => void;
}

export function AddCategoryButton({ available, onAdd }: AddCategoryButtonProps) {
  const [open, setOpen] = useState(false);

  if (available.length === 0) return null;

  return (
    <>
      <Pressable
        onPress={() => setOpen(true)}
        className="flex-row items-center justify-center gap-2 py-4"
        style={{ borderWidth: 1, borderStyle: 'dashed', borderColor: Colors.hairline }}>
        <Plus size={14} color={Colors.stone} strokeWidth={1.5} />
        <Text className="font-body-medium text-[11px] uppercase" style={{ color: Colors.stone, letterSpacing: 1 }}>
          Add Category
        </Text>
      </Pressable>

      <Y2KModal visible={open} onClose={() => setOpen(false)} title="Add a Slot">
        <View className="flex-row flex-wrap gap-3">
          {available.map((cat) => {
            const Icon = CATEGORY_ICONS[cat];
            return (
              <Pressable
                key={cat}
                onPress={() => {
                  onAdd(cat);
                  setOpen(false);
                }}
                className="items-center gap-2 px-4 py-4"
                style={{ backgroundColor: Colors.ivory, borderWidth: 1, borderColor: Colors.hairline, width: '30%' }}>
                <Icon size={19} color={Colors.espresso} strokeWidth={1.25} />
                <Text
                  className="font-body-medium text-[10px] uppercase text-center"
                  style={{ color: Colors.charcoal, letterSpacing: 0.6 }}>
                  {CATEGORY_LABELS[cat]}
                </Text>
              </Pressable>
            );
          })}
        </View>
      </Y2KModal>
    </>
  );
}
