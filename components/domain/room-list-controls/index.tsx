import { Ionicons } from '@expo/vector-icons';
import { Pressable, ScrollView, Text } from 'react-native';

import type { RoomFilterValue } from '@/components/room/filters';

export type RoomListFilterKey = 'region' | 'gender' | 'budget' | 'roomType';

type RoomListControlsProps = {
  filter: RoomFilterValue;
  initialFilter: RoomFilterValue;
  sortLabel: string;
  searchQuery?: string;
  onSearchPress: () => void;
  onSearchClear?: () => void;
  onSortPress: () => void;
  onFilterPress: (key: RoomListFilterKey) => void;
};

export function RoomListControls({
  filter,
  initialFilter,
  sortLabel,
  searchQuery,
  onSearchPress,
  onSearchClear,
  onSortPress,
  onFilterPress,
}: RoomListControlsProps) {
  const budgetActive =
    filter.rentMin !== initialFilter.rentMin ||
    filter.rentMax !== initialFilter.rentMax ||
    filter.depositMin !== initialFilter.depositMin ||
    filter.depositMax !== initialFilter.depositMax;

  return (
    <>
      <Pressable
        onPress={onSearchPress}
        className="mx-4 mt-4 h-8 flex-row items-center gap-1 rounded border border-[#ECECF3] bg-[#F6F6FA] px-2 active:opacity-80"
      >
        <Ionicons name="search-outline" size={16} color="#AAAABA" />
        <Text className={`flex-1 text-sm ${searchQuery ? 'text-[#3F3F47]' : 'text-[#AAAABA]'}`}>
          {searchQuery || '검색'}
        </Text>
        {searchQuery && onSearchClear ? (
          <Pressable
            onPress={(event) => {
              event.stopPropagation();
              onSearchClear();
            }}
            hitSlop={6}
          >
            <Ionicons name="close-circle" size={16} color="#AAAABA" />
          </Pressable>
        ) : null}
      </Pressable>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={{ flexGrow: 0 }}
        contentContainerClassName="items-center gap-2 px-4 py-4"
      >
        <FilterChip label={sortLabel} onPress={onSortPress} />
        <FilterChip
          label={filter.regions.length > 0 ? `지역 ${filter.regions.length}` : '지역'}
          active={filter.regions.length > 0}
          onPress={() => onFilterPress('region')}
        />
        <FilterChip
          label={filter.gender === 'any' ? '성별' : filter.gender === 'male' ? '남성만' : '여성만'}
          active={filter.gender !== 'any'}
          onPress={() => onFilterPress('gender')}
        />
        <FilterChip label="예산" active={budgetActive} onPress={() => onFilterPress('budget')} />
        <FilterChip
          label={filter.roomTypes.length > 0 ? `룸 형태 ${filter.roomTypes.length}` : '룸 형태'}
          active={filter.roomTypes.length > 0}
          onPress={() => onFilterPress('roomType')}
        />
      </ScrollView>
    </>
  );
}

function FilterChip({
  label,
  active,
  onPress,
}: {
  label: string;
  active?: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      className={`h-8 flex-row items-center gap-1 rounded-full border px-3 active:opacity-80 ${
        active ? 'border-[#256EF4] bg-[#256EF4]/10' : 'border-[#AAAABA] bg-white'
      }`}
    >
      <Text
        className={active ? 'text-[15px] font-medium text-[#256EF4]' : 'text-[15px] text-[#AAAABA]'}
      >
        {label}
      </Text>
      <Ionicons name="chevron-down" size={14} color={active ? '#256EF4' : '#AAAABA'} />
    </Pressable>
  );
}
