import { useLocalSearchParams, useRouter } from 'expo-router';

import { OutfitBuilder } from '@/components/OutfitBuilder';
import { ScreenHeader } from '@/components/ScreenHeader';
import { ScreenScroll } from '@/components/ScreenScroll';
import { useAppData } from '@/lib/store';
import { useToast } from '@/lib/toast';
import type { Outfit } from '@/lib/types';

export default function CreateOutfitScreen() {
  const router = useRouter();
  const { showToast } = useToast();
  const { outfits } = useAppData();
  const { editId } = useLocalSearchParams<{ editId?: string }>();
  const initialOutfit = editId ? outfits.find((o) => o.id === editId) : undefined;

  function handleSaved(outfit: Outfit) {
    showToast(editId ? 'Outfit updated' : 'Outfit saved to your archive');
    router.replace(`/saved/${outfit.id}`);
  }

  return (
    <ScreenScroll>
      <ScreenHeader
        title={initialOutfit ? 'Edit Outfit' : 'Create an Outfit'}
        subtitle="Curate pieces from your closet"
        showBack={!!editId}
      />
      <OutfitBuilder key={editId ?? 'new'} initialOutfit={initialOutfit} onSaved={handleSaved} />
    </ScreenScroll>
  );
}
