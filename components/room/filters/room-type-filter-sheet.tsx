import { Pressable, Text, View } from 'react-native';

import {
  ReadyErrorState,
  ReadyLoadingState,
} from '@/components/ui/ready-to-dev-feedback';
import { useRoomTypeOptions } from '@/lib/api';
import type { RoomType } from '@/lib/onboarding';

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
  const roomTypes = useRoomTypeOptions();

  if (roomTypes.loading) return <ReadyLoadingState label="룸 형태를 불러오는 중..." compact />;
  if (roomTypes.error) {
    return (
      <ReadyErrorState
        title="룸 형태를 불러오지 못했어요"
        description={roomTypes.error}
        onRetry={roomTypes.reload}
        compact
      />
    );
  }

  const toggle = (rt: RoomType) => {
    if (value.includes(rt)) {
      onChange(value.filter((p) => p !== rt));
      return;
    }
    if (value.length < 3) onChange([...value, rt]);
  };

  return (
    <View className="gap-3">
      <Text className="text-xs text-[#AAAABA]">최대 3개 선택 가능</Text>
      <View className="flex-row flex-wrap gap-2">
        <Pressable
          onPress={() => onChange([])}
          className={`h-9 min-w-[60px] items-center justify-center rounded-full border px-3 active:opacity-80 ${
            isAll ? 'border-[#256EF4] bg-[#256EF4]/10' : 'border-neutral-200 bg-white'
          }`}
        >
          <Text
            className={
              isAll ? 'text-[15px] font-medium text-[#256EF4]' : 'text-[15px] text-[#696976]'
            }
          >
            전체
          </Text>
        </Pressable>
        {roomTypes.options.map((rt) => {
          const selected = value.includes(rt.value);
          const disabled = !selected && value.length >= 3;
          return (
            <Pressable
              key={rt.value}
              onPress={() => toggle(rt.value)}
              disabled={disabled}
              className={`h-9 items-center justify-center rounded-full border px-3 active:opacity-80 ${
                selected
                  ? 'border-[#256EF4] bg-[#256EF4]/10'
                  : disabled
                    ? 'border-neutral-100 bg-neutral-50'
                    : 'border-neutral-200 bg-white'
              }`}
            >
              <Text
                className={
                  selected
                    ? 'text-[15px] font-medium text-[#256EF4]'
                    : disabled
                      ? 'text-[15px] text-neutral-300'
                      : 'text-[15px] text-[#696976]'
                }
              >
                {rt.label}
              </Text>
            </Pressable>
          );
        })}
      </View>
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
