import { Heart, Shuffle } from 'lucide-react-native';
import { useEffect, useMemo, useState } from 'react';
import { Pressable, Text, TextInput, View } from 'react-native';

import { useAppData } from '@/lib/store';
import { useToast } from '@/lib/toast';
import { Colors } from '@/lib/theme';
import {
  MOODS,
  OCCASIONS,
  OCCASION_LABELS,
  OPTIONAL_CATEGORIES,
  SEASONS,
  SEASON_LABELS,
  type ClothingCategory,
  type Occasion,
  type Outfit,
  type OutfitMode,
  type OutfitSlot,
  type Season,
} from '@/lib/types';
import { pickRandom } from '@/lib/utils';

import { AddCategoryButton } from './AddCategoryButton';
import { ClosetItemForm } from './ClosetItemForm';
import { SwipeableClosetSlot } from './SwipeableClosetSlot';
import { FilterChips } from './y2k/FilterChips';
import { Y2KButton } from './y2k/Y2KButton';
import { Y2KModal } from './y2k/Y2KModal';
import { Y2KTextInput } from './y2k/Y2KTextInput';

interface OutfitBuilderProps {
  initialOutfit?: Outfit;
  onSaved: (outfit: Outfit) => void;
}

export function OutfitBuilder({ initialOutfit, onSaved }: OutfitBuilderProps) {
  const { getItemsByCategory, addOutfit, updateOutfit, toggleFavoriteOutfit, closetItems } = useAppData();
  const { showToast } = useToast();
  const isEditing = !!initialOutfit;
  const [saving, setSaving] = useState(false);

  const [mode, setMode] = useState<OutfitMode>(initialOutfit?.mode ?? 'top-bottom');
  const [optionalCategories, setOptionalCategories] = useState<ClothingCategory[]>(() =>
    initialOutfit ? initialOutfit.slots.map((s) => s.category).filter((c) => OPTIONAL_CATEGORIES.includes(c)) : [],
  );
  const [selection, setSelection] = useState<Record<string, string | null>>(() => {
    const base: Record<string, string | null> = {};
    initialOutfit?.slots.forEach((s) => {
      base[s.category] = s.itemId;
    });
    return base;
  });
  const [locked, setLocked] = useState<Set<ClothingCategory>>(new Set());
  const [quickAddCategory, setQuickAddCategory] = useState<ClothingCategory | null>(null);

  const [saveModalOpen, setSaveModalOpen] = useState(false);
  const [name, setName] = useState(initialOutfit?.name ?? '');
  const [occasion, setOccasion] = useState<Occasion | undefined>(initialOutfit?.occasion);
  const [season, setSeason] = useState<Season | undefined>(initialOutfit?.season);
  const [mood, setMood] = useState<string | undefined>(initialOutfit?.mood);
  const [notes, setNotes] = useState(initialOutfit?.notes ?? '');
  const [favorite, setFavorite] = useState(initialOutfit?.favorite ?? false);

  const coreCategories: ClothingCategory[] = mode === 'full-body' ? ['dresses', 'shoes'] : ['tops', 'bottoms', 'shoes'];
  const activeCategories = useMemo(() => [...coreCategories, ...optionalCategories], [mode, optionalCategories.join(',')]);

  useEffect(() => {
    setSelection((prev) => {
      const next = { ...prev };
      let changed = false;
      activeCategories.forEach((cat) => {
        if (next[cat] == null) {
          const firstId = getItemsByCategory(cat)[0]?.id ?? null;
          if (firstId !== next[cat]) {
            next[cat] = firstId;
            changed = true;
          }
        }
      });
      return changed ? next : prev;
    });
    // Re-attempts seeding whenever closet data (re)loads, since data hydrates
    // asynchronously from storage and may still be empty on first mount.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeCategories.join(','), closetItems]);

  function toggleLock(cat: ClothingCategory) {
    setLocked((prev) => {
      const next = new Set(prev);
      if (next.has(cat)) next.delete(cat);
      else next.add(cat);
      return next;
    });
  }

  function addCategory(cat: ClothingCategory) {
    setOptionalCategories((prev) => [...prev, cat]);
  }

  function removeCategory(cat: ClothingCategory) {
    setOptionalCategories((prev) => prev.filter((c) => c !== cat));
    setLocked((prev) => {
      const next = new Set(prev);
      next.delete(cat);
      return next;
    });
  }

  function randomize() {
    setSelection((prev) => {
      const next = { ...prev };
      activeCategories.forEach((cat) => {
        if (locked.has(cat)) return;
        const items = getItemsByCategory(cat);
        if (items.length === 0) return;
        const candidates = items.filter((i) => i.id !== prev[cat]);
        const pick = pickRandom(candidates.length ? candidates : items);
        if (pick) next[cat] = pick.id;
      });
      return next;
    });
  }

  async function handleSubmit() {
    if (!name.trim()) {
      showToast('Give this outfit a name first', 'error');
      return;
    }
    const slots: OutfitSlot[] = activeCategories.map((cat) => ({ category: cat, itemId: selection[cat] ?? null }));
    setSaving(true);
    try {
      if (isEditing && initialOutfit) {
        const updated = await updateOutfit(initialOutfit.id, { name: name.trim(), mode, slots, occasion, season, mood, notes, favorite });
        setSaveModalOpen(false);
        onSaved(updated);
      } else {
        const created = await addOutfit({ name: name.trim(), mode, slots, occasion, season, mood, notes });
        if (favorite) await toggleFavoriteOutfit(created.id);
        setSaveModalOpen(false);
        onSaved({ ...created, favorite });
      }
    } catch {
      showToast('Could not save this outfit — try again', 'error');
      setSaving(false);
    }
  }

  const availableOptional = OPTIONAL_CATEGORIES.filter((c) => !optionalCategories.includes(c));

  return (
    <View className="gap-6">
      <View className="flex-row" style={{ borderWidth: 1, borderColor: Colors.hairline }}>
        <ModePill label="Top + Bottom" active={mode === 'top-bottom'} onPress={() => setMode('top-bottom')} />
        <View style={{ width: 1, backgroundColor: Colors.hairline }} />
        <ModePill label="Dress / Jumpsuit" active={mode === 'full-body'} onPress={() => setMode('full-body')} />
      </View>

      <Text className="font-body text-xs leading-5" style={{ color: Colors.stone }}>
        Swipe a card or use the arrows to cycle items. Lock the pieces you want to keep.
      </Text>

      <Y2KButton label="Randomize Outfit" icon={Shuffle} variant="outline" fullWidth onPress={randomize} />

      <View className="gap-6">
        {activeCategories.map((cat) => (
          <SwipeableClosetSlot
            key={cat}
            category={cat}
            items={getItemsByCategory(cat)}
            selectedItemId={selection[cat] ?? null}
            onChangeItem={(id) => setSelection((prev) => ({ ...prev, [cat]: id }))}
            locked={locked.has(cat)}
            onToggleLock={() => toggleLock(cat)}
            removable={OPTIONAL_CATEGORIES.includes(cat)}
            onRemove={() => removeCategory(cat)}
            onAddItem={() => setQuickAddCategory(cat)}
            height={mode === 'full-body' && cat === 'dresses' ? 360 : 290}
          />
        ))}
      </View>

      <AddCategoryButton available={availableOptional} onAdd={addCategory} />

      <Y2KButton label={isEditing ? 'Update Outfit' : 'Save Outfit'} size="lg" fullWidth onPress={() => setSaveModalOpen(true)} />

      <Y2KModal visible={saveModalOpen} onClose={() => setSaveModalOpen(false)} title={isEditing ? 'Update This Fit' : 'Save This Fit'}>
        <Y2KTextInput label="Outfit Name" placeholder="e.g. Weekend in the Country" value={name} onChangeText={setName} />

        <View className="gap-2">
          <Text className="font-body-medium text-[10px] uppercase" style={{ color: Colors.stone, letterSpacing: 1.4 }}>
            Occasion
          </Text>
          <FilterChips
            options={OCCASIONS.map((o) => ({ value: o, label: OCCASION_LABELS[o] }))}
            selected={occasion ? [occasion] : []}
            onToggle={(v) => setOccasion((prev) => (prev === v ? undefined : (v as Occasion)))}
          />
        </View>

        <View className="gap-2">
          <Text className="font-body-medium text-[10px] uppercase" style={{ color: Colors.stone, letterSpacing: 1.4 }}>
            Season
          </Text>
          <FilterChips
            scrollable={false}
            options={SEASONS.map((s) => ({ value: s, label: SEASON_LABELS[s] }))}
            selected={season ? [season] : []}
            onToggle={(v) => setSeason((prev) => (prev === v ? undefined : (v as Season)))}
          />
        </View>

        <View className="gap-2">
          <Text className="font-body-medium text-[10px] uppercase" style={{ color: Colors.stone, letterSpacing: 1.4 }}>
            Mood
          </Text>
          <FilterChips
            scrollable={false}
            options={MOODS.map((m) => ({ value: m, label: m }))}
            selected={mood ? [mood] : []}
            onToggle={(v) => setMood((prev) => (prev === v ? undefined : v))}
          />
        </View>

        <View className="gap-2">
          <Text className="font-body-medium text-[10px] uppercase" style={{ color: Colors.stone, letterSpacing: 1.4 }}>
            Notes
          </Text>
          <View className="px-1 py-2" style={{ borderBottomWidth: 1, borderColor: Colors.hairline }}>
            <TextInput
              placeholder="Where are you wearing this?"
              placeholderTextColor={Colors.mushroom}
              value={notes}
              onChangeText={setNotes}
              multiline
              className="font-body text-sm"
              style={{ color: Colors.charcoal, minHeight: 46, textAlignVertical: 'top' }}
            />
          </View>
        </View>

        <Pressable
          onPress={() => setFavorite((v) => !v)}
          className="flex-row items-center gap-2 self-start px-4 py-2"
          style={{ borderWidth: 1, borderColor: favorite ? Colors.charcoal : Colors.hairline }}>
          <Heart size={13} color={Colors.burgundy} strokeWidth={1.5} fill={favorite ? Colors.burgundy : 'transparent'} />
          <Text className="font-body-medium text-[10px] uppercase" style={{ color: Colors.charcoal, letterSpacing: 0.8 }}>
            Mark as favorite
          </Text>
        </Pressable>

        <Y2KButton label={isEditing ? 'Update Outfit' : 'Save Outfit'} fullWidth loading={saving} onPress={handleSubmit} />
      </Y2KModal>

      <Y2KModal visible={!!quickAddCategory} onClose={() => setQuickAddCategory(null)} title="Quick Add Item">
        {quickAddCategory && (
          <ClosetItemForm
            initialCategory={quickAddCategory}
            onCancel={() => setQuickAddCategory(null)}
            onDone={(created) => {
              setSelection((prev) => ({ ...prev, [quickAddCategory]: created.id }));
              setQuickAddCategory(null);
            }}
          />
        )}
      </Y2KModal>
    </View>
  );
}

function ModePill({ label, active, onPress }: { label: string; active: boolean; onPress: () => void }) {
  return (
    <Pressable
      onPress={onPress}
      className="flex-1 items-center py-3"
      style={{ backgroundColor: active ? Colors.charcoal : 'transparent' }}>
      <Text
        className="font-body-medium text-[11px] uppercase"
        style={{ color: active ? Colors.cream : Colors.stone, letterSpacing: 0.8 }}>
        {label}
      </Text>
    </Pressable>
  );
}
