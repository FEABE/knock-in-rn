import { Ionicons } from '@expo/vector-icons';
import { ActivityIndicator, Pressable, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import {
  RoomCard,
  RoommateFilterBar,
  RoommateFilterSheet,
  RoommateFindCard,
} from '@/components/domain';
import { EmptyState } from '@/components/ui/empty-state';
import { ErrorState } from '@/components/ui/error-state';
import { LoadMoreList, Tabs } from '@/components/ui/headless';
import { PageTabs } from '@/components/ui/page-tabs';

import type { UseRoommateTabScreenReturn } from './use-roommate-tab-screen';

export type RoommateTabScreenViewProps = UseRoommateTabScreenReturn;

export function RoommateTabScreenView({
  filter,
  filterOpen,
  filteredPosts,
  visibleMatches,
  postsLoading,
  postsError,
  matchesLoading,
  reloadPosts,
  setFilter,
  setFilterOpen,
  onRoomPress,
  onRoomLikeChange,
  onRoommatePress,
  onRoommateLikeChange,
  onSearchPress,
  onCreatePress,
}: RoommateTabScreenViewProps) {
  return (
    <SafeAreaView className="flex-1 bg-white" edges={['top']}>
      <View className="h-16 flex-row items-center justify-between px-4">
        <Text className="text-[28px] font-black tracking-[-1px] text-[#17171B]">노크인</Text>
        <Pressable
          onPress={onSearchPress}
          hitSlop={10}
          accessibilityRole="button"
          accessibilityLabel="검색"
          className="h-10 w-10 items-center justify-center rounded-full active:bg-neutral-100"
        >
          <Ionicons name="search-outline" size={25} color="#17171B" />
        </Pressable>
      </View>

      <PageTabs
        defaultValue="explore"
        tabs={[
          { value: 'explore', label: '방 찾기' },
          { value: 'matching', label: '룸메이트 찾기' },
        ]}
      >
        <Tabs.Content value="explore" className="flex-1">
          <RoommateFilterBar
            filter={filter}
            onFilterChange={setFilter}
            onOpenSheet={() => setFilterOpen(true)}
          />

          <ScrollView className="flex-1" contentContainerClassName="gap-4 p-5">
            {postsLoading ? (
              <LoadingState label="방을 불러오는 중..." />
            ) : postsError ? (
              <ErrorState
                message="목록을 불러오지 못했어요"
                detail={postsError}
                onRetry={reloadPosts}
              />
            ) : (
              <LoadMoreList items={filteredPosts} pageSize={3}>
                {({ visible, hasMore, loadMore, total }) => (
                  <View className="gap-4">
                    <Text className="text-xs text-neutral-500">
                      총 {total}건 · {visible.length}건 표시 중
                    </Text>
                    {visible.length === 0 ? <EmptyState message="조건에 맞는 방이 없어요" /> : null}
                    {visible.map((post) => (
                      <RoomCard
                        key={post.id}
                        post={post}
                        onPress={onRoomPress}
                        onLikeChange={onRoomLikeChange}
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
            onPress={onCreatePress}
            className="absolute bottom-6 right-5 h-14 w-14 items-center justify-center rounded-full bg-[#256EF4] active:opacity-90 shadow-sm"
          >
            <Text className="text-2xl font-semibold text-white">+</Text>
          </Pressable>
        </Tabs.Content>

        <Tabs.Content value="matching" className="flex-1">
          <ScrollView contentContainerClassName="gap-4 p-5">
            {matchesLoading ? (
              <LoadingState label="매칭을 불러오는 중..." />
            ) : visibleMatches.length === 0 ? (
              <EmptyState message="매칭된 룸메이트가 없어요" />
            ) : (
              visibleMatches.map((match) => (
                <RoommateFindCard
                  key={match.id}
                  match={match}
                  onPress={onRoommatePress}
                  onLikeChange={onRoommateLikeChange}
                />
              ))
            )}
          </ScrollView>
        </Tabs.Content>
      </PageTabs>

      <RoommateFilterSheet
        open={filterOpen}
        onOpenChange={setFilterOpen}
        filter={filter}
        onFilterChange={setFilter}
      />
    </SafeAreaView>
  );
}

function LoadingState({ label }: { label: string }) {
  return (
    <View className="items-center py-16">
      <ActivityIndicator color="#256EF4" />
      <Text className="mt-3 text-sm text-neutral-400">{label}</Text>
    </View>
  );
}
