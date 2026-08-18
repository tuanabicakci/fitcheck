import * as ImageManipulator from 'expo-image-manipulator';
import * as ImagePicker from 'expo-image-picker';
import { Camera, Check, Crop, Scissors, Upload } from 'lucide-react-native';
import { useState } from 'react';
import { ActivityIndicator, Pressable, Text, TextInput, View } from 'react-native';
import Animated, { useAnimatedStyle, withTiming } from 'react-native-reanimated';

import { isBackgroundRemovalConfigured, removeBackground } from '@/lib/backgroundRemoval';
import { CATEGORY_ICONS } from '@/lib/categoryIcons';
import { useAppData } from '@/lib/store';
import { useToast } from '@/lib/toast';
import { CategoryColors, Colors } from '@/lib/theme';
import {
  ALL_CATEGORIES,
  CATEGORY_LABELS,
  SEASONS,
  SEASON_LABELS,
  type ClothingCategory,
  type ClothingItem,
  type Season,
} from '@/lib/types';

import { ClothingImage } from './ClothingImage';
import { FilterChips } from './y2k/FilterChips';
import { Y2KButton } from './y2k/Y2KButton';
import { Y2KTextInput } from './y2k/Y2KTextInput';

interface ClosetItemFormProps {
  initialCategory?: ClothingCategory;
  item?: ClothingItem;
  onDone: (item: ClothingItem) => void;
  onCancel: () => void;
}

export function ClosetItemForm({ initialCategory, item, onDone, onCancel }: ClosetItemFormProps) {
  const { addClothingItem, updateClothingItem } = useAppData();
  const { showToast } = useToast();
  const isEditing = !!item;

  const [imageUri, setImageUri] = useState<string | undefined>(item?.imageUri);
  const [originalImageUri, setOriginalImageUri] = useState<string | undefined>(item?.imageUri);
  const [cutoutUri, setCutoutUri] = useState<string | undefined>(item?.backgroundSimplified ? item?.imageUri : undefined);
  const [backgroundSimplified, setBackgroundSimplified] = useState(!!item?.backgroundSimplified);
  const [removingBackground, setRemovingBackground] = useState(false);
  const [uploadState, setUploadState] = useState<'idle' | 'uploading' | 'ready'>(imageUri ? 'ready' : 'idle');
  const [uploadProgress, setUploadProgress] = useState(0);

  const [name, setName] = useState(item?.name ?? '');
  const [category, setCategory] = useState<ClothingCategory>(item?.category ?? initialCategory ?? 'tops');
  const [color, setColor] = useState(item?.color ?? '');
  const [seasons, setSeasons] = useState<Season[]>(item?.seasons ?? []);
  const [brand, setBrand] = useState(item?.brand ?? '');
  const [style, setStyle] = useState(item?.style ?? '');
  const [notes, setNotes] = useState(item?.notes ?? '');
  const [saving, setSaving] = useState(false);

  async function simulateUpload(uri: string) {
    setUploadState('uploading');
    setUploadProgress(0);
    for (const p of [25, 50, 75, 100]) {
      await new Promise((r) => setTimeout(r, 90));
      setUploadProgress(p);
    }
    setImageUri(uri);
    setOriginalImageUri(uri);
    setCutoutUri(undefined);
    setBackgroundSimplified(false);
    setUploadState('ready');
  }

  async function pickFrom(source: 'camera' | 'library') {
    try {
      const perm =
        source === 'camera'
          ? await ImagePicker.requestCameraPermissionsAsync()
          : await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!perm.granted) {
        showToast('Permission needed to add a photo', 'error');
        return;
      }
      const options: ImagePicker.ImagePickerOptions = {
        mediaTypes: 'images',
        allowsEditing: true,
        aspect: [3, 4],
        quality: 0.85,
      };
      const result = source === 'camera' ? await ImagePicker.launchCameraAsync(options) : await ImagePicker.launchImageLibraryAsync(options);
      if (result.canceled || !result.assets?.[0]) return;
      await simulateUpload(result.assets[0].uri);
    } catch {
      showToast('Could not open photo picker', 'error');
    }
  }

  async function autoCropSquare() {
    if (!imageUri) return;
    try {
      const probe = await ImageManipulator.manipulateAsync(imageUri, []);
      const size = Math.min(probe.width, probe.height);
      const originX = Math.max(0, (probe.width - size) / 2);
      const originY = Math.max(0, (probe.height - size) / 2);
      const format = backgroundSimplified ? ImageManipulator.SaveFormat.PNG : ImageManipulator.SaveFormat.JPEG;
      const cropped = await ImageManipulator.manipulateAsync(
        imageUri,
        [{ crop: { originX, originY, width: size, height: size } }],
        { compress: backgroundSimplified ? 1 : 0.9, format },
      );
      setImageUri(cropped.uri);
      if (backgroundSimplified) setCutoutUri(cropped.uri);
      else setOriginalImageUri(cropped.uri);
      showToast('Cropped to square');
    } catch {
      showToast('Could not crop image', 'error');
    }
  }

  async function toggleCutout() {
    if (backgroundSimplified) {
      setBackgroundSimplified(false);
      if (originalImageUri) setImageUri(originalImageUri);
      return;
    }
    if (cutoutUri) {
      setImageUri(cutoutUri);
      setBackgroundSimplified(true);
      return;
    }
    if (!originalImageUri) return;
    setRemovingBackground(true);
    try {
      const cutout = await removeBackground(originalImageUri);
      setCutoutUri(cutout);
      setImageUri(cutout);
      setBackgroundSimplified(true);
    } catch (e) {
      showToast(e instanceof Error ? e.message : 'Could not cut out background', 'error');
    } finally {
      setRemovingBackground(false);
    }
  }

  function toggleSeason(value: string) {
    const s = value as Season;
    setSeasons((prev) => (prev.includes(s) ? prev.filter((x) => x !== s) : [...prev, s]));
  }

  async function handleSave() {
    if (!name.trim()) {
      showToast('Give this item a name first', 'error');
      return;
    }
    const payload = {
      name: name.trim(),
      category,
      imageUri,
      backgroundSimplified: imageUri ? backgroundSimplified : false,
      color: color.trim() || undefined,
      seasons: seasons.length ? seasons : undefined,
      brand: brand.trim() || undefined,
      style: style.trim() || undefined,
      notes: notes.trim() || undefined,
      swatchColor: imageUri ? undefined : (item?.swatchColor ?? CategoryColors[category]),
    };
    setSaving(true);
    try {
      if (isEditing) {
        const updated = await updateClothingItem(item.id, payload);
        showToast('Item updated');
        onDone(updated);
      } else {
        const created = await addClothingItem(payload);
        showToast('Added to your closet');
        onDone(created);
      }
    } catch {
      showToast('Could not save this item — try again', 'error');
      setSaving(false);
    }
  }

  const CategoryIcon = CATEGORY_ICONS[category];

  return (
    <View className="gap-6">
      {/* Photo section */}
      <View className="items-center gap-3">
        <View
          style={{
            width: 168,
            height: 168,
            borderWidth: 1,
            borderColor: Colors.hairline,
            overflow: 'hidden',
            backgroundColor: Colors.ivory,
          }}>
          {uploadState === 'uploading' ? (
            <UploadingState progress={uploadProgress} />
          ) : (
            <ClothingImage item={{ imageUri, category, swatchColor: undefined, backgroundSimplified }} radius={2} />
          )}
        </View>

        <View className="flex-row gap-2">
          <Y2KButton label="Camera" size="sm" variant="outline" icon={Camera} onPress={() => pickFrom('camera')} />
          <Y2KButton label="Upload" size="sm" variant="outline" icon={Upload} onPress={() => pickFrom('library')} />
        </View>

        {imageUri && uploadState === 'ready' && (
          <View className="flex-row gap-2">
            {isBackgroundRemovalConfigured && (
              <Pressable
                onPress={toggleCutout}
                disabled={removingBackground}
                className="flex-row items-center gap-1.5 px-3 py-1.5"
                style={{
                  borderWidth: 1,
                  borderColor: backgroundSimplified ? Colors.charcoal : Colors.hairline,
                  backgroundColor: backgroundSimplified ? Colors.charcoal : 'transparent',
                  opacity: removingBackground ? 0.6 : 1,
                }}>
                {removingBackground ? (
                  <ActivityIndicator size="small" color={Colors.stone} />
                ) : (
                  <Scissors size={11} color={backgroundSimplified ? Colors.cream : Colors.stone} strokeWidth={1.5} />
                )}
                <Text
                  className="font-body-medium text-[10px] uppercase"
                  style={{ color: backgroundSimplified ? Colors.cream : Colors.stone, letterSpacing: 0.6 }}>
                  {removingBackground ? 'Cutting out…' : 'Cut out'}
                </Text>
                {backgroundSimplified && !removingBackground && <Check size={11} color={Colors.cream} strokeWidth={1.75} />}
              </Pressable>
            )}
            <Pressable
              onPress={autoCropSquare}
              className="flex-row items-center gap-1.5 px-3 py-1.5"
              style={{ borderWidth: 1, borderColor: Colors.hairline }}>
              <Crop size={11} color={Colors.stone} strokeWidth={1.5} />
              <Text className="font-body-medium text-[10px] uppercase" style={{ color: Colors.stone, letterSpacing: 0.6 }}>
                Crop to square
              </Text>
            </Pressable>
          </View>
        )}
      </View>

      <Y2KTextInput label="Item Name" placeholder="e.g. Tailored Wool Coat" value={name} onChangeText={setName} />

      <View className="gap-2">
        <Text className="font-body-medium text-[10px] uppercase" style={{ color: Colors.stone, letterSpacing: 1.4 }}>
          Category
        </Text>
        <FilterChips
          options={ALL_CATEGORIES.map((c) => ({ value: c, label: CATEGORY_LABELS[c], icon: CATEGORY_ICONS[c] }))}
          selected={[category]}
          onToggle={(v) => setCategory(v as ClothingCategory)}
        />
      </View>

      <View className="flex-row gap-4">
        <View className="flex-1">
          <Y2KTextInput label="Color" placeholder="Ivory" value={color} onChangeText={setColor} icon={CategoryIcon} />
        </View>
        <View className="flex-1">
          <Y2KTextInput label="Brand" placeholder="Optional" value={brand} onChangeText={setBrand} />
        </View>
      </View>

      <Y2KTextInput label="Style" placeholder="e.g. Tailored, Minimalist, Classic" value={style} onChangeText={setStyle} />

      <View className="gap-2">
        <Text className="font-body-medium text-[10px] uppercase" style={{ color: Colors.stone, letterSpacing: 1.4 }}>
          Season
        </Text>
        <FilterChips
          scrollable={false}
          options={SEASONS.map((s) => ({ value: s, label: SEASON_LABELS[s] }))}
          selected={seasons}
          onToggle={toggleSeason}
        />
      </View>

      <View className="gap-2">
        <Text className="font-body-medium text-[10px] uppercase" style={{ color: Colors.stone, letterSpacing: 1.4 }}>
          Notes
        </Text>
        <View className="px-1 py-2" style={{ borderBottomWidth: 1, borderColor: Colors.hairline }}>
          <TextInput
            placeholder="Any styling notes..."
            placeholderTextColor={Colors.mushroom}
            value={notes}
            onChangeText={setNotes}
            multiline
            numberOfLines={3}
            className="font-body text-sm"
            style={{ color: Colors.charcoal, minHeight: 56, textAlignVertical: 'top' }}
          />
        </View>
      </View>

      <View className="flex-row gap-3 mt-1">
        <View className="flex-1">
          <Y2KButton label="Cancel" variant="outline" fullWidth onPress={onCancel} disabled={saving} />
        </View>
        <View className="flex-1">
          <Y2KButton
            label={isEditing ? 'Save Changes' : 'Add to Closet'}
            variant="primary"
            fullWidth
            loading={saving}
            onPress={handleSave}
          />
        </View>
      </View>
    </View>
  );
}

function UploadingState({ progress }: { progress: number }) {
  const barStyle = useAnimatedStyle(() => ({
    width: withTiming(`${progress}%`, { duration: 150 }),
  }));
  return (
    <View className="flex-1 items-center justify-center gap-3 px-6">
      <Text className="font-body-medium text-[10px] uppercase" style={{ color: Colors.stone, letterSpacing: 1 }}>
        Uploading
      </Text>
      <View style={{ width: '100%', height: 2, backgroundColor: Colors.beige, overflow: 'hidden' }}>
        <Animated.View style={[{ height: '100%', backgroundColor: Colors.charcoal }, barStyle]} />
      </View>
    </View>
  );
}
