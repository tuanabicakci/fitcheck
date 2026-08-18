import * as Location from 'expo-location';
import { CloudOff, Loader } from 'lucide-react-native';
import { useCallback, useEffect, useState } from 'react';
import { Pressable, Text, View } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withRepeat, withTiming } from 'react-native-reanimated';

import { Colors, Shadow } from '@/lib/theme';
import { fetchWeather, type WeatherSnapshot } from '@/lib/weather';

type Status = 'loading' | 'ready' | 'error';

const TODAY = new Date().toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric' });

export function WeatherCard() {
  const [status, setStatus] = useState<Status>('loading');
  const [weather, setWeather] = useState<WeatherSnapshot | null>(null);

  const load = useCallback(async () => {
    setStatus('loading');
    try {
      const { status: permission } = await Location.requestForegroundPermissionsAsync();
      if (permission !== 'granted') {
        setStatus('error');
        return;
      }
      const position = await Location.getCurrentPositionAsync({});
      const snapshot = await fetchWeather(position.coords.latitude, position.coords.longitude);
      setWeather(snapshot);
      setStatus('ready');
    } catch {
      setStatus('error');
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  return (
    <View style={[{ backgroundColor: Colors.charcoal, padding: 24 }, Shadow.card]}>
      {status === 'loading' && <LoadingRow />}

      {status === 'error' && (
        <Pressable onPress={load} className="flex-row items-center justify-between">
          <View className="gap-1">
            <Text className="font-serif text-xl" style={{ color: Colors.cream }}>
              Weather unavailable
            </Text>
            <Text className="font-body text-xs" style={{ color: Colors.mushroom }}>
              Tap to allow location access
            </Text>
          </View>
          <CloudOff size={26} color={Colors.mushroom} strokeWidth={1.25} />
        </Pressable>
      )}

      {status === 'ready' && weather && (
        <View className="flex-row items-center justify-between">
          <View className="gap-1">
            <Text
              className="font-body-medium text-[10px] uppercase"
              style={{ color: Colors.mushroom, letterSpacing: 1.2 }}>
              {TODAY}
            </Text>
            <Text className="font-serif text-4xl" style={{ color: Colors.cream }}>
              {weather.temperature}°
            </Text>
            <Text className="font-body text-xs" style={{ color: Colors.mushroom }}>
              {weather.condition} · {weather.place}
            </Text>
          </View>
          <weather.icon size={40} color={Colors.cream} strokeWidth={1.1} />
        </View>
      )}
    </View>
  );
}

function LoadingRow() {
  const rotate = useSharedValue(0);

  useEffect(() => {
    rotate.value = withRepeat(withTiming(360, { duration: 900 }), -1, false);
  }, [rotate]);

  const spinStyle = useAnimatedStyle(() => ({ transform: [{ rotate: `${rotate.value}deg` }] }));

  return (
    <View className="flex-row items-center justify-between">
      <Text className="font-body text-xs" style={{ color: Colors.mushroom }}>
        Finding your weather…
      </Text>
      <Animated.View style={spinStyle}>
        <Loader size={20} color={Colors.mushroom} strokeWidth={1.25} />
      </Animated.View>
    </View>
  );
}
