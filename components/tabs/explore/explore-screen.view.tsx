import { Ionicons } from '@expo/vector-icons';
import { ActivityIndicator, Pressable, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { RoomCard, RoommateFindCard } from '@/components/domain';
import { RoomFilterSheet } from '@/components/room/filters';
import { Tabs } from '@/components/ui/headless';

import {
  EXPLORE_SORT_OPTIONS,
  INITIAL_EXPLORE_FILTER,
  type ExploreFilter,
  type ExploreFilterKey,
  type ExploreSort,
  type UseExploreScreenReturn,
} from './use-explore-screen';

export type ExploreScreenViewProps = UseExploreScreenReturn;

export function ExploreScreenView({
  sort,
  filter,
  openSheet,
  visiblePosts,
  visibleMatches,
  matchesLoading,
  setSort,
  setOpenSheet,
  handleFilterChange,
  onSearchPress,
  onOnboardingPress,
  onRoomPress,
  onRoommatePress,
}: ExploreScreenViewProps) {
  return (
    <SafeAreaView className="flex-1 bg-white" edges={['top']}>
      <Header onSearch={onSearchPress} onOnboarding={onOnboardingPress} />

      <Tabs.Root defaultValue="rooms" className="flex-1">
        <Tabs.List className="flex-row">
          {[
            { value: 'rooms', label: '방 찾기' },
            { value: 'roommates', label: '룸메이트 찾기' },
          ].map((tab) => (
            <Tabs.Trigger key={tab.value} value={tab.value} className="flex-1 py-3">
              {({ selected }) => (
                <View
                  className={`items-center border-b-2 pb-2 ${
                    selected ? 'border-[#256EF4]' : 'border-transparent'
                  }`}
                >
                  <Text
                    className={
                      selected
                        ? 'text-base font-semibold text-[#256EF4]'
                        : 'text-base text-neutral-400'
                    }
                  >
                    {tab.label}
                  </Text>
                </View>
              )}
            </Tabs.Trigger>
          ))}
        </Tabs.List>

        <Tabs.Content value="rooms" className="flex-1">
          <FilterRow filter={filter} onOpen={setOpenSheet} />
          <SortRow sort={sort} onChange={setSort} count={visiblePosts.length} />

          <ScrollView className="flex-1" contentContainerClassName="gap-3 p-5 pb-24">
            {visiblePosts.length === 0 ? (
              <EmptyBox message="조건에 맞는 방이 없어요" />
            ) : (
              visiblePosts.map((post) => (
                <RoomCard key={post.id} post={post} onPress={onRoomPress} />
              ))
            )}
          </ScrollView>
        </Tabs.Content>

        <Tabs.Content value="roommates" className="flex-1">
          <ScrollView className="flex-1" contentContainerClassName="gap-3 p-5 pb-24">
            {matchesLoading ? (
              <View className="items-center py-16">
                <ActivityIndicator color="#256EF4" />
                <Text className="mt-3 text-sm text-neutral-400">룸메이트를 불러오는 중...</Text>
              </View>
            ) : visibleMatches.length === 0 ? (
              <EmptyBox message="매칭된 룸메이트가 없어요" />
            ) : (
              visibleMatches.map((match) => (
                <RoommateFindCard key={match.userId} match={match} onPress={onRoommatePress} />
              ))
            )}
          </ScrollView>
        </Tabs.Content>
      </Tabs.Root>

      <RoomFilterSheet
        open={openSheet !== null}
        onOpenChange={(open) => setOpenSheet(open ? openSheet : null)}
        defaultTab={openSheet ?? 'region'}
        value={filter}
        onChange={handleFilterChange}
        initial={INITIAL_EXPLORE_FILTER}
      />
    </SafeAreaView>
  );
}

function Header({ onSearch, onOnboarding }: { onSearch: () => void; onOnboarding: () => void }) {
  return (
    <View className="flex-row items-center justify-between px-4 pb-3 pt-4">
      <Text className="text-[28px] font-extrabold text-neutral-900">로고</Text>
      <View className="flex-row items-center gap-3">
        <Pressable
          onPress={onOnboarding}
          hitSlop={6}
          className="h-9 flex-row items-center gap-1.5 rounded-full bg-[#256EF4]/10 px-3 active:opacity-80"
        >
          <Ionicons name="clipboard-outline" size={16} color="#256EF4" />
          <Text className="text-xs font-semibold text-[#256EF4]">온보딩</Text>
        </Pressable>
        <Pressable onPress={onSearch} hitSlop={6} className="h-9 w-9 items-center justify-center">
          <Ionicons name="search-outline" size={24} color="#111827" />
        </Pressable>
        <Pressable hitSlop={6} className="h-9 w-9 items-center justify-center">
          <Ionicons name="notifications-outline" size={24} color="#111827" />
        </Pressable>
      </View>
    </View>
  );
}

function FilterRow({
  filter,
  onOpen,
}: {
  filter: ExploreFilter;
  onOpen: (key: ExploreFilterKey) => void;
}) {
  const budgetActive =
    filter.rentMin !== INITIAL_EXPLORE_FILTER.rentMin ||
    filter.rentMax !== INITIAL_EXPLORE_FILTER.rentMax ||
    filter.depositMin !== INITIAL_EXPLORE_FILTER.depositMin ||
    filter.depositMax !== INITIAL_EXPLORE_FILTER.depositMax;

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      style={{ flexGrow: 0 }}
      contentContainerClassName="items-center gap-2 px-5 py-3"
    >
      <FilterChip
        label={filter.regions.length > 0 ? `지역 ${filter.regions.length}` : '지역'}
        active={filter.regions.length > 0}
        onPress={() => onOpen('region')}
      />
      <FilterChip
        label={filter.gender === 'any' ? '성별' : filter.gender === 'male' ? '남성만' : '여성만'}
        active={filter.gender !== 'any'}
        onPress={() => onOpen('gender')}
      />
      <FilterChip label="예산" active={budgetActive} onPress={() => onOpen('budget')} />
      <FilterChip
        label={filter.roomTypes.length > 0 ? `룸 형태 ${filter.roomTypes.length}` : '룸 형태'}
        active={filter.roomTypes.length > 0}
        onPress={() => onOpen('roomType')}
      />
    </ScrollView>
  );
}

function FilterChip({
  label,
  active,
  onPress,
}: {
  label: string;
  active?: boolean;
  onPress?: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      className={`flex-row items-center gap-1 rounded-full border px-3 py-1.5 active:opacity-80 ${
        active ? 'border-[#256EF4] bg-[#256EF4]/10' : 'border-neutral-200 bg-white'
      }`}
    >
      <Text className={active ? 'text-xs font-medium text-[#256EF4]' : 'text-xs text-neutral-700'}>
        {label}
      </Text>
      <Text className={active ? 'text-[10px] text-[#256EF4]' : 'text-[10px] text-neutral-400'}>
        ▾
      </Text>
    </Pressable>
  );
}

function SortRow({
  sort,
  onChange,
  count,
}: {
  sort: ExploreSort;
  onChange: (next: ExploreSort) => void;
  count: number;
}) {
  const current =
    EXPLORE_SORT_OPTIONS.find((option) => option.value === sort) ?? EXPLORE_SORT_OPTIONS[0];
  const cycleSort = () => onChange(sort === 'latest' ? 'views' : 'latest');

  return (
    <View className="flex-row items-center justify-between px-5 py-3">
      <Text className="text-sm text-neutral-600">게시물 {count}개</Text>
      <Pressable
        onPress={cycleSort}
        hitSlop={6}
        className="flex-row items-center gap-1 active:opacity-70"
      >
        <Text className="text-sm text-neutral-700">{current.label}</Text>
        <Text className="text-[10px] text-neutral-400">▾</Text>
      </Pressable>
    </View>
  );
}

function EmptyBox({ message }: { message: string }) {
  return (
    <View className="rounded-2xl border border-dashed border-neutral-200 p-10">
      <Text className="text-center text-sm text-neutral-400">{message}</Text>
    </View>
  );
}
