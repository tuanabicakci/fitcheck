import * as Haptics from 'expo-haptics';
import { usePathname, useRouter } from 'expo-router';
import { Bookmark, House, Shirt, User } from 'lucide-react-native';
import { Plus } from 'lucide-react-native';
import { Platform, Pressable, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Colors, Shadow } from '@/lib/theme';

export const NAV_HEIGHT = 66;

const TABS = [
  { key: '/', label: 'Home', icon: House },
  { key: '/closet', label: 'Closet', icon: Shirt },
  { key: '/saved', label: 'Saved', icon: Bookmark },
  { key: '/profile', label: 'Profile', icon: User },
] as const;

export function BottomNavigation() {
  const pathname = usePathname();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const bottomInset = Platform.OS === 'web' ? 10 : Math.max(insets.bottom, 10);

  const isActive = (key: string) => (key === '/' ? pathname === '/' : pathname.startsWith(key));

  const leftTabs = TABS.slice(0, 2);
  const rightTabs = TABS.slice(2);

  const go = (key: string) => router.push(key as never);

  return (
    <View
      pointerEvents="box-none"
      style={{ position: 'absolute', left: 0, right: 0, bottom: 0, alignItems: 'center' }}>
      <View
        style={{
          height: NAV_HEIGHT + bottomInset,
          paddingBottom: bottomInset,
          width: '100%',
          flexDirection: 'row',
          backgroundColor: Colors.cream,
          borderTopWidth: 1,
          borderColor: Colors.hairline,
        }}>
        {leftTabs.map((tab) => (
          <NavItem key={tab.key} tab={tab} active={isActive(tab.key)} onPress={() => go(tab.key)} />
        ))}
        <View style={{ width: 78 }} />
        {rightTabs.map((tab) => (
          <NavItem key={tab.key} tab={tab} active={isActive(tab.key)} onPress={() => go(tab.key)} />
        ))}
      </View>

      <Pressable
        onPress={() => {
          if (Platform.OS !== 'web') Haptics.selectionAsync();
          router.push('/create');
        }}
        style={{ position: 'absolute', bottom: bottomInset + NAV_HEIGHT - 30, alignSelf: 'center' }}>
        <View
          style={[
            {
              width: 58,
              height: 58,
              borderRadius: 29,
              alignItems: 'center',
              justifyContent: 'center',
              backgroundColor: Colors.charcoal,
              borderWidth: 4,
              borderColor: Colors.cream,
            },
            Shadow.lifted,
          ]}>
          <Plus size={22} color={Colors.cream} strokeWidth={1.5} />
        </View>
        <Text
          className="font-body-medium text-center uppercase"
          style={{ fontSize: 9, color: Colors.charcoal, marginTop: 4, letterSpacing: 0.6 }}>
          Create
        </Text>
      </Pressable>
    </View>
  );
}

function NavItem({
  tab,
  active,
  onPress,
}: {
  tab: { key: string; label: string; icon: typeof House };
  active: boolean;
  onPress: () => void;
}) {
  const Icon = tab.icon;
  return (
    <Pressable onPress={onPress} style={{ flex: 1, alignItems: 'center', justifyContent: 'center', gap: 4 }}>
      <Icon size={18} color={active ? Colors.charcoal : Colors.mushroom} strokeWidth={1.5} />
      <Text
        className="font-body-medium uppercase"
        style={{ fontSize: 9, color: active ? Colors.charcoal : Colors.mushroom, letterSpacing: 0.6 }}>
        {tab.label}
      </Text>
      {active && <View style={{ width: 3, height: 3, borderRadius: 1.5, backgroundColor: Colors.charcoal, marginTop: 1 }} />}
    </Pressable>
  );
}
