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

const ROOM_TYPE_CHIP_LABEL: Record<string, string> = {
  'one-room': '원룸',
  'two-room': '투룸',
  'three-room+': '쓰리룸+',
  officetel: '오피스텔',
  'share-house': '쉐어하우스',
  apt: '아파트',
  villa: '빌라',
};

function withMoreSuffix(first: string, total: number): string {
  return total > 1 ? `${first} 외 ${total - 1}개` : first;
}

/**
 * 검색창의 아이콘/플레이스홀더를 세로 가운데로 맞춘다.
 * Android 기본 includeFontPadding 이 글리프 위쪽에 비대칭 여백을 넣어
 * items-center 로도 내용이 위로 치우쳐 보이는 문제를 없앤다.
 */
const SEARCH_GLYPH_STYLE = { includeFontPadding: false, textAlignVertical: 'center' } as const;

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
  const rentActive =
    filter.rentMin !== initialFilter.rentMin || filter.rentMax !== initialFilter.rentMax;
  const depositActive =
    filter.depositMin !== initialFilter.depositMin ||
    filter.depositMax !== initialFilter.depositMax;
  const budgetActive = rentActive || depositActive;

  const regionLabel =
    filter.regions.length > 0
      ? withMoreSuffix(
          `${filter.regions[0].city} ${filter.regions[0].district}`,
          filter.regions.length,
        )
      : '지역';

  const genderLabel =
    filter.gender === 'male' ? '남성' : filter.gender === 'female' ? '여성' : '성별';

  // 예산은 범위 값이 길어 칩이 넘치므로 적용 여부와 무관하게 '예산' 라벨만 유지한다.
  const budgetLabel = '예산';

  const roomTypeLabel =
    filter.roomTypes.length > 0
      ? withMoreSuffix(
          ROOM_TYPE_CHIP_LABEL[filter.roomTypes[0]] ?? filter.roomTypes[0],
          filter.roomTypes.length,
        )
      : '방 형태';

  return (
    <>
      <Pressable
        onPress={onSearchPress}
        className="mx-4 mt-[19px] h-[38px] flex-row items-center gap-1.5 rounded bg-[#F6F6FA] px-3 active:opacity-80"
      >
        <Ionicons name="search-outline" size={18} color="#AAAABA" style={SEARCH_GLYPH_STYLE} />
        <Text
          numberOfLines={1}
          style={SEARCH_GLYPH_STYLE}
          className={`flex-1 text-sm ${searchQuery ? 'text-[#3F3F47]' : 'text-[#AAAABA]'}`}
        >
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
          label={regionLabel}
          selected={filter.regions.length > 0}
          onPress={() => onFilterPress('region')}
        />
        <ReadyFilterChip
          label={genderLabel}
          selected={filter.gender !== 'any'}
          onPress={() => onFilterPress('gender')}
        />
        <ReadyFilterChip
          label={budgetLabel}
          selected={budgetActive}
          onPress={() => onFilterPress('budget')}
        />
        <ReadyFilterChip
          label={roomTypeLabel}
          selected={filter.roomTypes.length > 0}
          onPress={() => onFilterPress('roomType')}
        />
      </ScrollView>
    </>
  );
}
