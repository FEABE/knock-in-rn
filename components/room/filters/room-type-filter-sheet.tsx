import { Pressable, Text, View } from 'react-native';

import { ROOM_TYPES, type RoomType } from '@/lib/onboarding';

import { FilterSheet } from './filter-sheet';
import { useRoomTypeFilterSheet } from './use-room-type-filter-sheet';

export function RoomTypeFilterBody({
  value,
  onChange,
}: {
  value: RoomType[];
  onChange: (next: RoomType[]) => void;
}) {
  const isAll = value.length === 0;

  const toggle = (rt: RoomType) => {
    onChange(value.includes(rt) ? value.filter((p) => p !== rt) : [...value, rt]);
  };

  return (
    <View className="gap-2">
      <Pressable
        onPress={() => onChange([])}
        className={`items-center rounded-xl border py-3 active:opacity-80 ${
          isAll ? 'border-[#256EF4] bg-[#256EF4]/10' : 'border-neutral-200 bg-white'
        }`}
      >
        <Text className={isAll ? 'text-sm font-medium text-[#256EF4]' : 'text-sm text-neutral-700'}>
          전체
        </Text>
      </Pressable>
      {ROOM_TYPES.map((rt) => {
        const selected = value.includes(rt.value);
        return (
          <Pressable
            key={rt.value}
            onPress={() => toggle(rt.value)}
            className={`items-center rounded-xl border py-3 active:opacity-80 ${
              selected ? 'border-[#256EF4] bg-[#256EF4]/10' : 'border-neutral-200 bg-white'
            }`}
          >
            <Text
              className={
                selected ? 'text-sm font-medium text-[#256EF4]' : 'text-sm text-neutral-700'
              }
            >
              {rt.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

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
  const { draft, setDraft, reset, apply } = useRoomTypeFilterSheet({ open, value, onChange });

  return (
    <FilterSheet
      open={open}
      onOpenChange={onOpenChange}
      title="룸 형태"
      onReset={reset}
      onApply={apply}
    >
      <RoomTypeFilterBody value={draft} onChange={setDraft} />
    </FilterSheet>
  );
}
