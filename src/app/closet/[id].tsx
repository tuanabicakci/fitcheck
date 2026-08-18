import { useLocalSearchParams, useRouter } from 'expo-router';
import { Trash2 } from 'lucide-react-native';
import { useState } from 'react';
import { Text, View } from 'react-native';

import { ClosetItemForm } from '@/components/ClosetItemForm';
import { ScreenHeader } from '@/components/ScreenHeader';
import { ScreenScroll } from '@/components/ScreenScroll';
import { ConfirmDialog } from '@/components/y2k/ConfirmDialog';
import { Y2KButton } from '@/components/y2k/Y2KButton';
import { useAppData } from '@/lib/store';
import { useToast } from '@/lib/toast';

export default function ClosetItemDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { getItem, deleteClothingItem, getOutfitsUsingItem } = useAppData();
  const { showToast } = useToast();
  const [confirmOpen, setConfirmOpen] = useState(false);

  const item = getItem(id);

  if (!item) {
    return (
      <ScreenScroll>
        <ScreenHeader title="Item not found" showBack />
      </ScreenScroll>
    );
  }

  const usedIn = getOutfitsUsingItem(item.id);

  async function handleDelete() {
    try {
      await deleteClothingItem(item!.id);
      setConfirmOpen(false);
      showToast('Item removed from closet');
      router.back();
    } catch {
      showToast('Could not delete this item', 'error');
      setConfirmOpen(false);
    }
  }

  return (
    <ScreenScroll>
      <ScreenHeader
        title="Edit Item"
        showBack
        right={
          <Y2KButton label="Delete" size="sm" variant="danger" icon={Trash2} onPress={() => setConfirmOpen(true)} />
        }
      />
      <ClosetItemForm item={item} onCancel={() => router.back()} onDone={() => router.back()} />

      <ConfirmDialog
        visible={confirmOpen}
        title="Delete this item?"
        message={
          usedIn.length > 0
            ? `"${item.name}" is used in ${usedIn.length} saved outfit${usedIn.length === 1 ? '' : 's'} (${usedIn
                .map((o) => o.name)
                .join(', ')}). Deleting it will leave that slot empty in those outfits.`
            : `"${item.name}" will be permanently removed from your closet.`
        }
        confirmLabel="Delete Item"
        onConfirm={handleDelete}
        onCancel={() => setConfirmOpen(false)}
      />
    </ScreenScroll>
  );
}
