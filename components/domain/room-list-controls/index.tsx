import { Ionicons } from '@expo/vector-icons';
import { Pressable, ScrollView, Text } from 'react-native';

import type { RoomFilterValue } from '@/components/room/filters';
import { ReadyFilterChip } from '@/components/ui/ready-to-dev-components';

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
        <ReadyFilterChip label={sortLabel} onPress={onSortPress} />
        <ReadyFilterChip
          label="지역"
          count={filter.regions.length}
          selected={filter.regions.length > 0}
          onPress={() => onFilterPress('region')}
        />
        <ReadyFilterChip
          label="성별"
          selected={filter.gender !== 'any'}
          onPress={() => onFilterPress('gender')}
        />
        <ReadyFilterChip
          label="예산"
          selected={budgetActive}
          onPress={() => onFilterPress('budget')}
        />
        <ReadyFilterChip
          label="방 형태"
          count={filter.roomTypes.length}
          selected={filter.roomTypes.length > 0}
          onPress={() => onFilterPress('roomType')}
        />
      </ScrollView>
    </>
  );
}
