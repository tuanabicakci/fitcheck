import type { LucideIcon } from 'lucide-react-native';
import { Pressable, ScrollView, Text, View } from 'react-native';

import { Colors } from '@/lib/theme';

export interface FilterChipOption {
  value: string;
  label: string;
  icon?: LucideIcon;
}

interface FilterChipsProps {
  options: FilterChipOption[];
  selected: string[];
  onToggle: (value: string) => void;
  scrollable?: boolean;
}

export function FilterChips({ options, selected, onToggle, scrollable = true }: FilterChipsProps) {
  const content = (
    <View className="flex-row gap-2" style={{ flexWrap: scrollable ? 'nowrap' : 'wrap' }}>
      {options.map((opt) => {
        const active = selected.includes(opt.value);
        const Icon = opt.icon;
        return (
          <Pressable
            key={opt.value}
            onPress={() => onToggle(opt.value)}
            className="flex-row items-center gap-1.5 px-3.5 py-2"
            style={{
              borderWidth: 1,
              borderColor: active ? Colors.charcoal : Colors.hairline,
              backgroundColor: active ? Colors.charcoal : 'transparent',
            }}>
            {Icon && <Icon size={12} color={active ? Colors.cream : Colors.stone} strokeWidth={1.5} />}
            <Text
              className="font-body-medium uppercase"
              style={{ color: active ? Colors.cream : Colors.stone, fontSize: 10.5, letterSpacing: 0.8 }}>
              {opt.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );

  if (!scrollable) return content;

  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingRight: 20 }}>
      {content}
    </ScrollView>
  );
}
