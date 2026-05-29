import { useState } from 'react';
import { Pressable, Text, View } from 'react-native';

import { ROOM_TYPES, type RoomType } from '@/lib/onboarding';

import { FilterSheet } from './filter-sheet';

export type RoomTypeFilterSheetProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  value: RoomType[];
  onChange: (next: RoomType[]) => void;
};

export function RoomTypeFilterSheet({
  open,
  onOpenChange,
  value,
  onChange,
}: RoomTypeFilterSheetProps) {
  const [draft, setDraft] = useState<RoomType[]>(value);
  const isAll = draft.length === 0;

  const toggle = (rt: RoomType) => {
    setDraft((prev) =>
      prev.includes(rt) ? prev.filter((p) => p !== rt) : [...prev, rt],
    );
  };

  return (
    <FilterSheet
      open={open}
      onOpenChange={onOpenChange}
      title="룸 형태"
      onReset={() => setDraft([])}
      onApply={() => onChange(draft)}
    >
      <View className="gap-2">
        <Pressable
          onPress={() => setDraft([])}
          className={`items-center rounded-xl border py-3 active:opacity-80 ${
            isAll
              ? 'border-violet-600 bg-violet-50'
              : 'border-neutral-200 bg-white'
          }`}
        >
          <Text
            className={
              isAll
                ? 'text-sm font-medium text-violet-700'
                : 'text-sm text-neutral-700'
            }
          >
            전체
          </Text>
        </Pressable>
        {ROOM_TYPES.map((rt) => {
          const selected = draft.includes(rt.value);
          return (
            <Pressable
              key={rt.value}
              onPress={() => toggle(rt.value)}
              className={`items-center rounded-xl border py-3 active:opacity-80 ${
                selected
                  ? 'border-violet-600 bg-violet-50'
                  : 'border-neutral-200 bg-white'
              }`}
            >
              <Text
                className={
                  selected
                    ? 'text-sm font-medium text-violet-700'
                    : 'text-sm text-neutral-700'
                }
              >
                {rt.label}
              </Text>
            </Pressable>
          );
        })}
      </View>
    </FilterSheet>
  );
}
