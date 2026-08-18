import { useLocalSearchParams, useRouter } from 'expo-router';

import { ClosetItemForm } from '@/components/ClosetItemForm';
import { ScreenHeader } from '@/components/ScreenHeader';
import { ScreenScroll } from '@/components/ScreenScroll';
import type { ClothingCategory } from '@/lib/types';

export default function NewClosetItemScreen() {
  const router = useRouter();
  const { category } = useLocalSearchParams<{ category?: string }>();

  return (
    <ScreenScroll>
      <ScreenHeader title="Add to Closet" showBack subtitle="Snap a photo and fill in the details" />
      <ClosetItemForm
        initialCategory={category as ClothingCategory | undefined}
        onCancel={() => router.back()}
        onDone={() => router.back()}
      />
    </ScreenScroll>
  );
}
