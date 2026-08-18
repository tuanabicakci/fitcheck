import { Check, Info, X } from 'lucide-react-native';
import { createContext, useCallback, useContext, useRef, useState } from 'react';
import type { ReactNode } from 'react';
import { Text, View } from 'react-native';
import Animated, { FadeInDown, FadeOutUp } from 'react-native-reanimated';

import { Colors, Shadow } from './theme';

type ToastVariant = 'success' | 'error' | 'info';

interface ToastState {
  id: number;
  message: string;
  variant: ToastVariant;
}

interface ToastContextValue {
  showToast: (message: string, variant?: ToastVariant) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

const VARIANT_ICON: Record<ToastVariant, typeof Check> = {
  success: Check,
  error: X,
  info: Info,
};

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toast, setToast] = useState<ToastState | null>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const showToast = useCallback((message: string, variant: ToastVariant = 'success') => {
    if (timer.current) clearTimeout(timer.current);
    setToast({ id: Date.now(), message, variant });
    timer.current = setTimeout(() => setToast(null), 2800);
  }, []);

  const Icon = toast ? VARIANT_ICON[toast.variant] : Check;
  const iconColor = toast?.variant === 'error' ? Colors.burgundy : Colors.charcoal;

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <View pointerEvents="none" className="absolute left-0 right-0 top-14 items-center z-50">
        {toast && (
          <Animated.View
            key={toast.id}
            entering={FadeInDown.springify().damping(18)}
            exiting={FadeOutUp.duration(180)}
            style={[
              {
                flexDirection: 'row',
                alignItems: 'center',
                gap: 10,
                backgroundColor: Colors.cream,
                borderWidth: 1,
                borderColor: Colors.hairline,
                paddingHorizontal: 18,
                paddingVertical: 12,
                maxWidth: 340,
              },
              Shadow.card,
            ]}>
            <Icon size={14} color={iconColor} strokeWidth={1.75} />
            <Text className="font-body-medium text-[12px]" style={{ color: Colors.charcoal }}>
              {toast.message}
            </Text>
          </Animated.View>
        )}
      </View>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be used within ToastProvider');
  return ctx;
}
