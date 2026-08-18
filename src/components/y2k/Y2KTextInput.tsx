import type { LucideIcon } from 'lucide-react-native';
import { Text, TextInput, View } from 'react-native';
import type { TextInputProps } from 'react-native';

import { Colors } from '@/lib/theme';

interface Y2KTextInputProps extends TextInputProps {
  label?: string;
  icon?: LucideIcon;
}

export function Y2KTextInput({ label, icon: Icon, style, ...props }: Y2KTextInputProps) {
  return (
    <View className="gap-2">
      {label && (
        <Text
          className="font-body-medium text-[10px] uppercase"
          style={{ color: Colors.stone, letterSpacing: 1.4 }}>
          {label}
        </Text>
      )}
      <View
        className="flex-row items-center gap-2 px-1"
        style={{ borderBottomWidth: 1, borderColor: Colors.hairline }}>
        {Icon && <Icon size={15} color={Colors.stone} strokeWidth={1.5} />}
        <TextInput
          placeholderTextColor={Colors.mushroom}
          className="flex-1 font-body text-sm py-2.5"
          style={[{ color: Colors.charcoal, minHeight: 40 }, style]}
          {...props}
        />
      </View>
    </View>
  );
}
