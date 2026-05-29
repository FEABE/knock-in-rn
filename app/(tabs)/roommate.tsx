import { useRouter } from 'expo-router';
import { useMemo, useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { RoomCard, RoommateFindCard } from '@/components/domain';
import {
  BottomSheet,
  ChipMultiSelect,
  LoadMoreList,
  SegmentedControl,
  Tabs,
} from '@/components/ui/headless';
import { type BoardListQuery, useRoommateBoards, useRoommateMatchList } from '@/lib/api';
import { useModeration, type ListFilter, type RoomPost, type SortKey } from '@/lib/domain';
import { REGIONS } from '@/lib/onboarding';

const SORT_OPTIONS = [
  { value: 'latest', label: '최신순' },
  { value: 'likes', label: '관심순' },
  { value: 'views', label: '조회순' },
] as const;

const GENDER_OPTIONS = [
  { value: 'any', label: '전체' },
  { value: 'male', label: '남성' },
  { value: 'female', label: '여성' },
] as const;

/**
 * 정렬은 클라이언트에서 처리. 그 외 조건(월세/성별/지역)은 API 쿼리로 서버에
 * 위임한다(mapFilterToQuery). mock 단계에서는 쿼리가 무시되지만, 실서버 연동 시
 * 그대로 동작한다.
 */
function sortPosts(posts: RoomPost[], sort: SortKey): RoomPost[] {
  return [...posts].sort((a, b) => {
    if (sort === 'likes') return b.likes - a.likes;
    if (sort === 'views') return b.views - a.views;
    return b.createdAt.getTime() - a.createdAt.getTime();
  });
}

function mapFilterToQuery(filter: ListFilter): BoardListQuery {
  return {
    minMounthRent: filter.rentMin,
    maxMounthRent: filter.rentMax,
    gender: filter.gender && filter.gender !== 'any' ? filter.gender : undefined,
    region: filter.regionIds?.length ? filter.regionIds[0] : undefined,
    sort: filter.sort === 'latest' ? 'createdAt,desc' : undefined,
  };
}

export default function RoommateScreen() {
  const router = useRouter();
  const [filter, setFilter] = useState<ListFilter>({ sort: 'latest' });
  const [filterOpen, setFilterOpen] = useState(false);
  const { isPostBlocked, isUserBlocked } = useModeration();

  const boardQuery = useMemo(() => mapFilterToQuery(filter), [filter]);
  const {
    data: apiPosts,
    loading: postsLoading,
    error: postsError,
    reload: reloadPosts,
  } = useRoommateBoards(boardQuery);
  const { data: matchList, loading: matchesLoading } = useRoommateMatchList();

  const filteredPosts = useMemo(
    () =>
      sortPosts(
        (apiPosts ?? []).filter((p) => !isPostBlocked(p.id) && !isUserBlocked(p.author.id)),
        filter.sort,
      ),
    [apiPosts, filter.sort, isPostBlocked, isUserBlocked],
  );

  const visibleMatches = useMemo(
    () => (matchList ?? []).filter((m) => !isUserBlocked(m.userId)),
    [matchList, isUserBlocked],
  );

  return (
    <SafeAreaView className="flex-1 bg-white" edges={['top']}>
      <View className="border-b border-neutral-100 px-5 pb-3 pt-2">
        <Text className="text-xl font-bold text-neutral-900">룸메이트 구하기</Text>
      </View>

      <Tabs.Root defaultValue="explore" className="flex-1">
        <Tabs.List className="flex-row gap-1 border-b border-neutral-100 px-5">
          {[
            { value: 'explore', label: '방 찾기' },
            { value: 'matching', label: '룸메이트 찾기' },
          ].map((t) => (
            <Tabs.Trigger key={t.value} value={t.value} className="py-3">
              {({ selected }) => (
                <View
                  className={`border-b-2 pb-2 ${
                    selected ? 'border-violet-600' : 'border-transparent'
                  }`}
                >
                  <Text
                    className={
                      selected ? 'text-sm font-semibold text-violet-600' : 'text-sm text-neutral-500'
                    }
                  >
                    {t.label}
                  </Text>
                </View>
              )}
            </Tabs.Trigger>
          ))}
        </Tabs.List>

        <Tabs.Content value="explore" className="flex-1">
          <View className="gap-3 border-b border-neutral-100 px-5 py-3">
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerClassName="gap-2"
            >
              <Chip
                label={
                  filter.rentMin !== undefined || filter.rentMax !== undefined
                    ? `월세 ${filter.rentMin ?? 0}~${filter.rentMax ?? '∞'}만원`
                    : '월세'
                }
                active={filter.rentMin !== undefined || filter.rentMax !== undefined}
                onPress={() => setFilterOpen(true)}
              />
              <Chip
                label={
                  filter.gender && filter.gender !== 'any'
                    ? `성별: ${GENDER_OPTIONS.find((g) => g.value === filter.gender)?.label}`
                    : '성별'
                }
                active={!!filter.gender && filter.gender !== 'any'}
                onPress={() => setFilterOpen(true)}
              />
              <Chip
                label={filter.regionIds?.length ? `지역 ${filter.regionIds.length}` : '지역'}
                active={!!filter.regionIds?.length}
                onPress={() => setFilterOpen(true)}
              />
            </ScrollView>

            <SegmentedControl<SortKey>
              options={SORT_OPTIONS as unknown as { value: SortKey; label: string }[]}
              value={filter.sort}
              onValueChange={(v) => setFilter((p) => ({ ...p, sort: v }))}
              className="flex-row gap-2"
              renderItem={({ option, selected }) => (
                <View
                  className={`rounded-full border px-3 py-1.5 ${
                    selected ? 'border-neutral-900 bg-neutral-900' : 'border-neutral-200 bg-white'
                  }`}
                >
                  <Text
                    className={
                      selected ? 'text-xs font-medium text-white' : 'text-xs text-neutral-700'
                    }
                  >
                    {option.label}
                  </Text>
                </View>
              )}
            />
          </View>

          <ScrollView className="flex-1" contentContainerClassName="gap-4 p-5">
            {postsLoading ? (
              <View className="items-center py-16">
                <ActivityIndicator color="#7c3aed" />
                <Text className="mt-3 text-sm text-neutral-400">방을 불러오는 중...</Text>
              </View>
            ) : postsError ? (
              <View className="items-center gap-3 py-16">
                <Text className="text-sm text-neutral-500">목록을 불러오지 못했어요</Text>
                <Text className="text-xs text-neutral-400">{postsError}</Text>
                <Pressable
                  onPress={reloadPosts}
                  className="rounded-full bg-neutral-100 px-5 py-2.5 active:opacity-80"
                >
                  <Text className="text-sm text-neutral-700">다시 시도</Text>
                </Pressable>
              </View>
            ) : (
              <LoadMoreList items={filteredPosts} pageSize={3}>
                {({ visible, hasMore, loadMore, total }) => (
                  <View className="gap-4">
                    <Text className="text-xs text-neutral-500">
                      총 {total}건 · {visible.length}건 표시 중
                    </Text>
                    {visible.length === 0 ? (
                      <View className="rounded-2xl border border-dashed border-neutral-200 p-10">
                        <Text className="text-center text-sm text-neutral-400">
                          조건에 맞는 방이 없어요
                        </Text>
                      </View>
                    ) : null}
                    {visible.map((post) => (
                      <RoomCard
                        key={post.id}
                        post={post}
                        onPress={(p) => router.push(`/room/${p.id}` as never)}
                      />
                    ))}
                    {hasMore ? (
                      <Pressable
                        onPress={loadMore}
                        className="items-center rounded-xl border border-neutral-200 py-3 active:bg-neutral-50"
                      >
                        <Text className="text-sm font-medium text-neutral-700">더보기</Text>
                      </Pressable>
                    ) : null}
                  </View>
                )}
              </LoadMoreList>
            )}
          </ScrollView>

          <Pressable
            onPress={() => router.push('/onboarding' as never)}
            className="absolute bottom-6 right-5 h-14 w-14 items-center justify-center rounded-full bg-violet-600 active:opacity-90"
          >
            <Text className="text-2xl font-semibold text-white">+</Text>
          </Pressable>
        </Tabs.Content>

        <Tabs.Content value="matching" className="flex-1">
          <ScrollView contentContainerClassName="gap-4 p-5">
            {matchesLoading ? (
              <View className="items-center py-16">
                <ActivityIndicator color="#7c3aed" />
                <Text className="mt-3 text-sm text-neutral-400">매칭을 불러오는 중...</Text>
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

      <BottomSheet
        open={filterOpen}
        onOpenChange={setFilterOpen}
        contentClassName="rounded-t-2xl bg-white px-5 pb-8 pt-3"
      >
        <Text className="mb-4 text-lg font-bold text-neutral-900">상세 조건</Text>

        <View className="gap-5">
          <View className="gap-2">
            <Text className="text-sm font-semibold text-neutral-800">월세 (만원)</Text>
            <View className="flex-row flex-wrap gap-2">
              {[
                { min: 0, max: 40, label: '~40' },
                { min: 40, max: 60, label: '40~60' },
                { min: 60, max: 80, label: '60~80' },
                { min: 80, max: 100, label: '80~100' },
                { min: 100, max: undefined, label: '100~' },
              ].map((r) => {
                const active = filter.rentMin === r.min && filter.rentMax === r.max;
                return (
                  <Pressable
                    key={r.label}
                    onPress={() =>
                      setFilter((p) => ({
                        ...p,
                        rentMin: active ? undefined : r.min,
                        rentMax: active ? undefined : r.max,
                      }))
                    }
                    className={`rounded-full border px-3 py-1.5 ${
                      active ? 'border-violet-600 bg-violet-600' : 'border-neutral-200 bg-white'
                    }`}
                  >
                    <Text
                      className={
                        active ? 'text-xs font-medium text-white' : 'text-xs text-neutral-700'
                      }
                    >
                      {r.label}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
          </View>

          <View className="gap-2">
            <Text className="text-sm font-semibold text-neutral-800">성별</Text>
            <SegmentedControl<'any' | 'male' | 'female'>
              options={
                GENDER_OPTIONS as unknown as {
                  value: 'any' | 'male' | 'female';
                  label: string;
                }[]
              }
              value={(filter.gender ?? 'any') as 'male' | 'female' | 'any'}
              onValueChange={(v) =>
                setFilter((p) => ({ ...p, gender: v as 'male' | 'female' | 'any' }))
              }
              className="flex-row gap-2"
              renderItem={({ option, selected }) => (
                <View
                  className={`flex-1 items-center rounded-xl border py-3 ${
                    selected ? 'border-violet-600 bg-violet-50' : 'border-neutral-200 bg-white'
                  }`}
                >
                  <Text
                    className={
                      selected ? 'text-sm font-medium text-violet-600' : 'text-sm text-neutral-700'
                    }
                  >
                    {option.label}
                  </Text>
                </View>
              )}
            />
          </View>

          <View className="gap-2">
            <Text className="text-sm font-semibold text-neutral-800">지역</Text>
            <ScrollView style={{ maxHeight: 220 }}>
              <ChipMultiSelect
                options={REGIONS.map((r) => ({
                  value: r.id,
                  label: `${r.city} ${r.district}`,
                }))}
                value={filter.regionIds ?? []}
                onValueChange={(v) => setFilter((p) => ({ ...p, regionIds: v }))}
                max={5}
                className="flex-row flex-wrap gap-2"
                renderItem={({ option, selected }) => (
                  <View
                    className={`rounded-full border px-3 py-1.5 ${
                      selected ? 'border-violet-600 bg-violet-600' : 'border-neutral-200 bg-white'
                    }`}
                  >
                    <Text
                      className={
                        selected ? 'text-xs font-medium text-white' : 'text-xs text-neutral-700'
                      }
                    >
                      {option.label}
                    </Text>
                  </View>
                )}
              />
            </ScrollView>
          </View>

          <Pressable
            onPress={() => setFilterOpen(false)}
            className="mt-2 h-12 items-center justify-center rounded-xl bg-violet-600 active:opacity-90"
          >
            <Text className="text-sm font-semibold text-white">적용하기</Text>
          </Pressable>
        </View>
      </BottomSheet>
    </SafeAreaView>
  );
}

function Chip({
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
      className={`rounded-full border px-3 py-1.5 active:opacity-80 ${
        active ? 'border-violet-600 bg-violet-50' : 'border-neutral-200 bg-white'
      }`}
    >
      <Text className={active ? 'text-xs font-medium text-violet-600' : 'text-xs text-neutral-700'}>
        {label}
      </Text>
    </Pressable>
  );
}
