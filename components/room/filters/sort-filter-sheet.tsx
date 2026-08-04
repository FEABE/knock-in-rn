import { Pressable, Text, View } from 'react-native';

import { FilterSheet } from './filter-sheet';

export type RoomSortValue = 'latest' | 'views';

const OPTIONS: { value: RoomSortValue; label: string }[] = [
  { value: 'latest', label: '최신순' },
  { value: 'views', label: '조회순' },
];

export function SortFilterSheet({
  open,
  onOpenChange,
  value,
  onChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  value: RoomSortValue;
  onChange: (next: RoomSortValue) => void;
}) {
  return (
    <FilterSheet open={open} onOpenChange={onOpenChange} title="정렬">
      <View className="gap-5 pb-2">
        {OPTIONS.map((option) => {
          const selected = option.value === value;
          return (
            <Pressable
              key={option.value}
              onPress={() => onChange(option.value)}
              className="flex-row items-center gap-3 active:opacity-70"
            >
              <View
                className={`h-5 w-5 items-center justify-center rounded-full border-2 ${
                  selected ? 'border-[#256EF4]' : 'border-[#DADAE8]'
                }`}
              >
                {selected ? <View className="h-2.5 w-2.5 rounded-full bg-[#256EF4]" /> : null}
              </View>
              <Text className="text-[15px] leading-[23px] text-[#17171B]">{option.label}</Text>
            </Pressable>
          );
        })}
      </View>
    </FilterSheet>
  );
}
