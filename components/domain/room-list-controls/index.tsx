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
        className="mx-4 mt-[19px] h-[38px] flex-row items-center gap-1.5 rounded bg-[#F6F6FA] px-3 active:opacity-80"
      >
        <Ionicons name="search-outline" size={18} color="#AAAABA" />
        <Text className={`flex-1 text-sm ${searchQuery ? 'text-[#3F3F47]' : 'text-[#AAAABA]'}`}>
          {searchQuery || '지역, 동 이름 검색'}
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
        contentContainerClassName="items-center gap-2 px-4 pb-5 pt-3"
      >
        <FilterChip label={sortLabel} outlined onPress={onSortPress} />
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
  outlined,
  onPress,
}: {
  label: string;
  active?: boolean;
  outlined?: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      className={`h-[38px] flex-row items-center gap-1 rounded-full border px-3.5 active:opacity-80 ${
        active
          ? 'border-[#4C87F6] bg-[#EEF4FF]'
          : outlined
            ? 'border-[#DADAE8] bg-white'
            : 'border-transparent bg-[#F6F6FA]'
      }`}
    >
      <Text className={active ? 'text-sm font-medium text-[#256EF4]' : 'text-sm text-[#696976]'}>
        {label}
      </Text>
      <Ionicons name="chevron-down" size={14} color={active ? '#256EF4' : '#696976'} />
    </Pressable>
  );
}
