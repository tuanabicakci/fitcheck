import '@/global.css';

import {
  CormorantGaramond_400Regular,
  CormorantGaramond_500Medium,
  CormorantGaramond_500Medium_Italic,
  CormorantGaramond_600SemiBold,
} from '@expo-google-fonts/cormorant-garamond';
import { Inter_400Regular, Inter_500Medium, Inter_600SemiBold } from '@expo-google-fonts/inter';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { Loader } from 'lucide-react-native';
import { useEffect } from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import Animated, { useAnimatedStyle, useSharedValue, withRepeat, withTiming } from 'react-native-reanimated';
import { Text, View } from 'react-native';

import { BottomNavigation } from '@/components/BottomNavigation';
import { PhoneFrame } from '@/components/PhoneFrame';
import { SetupRequired } from '@/components/SetupRequired';
import { AuthProvider, useAuth } from '@/lib/auth';
import { AppDataProvider } from '@/lib/store';
import { isSupabaseConfigured } from '@/lib/supabase';
import { Colors } from '@/lib/theme';
import { ToastProvider } from '@/lib/toast';

SplashScreen.preventAutoHideAsync().catch(() => {});

export default function RootLayout() {
  const [fontsLoaded] = useFonts({
    CormorantGaramond_400Regular,
    CormorantGaramond_500Medium,
    CormorantGaramond_500Medium_Italic,
    CormorantGaramond_600SemiBold,
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
  });

  useEffect(() => {
    if (fontsLoaded) SplashScreen.hideAsync().catch(() => {});
  }, [fontsLoaded]);

  if (!fontsLoaded) return null;

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <PhoneFrame>
          {isSupabaseConfigured ? (
            <AuthProvider>
              <ToastProvider>
                <AuthenticatedApp />
              </ToastProvider>
            </AuthProvider>
          ) : (
            <SetupRequired
              title="Connect Supabase"
              message="Fit Check stores your closet in Supabase. Add your project's credentials to get started."
              steps={[
                'Create a project at supabase.com and run the SQL in supabase/migrations/0001_init.sql using its SQL Editor.',
                'In Authentication → Sign In / Up, enable "Allow anonymous sign-ins".',
                'Copy .env.example to .env and fill in your Project URL and anon key from Settings → API.',
                'Restart the dev server so the new environment variables load.',
              ]}
            />
          )}
        </PhoneFrame>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}

function AuthenticatedApp() {
  const { ready, error, retry } = useAuth();

  if (!ready) {
    return <LoadingScreen />;
  }

  if (error) {
    return (
      <SetupRequired
        title="Couldn't sign you in"
        message={`Supabase returned: "${error}". This usually means anonymous sign-ins aren't enabled yet.`}
        steps={['In your Supabase project, go to Authentication → Sign In / Up and enable "Allow anonymous sign-ins".']}
        onRetry={retry}
      />
    );
  }

  return (
    <AppDataProvider>
      <Stack screenOptions={{ headerShown: false, animation: 'fade', contentStyle: { backgroundColor: 'transparent' } }} />
      <BottomNavigation />
    </AppDataProvider>
  );
}

function LoadingScreen() {
  const rotate = useSharedValue(0);
  useEffect(() => {
    rotate.value = withRepeat(withTiming(360, { duration: 900 }), -1, false);
  }, [rotate]);
  const spinStyle = useAnimatedStyle(() => ({ transform: [{ rotate: `${rotate.value}deg` }] }));

  return (
    <View style={{ flex: 1, backgroundColor: Colors.ivory, alignItems: 'center', justifyContent: 'center', gap: 14 }}>
      <Animated.View style={spinStyle}>
        <Loader size={22} color={Colors.stone} strokeWidth={1.25} />
      </Animated.View>
      <Text className="font-body text-xs" style={{ color: Colors.stone }}>
        Setting up your closet…
      </Text>
    </View>
  );
}
