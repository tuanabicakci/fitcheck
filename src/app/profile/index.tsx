import { Heart, RotateCw, Shirt, ShoppingBag, Star, User } from 'lucide-react-native';
import { useMemo, useState } from 'react';
import { Text, View } from 'react-native';

import { ScreenScroll } from '@/components/ScreenScroll';
import { ConfirmDialog } from '@/components/y2k/ConfirmDialog';
import { Y2KButton } from '@/components/y2k/Y2KButton';
import { useAppData } from '@/lib/store';
import { Colors } from '@/lib/theme';
import { useToast } from '@/lib/toast';

export default function ProfileScreen() {
  const { closetItems, outfits, resetToSampleData } = useAppData();
  const { showToast } = useToast();
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [resetting, setResetting] = useState(false);

  const stats = useMemo(
    () => ({
      items: closetItems.length,
      outfits: outfits.length,
      favorites: outfits.filter((o) => o.favorite).length,
      totalWears: outfits.reduce((sum, o) => sum + o.wearCount, 0),
    }),
    [closetItems, outfits],
  );

  return (
    <ScreenScroll>
      <View className="items-center gap-3 py-2">
        <View
          style={{
            width: 76,
            height: 76,
            borderRadius: 38,
            borderWidth: 1,
            borderColor: Colors.hairline,
            backgroundColor: Colors.charcoal,
            alignItems: 'center',
            justifyContent: 'center',
          }}>
          <User size={30} color={Colors.cream} strokeWidth={1.25} />
        </View>
        <View className="items-center gap-0.5">
          <Text className="font-serif text-2xl text-charcoal">Your Wardrobe</Text>
          <Text className="font-body text-[10px] uppercase" style={{ color: Colors.stone, letterSpacing: 1 }}>
            Est. {new Date().getFullYear()}
          </Text>
        </View>
      </View>

      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 14 }}>
        <ProfileStat icon={Shirt} label="Closet Items" value={stats.items} />
        <ProfileStat icon={ShoppingBag} label="Saved Outfits" value={stats.outfits} />
        <ProfileStat icon={Heart} label="Favorites" value={stats.favorites} />
        <ProfileStat icon={Star} label="Total Wears" value={stats.totalWears} />
      </View>

      <View className="p-5 gap-2" style={{ borderWidth: 1, borderColor: Colors.hairline, backgroundColor: Colors.cream }}>
        <Text className="font-serif text-lg text-charcoal">About Fit Check</Text>
        <Text className="font-body text-xs leading-5" style={{ color: Colors.stone }}>
          A considered closet and outfit archive, kept in sync for you automatically — no account to set up,
          just your wardrobe.
        </Text>
      </View>

      <View className="p-5 gap-3" style={{ borderWidth: 1, borderStyle: 'dashed', borderColor: Colors.hairline }}>
        <Text className="font-body-medium text-[10px] uppercase" style={{ color: Colors.stone, letterSpacing: 1 }}>
          Prototype Tools
        </Text>
        <Text className="font-body text-xs" style={{ color: Colors.stone }}>
          Reset your closet and saved outfits back to the sample starter data.
        </Text>
        <Y2KButton
          label="Reset Sample Data"
          icon={RotateCw}
          variant="outline"
          loading={resetting}
          onPress={() => setConfirmOpen(true)}
        />
      </View>

      <ConfirmDialog
        visible={confirmOpen}
        title="Reset everything?"
        message="This clears your closet and saved outfits and restores the original sample data. This can't be undone."
        confirmLabel="Reset"
        onCancel={() => setConfirmOpen(false)}
        onConfirm={async () => {
          setConfirmOpen(false);
          setResetting(true);
          try {
            await resetToSampleData();
            showToast('Reset to sample data');
          } catch {
            showToast('Could not reset your data', 'error');
          } finally {
            setResetting(false);
          }
        }}
      />
    </ScreenScroll>
  );
}

function ProfileStat({ icon: Icon, label, value }: { icon: typeof Shirt; label: string; value: number }) {
  return (
    <View className="p-4 gap-3" style={{ borderWidth: 1, borderColor: Colors.hairline, backgroundColor: Colors.cream, width: '47%' }}>
      <Icon size={17} color={Colors.espresso} strokeWidth={1.25} />
      <Text className="font-serif text-2xl text-charcoal">{value}</Text>
      <Text className="font-body-medium text-[9px] uppercase" style={{ color: Colors.stone, letterSpacing: 0.8 }}>
        {label}
      </Text>
    </View>
  );
}
