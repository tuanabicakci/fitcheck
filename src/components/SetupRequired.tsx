import { CloudOff } from 'lucide-react-native';
import { ScrollView, Text, View } from 'react-native';

import { Colors } from '@/lib/theme';

import { Y2KButton } from './y2k/Y2KButton';

interface SetupRequiredProps {
  title: string;
  message: string;
  steps?: string[];
  onRetry?: () => void;
}

export function SetupRequired({ title, message, steps, onRetry }: SetupRequiredProps) {
  return (
    <View style={{ flex: 1, backgroundColor: Colors.ivory }}>
      <ScrollView contentContainerStyle={{ flexGrow: 1, alignItems: 'center', justifyContent: 'center', padding: 32, gap: 16 }}>
        <CloudOff size={30} color={Colors.taupe} strokeWidth={1.25} />
        <Text className="font-serif text-2xl text-charcoal text-center">{title}</Text>
        <Text className="font-body text-sm text-center leading-6" style={{ color: Colors.stone, maxWidth: 340 }}>
          {message}
        </Text>
        {steps && (
          <View className="gap-2 mt-2" style={{ maxWidth: 340, width: '100%' }}>
            {steps.map((step, i) => (
              <View key={i} className="flex-row gap-3">
                <Text className="font-body-medium text-xs" style={{ color: Colors.taupe }}>
                  {i + 1}.
                </Text>
                <Text className="font-body text-xs flex-1 leading-5" style={{ color: Colors.espresso }}>
                  {step}
                </Text>
              </View>
            ))}
          </View>
        )}
        {onRetry && <Y2KButton label="Try Again" variant="outline" onPress={onRetry} />}
      </ScrollView>
    </View>
  );
}
