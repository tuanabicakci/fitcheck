import { TriangleAlert } from 'lucide-react-native';
import { Text, View } from 'react-native';

import { Colors } from '@/lib/theme';

import { Y2KButton } from './Y2KButton';
import { Y2KModal } from './Y2KModal';

interface ConfirmDialogProps {
  visible: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  danger?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export function ConfirmDialog({
  visible,
  title,
  message,
  confirmLabel = 'Delete',
  cancelLabel = 'Cancel',
  danger = true,
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  return (
    <Y2KModal visible={visible} onClose={onCancel} title={title}>
      <View className="flex-row items-start gap-3">
        {danger && <TriangleAlert size={17} color={Colors.burgundy} strokeWidth={1.5} style={{ marginTop: 1 }} />}
        <Text className="font-body text-sm flex-1 leading-5" style={{ color: Colors.espresso }}>
          {message}
        </Text>
      </View>
      <View className="flex-row gap-3 mt-2">
        <View className="flex-1">
          <Y2KButton label={cancelLabel} variant="outline" fullWidth onPress={onCancel} />
        </View>
        <View className="flex-1">
          <Y2KButton
            label={confirmLabel}
            variant={danger ? 'danger' : 'primary'}
            fullWidth
            onPress={onConfirm}
          />
        </View>
      </View>
    </Y2KModal>
  );
}
