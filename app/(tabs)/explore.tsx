import { useRouter } from 'expo-router';
import { useMemo, useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { RoomCard, RoommateFindCard } from '@/components/domain';
import {
  BudgetFilterSheet,
  GenderFilterSheet,
  RegionFilterSheet,
  RoomTypeFilterSheet,
  type GenderFilterValue,
} from '@/components/room/filters';
import { SegmentedControl, Tabs } from '@/components/ui/headless';
import { useRoommateMatchList } from '@/lib/api';
import { useModeration, useRoomStore, useSession, type RoomPost } from '@/lib/domain';
import type { Region, RoomType } from '@/lib/onboarding';

type ExploreSort = 'latest' | 'views';
type FilterKey = 'region' | 'gender' | 'budget' | 'roomType';

type ExploreFilter = {
  regions: Region[];
  gender: GenderFilterValue;
  rentMin: number;
  rentMax: number;
  depositMin: number;
  depositMax: number;
  roomTypes: RoomType[];
};

const INITIAL_FILTER: ExploreFilter = {
  regions: [],
  gender: 'any',
  rentMin: 0,
  rentMax: 500,
  depositMin: 0,
  depositMax: 2000,
  roomTypes: [],
};

const SORT_OPTIONS: { value: ExploreSort; label: string }[] = [
  { value: 'latest', label: '최신순' },
  { value: 'views', label: '조회순' },
];

function applyFilter(posts: RoomPost[], f: ExploreFilter): RoomPost[] {
  return posts.filter((p) => {
    if (p.monthlyRent < f.rentMin || p.monthlyRent > f.rentMax) return false;
    if (p.deposit < f.depositMin || p.deposit > f.depositMax) return false;
    if (f.gender !== 'any' && p.author.gender !== f.gender) return false;
    if (f.regions.length > 0 && !f.regions.some((r) => r.id === p.region.id)) {
      return false;
    }
    if (f.roomTypes.length > 0 && !f.roomTypes.includes(p.roomType)) {
      return false;
    }
    return true;
  });
}

function sortPosts(posts: RoomPost[], sort: ExploreSort): RoomPost[] {
  const next = [...posts];
  if (sort === 'views') {
    return next.sort((a, b) => b.views - a.views);
  }
  return next.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
}

export default function ExploreScreen() {
  const router = useRouter();
  const { posts } = useRoomStore();
  const { isPostBlocked, isUserBlocked } = useModeration();
  const { session } = useSession();
  // 로그인 완료(액세스토큰 발급 + 세션 생성) 시 온보딩 진입 버튼 숨김.
  const isLoggedIn = session !== null;

  const [sort, setSort] = useState<ExploreSort>('latest');
  const [filter, setFilter] = useState<ExploreFilter>(INITIAL_FILTER);
  const [openSheet, setOpenSheet] = useState<FilterKey | null>(null);

  const goOnboarding = () => router.push('/onboarding' as never);

  const visiblePosts = useMemo(() => {
    const safe = posts.filter((p) => !isPostBlocked(p.id) && !isUserBlocked(p.author.id));
    return sortPosts(applyFilter(safe, filter), sort);
  }, [posts, isPostBlocked, isUserBlocked, filter, sort]);

  const { data: matchList, loading: matchesLoading } = useRoommateMatchList();
  const visibleMatches = useMemo(
    () => (matchList ?? []).filter((m) => !isUserBlocked(m.userId)),
    [matchList, isUserBlocked],
  );

  return (
    <SafeAreaView className="flex-1 bg-white" edges={['top']}>
      <Header
        onSearch={() => router.push('/room/search' as never)}
        onOnboarding={goOnboarding}
        showOnboarding={!isLoggedIn}
      />

      <Tabs.Root defaultValue="rooms" className="flex-1">
        <Tabs.List className="flex-row gap-1 border-b border-neutral-100 px-5">
          {[
            { value: 'rooms', label: '방 찾기' },
            { value: 'roommates', label: '룸메이트 찾기' },
          ].map((t) => (
            <Tabs.Trigger key={t.value} value={t.value} className="py-3">
              {({ selected }) => (
                <View
                  className={`border-b-2 pb-2 pr-6 ${
                    selected ? 'border-violet-600' : 'border-transparent'
                  }`}
                >
                  <Text
                    className={
                      selected
                        ? 'text-base font-semibold text-violet-700'
                        : 'text-base text-neutral-400'
                    }
                  >
                    {t.label}
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
              <View className="rounded-2xl border border-dashed border-neutral-200 p-10">
                <Text className="text-center text-sm text-neutral-400">
                  조건에 맞는 방이 없어요
                </Text>
              </View>
            ) : (
              visiblePosts.map((post) => (
                <RoomCard
                  key={post.id}
                  post={post}
                  onPress={(p) => router.push(`/room/${p.id}` as never)}
                />
              ))
            )}
          </ScrollView>
        </Tabs.Content>

        <Tabs.Content value="roommates" className="flex-1">
          <ScrollView className="flex-1" contentContainerClassName="gap-3 p-5 pb-24">
            {matchesLoading ? (
              <View className="items-center py-16">
                <ActivityIndicator color="#7c3aed" />
                <Text className="mt-3 text-sm text-neutral-400">룸메이트를 불러오는 중...</Text>
              </View>
            ) : visibleMatches.length === 0 ? (
              <View className="rounded-2xl border border-dashed border-neutral-200 p-10">
                <Text className="text-center text-sm text-neutral-400">
                  매칭된 룸메이트가 없어요
                </Text>
              </View>
            ) : (
              visibleMatches.map((m) => (
                <RoommateFindCard
                  key={m.userId}
                  match={m}
                  onPress={(match) => router.push(`/roommate/${match.userId}` as never)}
                />
              ))
            )}
          </ScrollView>
        </Tabs.Content>
      </Tabs.Root>

      <RegionFilterSheet
        open={openSheet === 'region'}
        onOpenChange={(o) => setOpenSheet(o ? 'region' : null)}
        value={filter.regions}
        onChange={(regions) => setFilter((p) => ({ ...p, regions }))}
      />
      <GenderFilterSheet
        open={openSheet === 'gender'}
        onOpenChange={(o) => setOpenSheet(o ? 'gender' : null)}
        value={filter.gender}
        onChange={(gender) => setFilter((p) => ({ ...p, gender }))}
      />
      <BudgetFilterSheet
        open={openSheet === 'budget'}
        onOpenChange={(o) => setOpenSheet(o ? 'budget' : null)}
        value={{
          depositMin: filter.depositMin,
          depositMax: filter.depositMax,
          rentMin: filter.rentMin,
          rentMax: filter.rentMax,
        }}
        onChange={(v) => setFilter((p) => ({ ...p, ...v }))}
      />
      <RoomTypeFilterSheet
        open={openSheet === 'roomType'}
        onOpenChange={(o) => setOpenSheet(o ? 'roomType' : null)}
        value={filter.roomTypes}
        onChange={(roomTypes) => setFilter((p) => ({ ...p, roomTypes }))}
      />
    </SafeAreaView>
  );
}

function Header({
  onSearch,
  onOnboarding,
  showOnboarding,
}: {
  onSearch: () => void;
  onOnboarding: () => void;
  showOnboarding: boolean;
}) {
  return (
    <View className="flex-row items-center justify-between px-5 py-3">
      <Text className="text-2xl font-bold text-neutral-900">탐색</Text>
      <View className="flex-row items-center gap-3">
        {showOnboarding ? (
          <Pressable
            onPress={onOnboarding}
            hitSlop={6}
            className="items-center justify-center rounded-full bg-violet-600 px-3 py-1.5 active:opacity-90"
          >
            <Text className="text-xs font-semibold text-white">온보딩</Text>
          </Pressable>
        ) : null}
        <Pressable onPress={onSearch} hitSlop={6} className="h-9 w-9 items-center justify-center">
          <Text className="text-xl text-neutral-700">⌕</Text>
        </Pressable>
        <Pressable hitSlop={6} className="h-9 w-9 items-center justify-center">
          <Text className="text-xl text-neutral-700">🔔</Text>
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
  onOpen: (key: FilterKey) => void;
}) {
  const budgetActive =
    filter.rentMin !== INITIAL_FILTER.rentMin ||
    filter.rentMax !== INITIAL_FILTER.rentMax ||
    filter.depositMin !== INITIAL_FILTER.depositMin ||
    filter.depositMax !== INITIAL_FILTER.depositMax;

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      style={{ flexGrow: 0 }}
      className="border-b border-neutral-100"
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
        active ? 'border-violet-600 bg-violet-50' : 'border-neutral-200 bg-white'
      }`}
    >
      <Text className={active ? 'text-xs font-medium text-violet-700' : 'text-xs text-neutral-700'}>
        {label}
      </Text>
      <Text className={active ? 'text-[10px] text-violet-500' : 'text-[10px] text-neutral-400'}>
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
  return (
    <View className="flex-row items-center justify-between border-b border-neutral-100 px-5 pb-3">
      <View className="flex-row items-center gap-3">
        <Text className="text-xs text-neutral-500">정렬</Text>
        <SegmentedControl<ExploreSort>
          options={SORT_OPTIONS}
          value={sort}
          onValueChange={onChange}
          className="flex-row gap-3"
          renderItem={({ option, selected }) => (
            <View>
              <Text
                className={
                  selected ? 'text-xs font-semibold text-violet-700' : 'text-xs text-neutral-400'
                }
              >
                {option.label}
              </Text>
            </View>
          )}
        />
      </View>
      <Text className="text-xs text-neutral-500">{count}건</Text>
    </View>
  );
}
