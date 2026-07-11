import { Ionicons } from '@expo/vector-icons';
import { ActivityIndicator, Pressable, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { RoomCard, RoommateFindCard } from '@/components/domain';
import { RoomListControls } from '@/components/domain/room-list-controls';
import { RoomFilterSheet } from '@/components/room/filters';
import { ErrorState } from '@/components/ui/error-state';
import { Tabs } from '@/components/ui/headless';

import {
  EXPLORE_SORT_OPTIONS,
  INITIAL_EXPLORE_FILTER,
  type UseExploreScreenReturn,
} from './use-explore-screen';

export type ExploreScreenViewProps = UseExploreScreenReturn;

export function ExploreScreenView({
  sort,
  filter,
  searchQuery,
  openSheet,
  visiblePosts,
  visibleMatches,
  roomsLoading,
  roomsError,
  matchesLoading,
  matchesError,
  hasUnreadAlarms,
  reloadRooms,
  reloadMatches,
  setSort,
  setOpenSheet,
  handleFilterChange,
  onSearchPress,
  onSearchClear,
  onNotificationPress,
  onRoomPress,
  onRoomLikeChange,
  onRoommatePress,
  onRoommateLikeChange,
}: ExploreScreenViewProps) {
  return (
    <SafeAreaView className="flex-1 bg-white" edges={['top']}>
      <Header hasUnread={hasUnreadAlarms} onNotificationPress={onNotificationPress} />

      <Tabs.Root defaultValue="rooms" className="flex-1">
        <Tabs.List className="flex-row">
          {[
            { value: 'rooms', label: '방 게시글' },
            { value: 'roommates', label: '룸메이트 찾기' },
          ].map((tab) => (
            <Tabs.Trigger key={tab.value} value={tab.value} className="flex-1 pt-3">
              {({ selected }) => (
                <View
                  className={`items-center border-b-2 pb-2 ${
                    selected ? 'border-[#256EF4]' : 'border-transparent'
                  }`}
                >
                  <Text
                    className={
                      selected
                        ? 'text-[17px] font-semibold text-neutral-900'
                        : 'text-[17px] font-medium text-neutral-900'
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
          <RoomListControls
            filter={filter}
            initialFilter={INITIAL_EXPLORE_FILTER}
            sortLabel={
              EXPLORE_SORT_OPTIONS.find((option) => option.value === sort)?.label ?? '정렬'
            }
            searchQuery={searchQuery}
            onSearchPress={onSearchPress}
            onSearchClear={onSearchClear}
            onSortPress={() =>
              setSort(sort === 'latest' ? 'likes' : sort === 'likes' ? 'views' : 'latest')
            }
            onFilterPress={setOpenSheet}
          />

          <ScrollView className="flex-1" contentContainerClassName="gap-5 px-4 pb-24 pt-1">
            {roomsLoading ? (
              <View className="items-center py-16">
                <ActivityIndicator color="#256EF4" />
                <Text className="mt-3 text-sm text-neutral-400">방을 불러오는 중...</Text>
              </View>
            ) : roomsError ? (
              <ErrorState
                message="방 목록을 불러오지 못했어요"
                detail={roomsError}
                onRetry={reloadRooms}
              />
            ) : visiblePosts.length === 0 ? (
              <EmptyBox message="조건에 맞는 방이 없어요" />
            ) : (
              visiblePosts.map((post) => (
                <RoomCard
                  key={post.id}
                  post={post}
                  onPress={onRoomPress}
                  onLikeChange={onRoomLikeChange}
                />
              ))
            )}
          </ScrollView>
        </Tabs.Content>

        <Tabs.Content value="roommates" className="flex-1">
          <RoomListControls
            filter={filter}
            initialFilter={INITIAL_EXPLORE_FILTER}
            sortLabel={
              EXPLORE_SORT_OPTIONS.find((option) => option.value === sort)?.label ?? '정렬'
            }
            searchQuery={searchQuery}
            onSearchPress={onSearchPress}
            onSearchClear={onSearchClear}
            onSortPress={() =>
              setSort(sort === 'latest' ? 'likes' : sort === 'likes' ? 'views' : 'latest')
            }
            onFilterPress={setOpenSheet}
          />
          <ScrollView className="flex-1" contentContainerClassName="gap-5 px-4 pb-24 pt-4">
            {matchesLoading ? (
              <View className="items-center py-16">
                <ActivityIndicator color="#256EF4" />
                <Text className="mt-3 text-sm text-neutral-400">룸메이트를 불러오는 중...</Text>
              </View>
            ) : matchesError ? (
              <ErrorState
                message="룸메이트 목록을 불러오지 못했어요"
                detail={matchesError}
                onRetry={reloadMatches}
              />
            ) : visibleMatches.length === 0 ? (
              <EmptyBox message="매칭된 룸메이트가 없어요" />
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

function Header({
  hasUnread,
  onNotificationPress,
}: {
  hasUnread: boolean;
  onNotificationPress: () => void;
}) {
  return (
    <View className="flex-row items-center justify-between px-4 pb-2 pt-4">
      <Text className="text-[28px] font-extrabold text-neutral-900">탐색</Text>
      <Pressable
        onPress={onNotificationPress}
        hitSlop={6}
        className="h-9 w-9 items-center justify-center"
      >
        <Ionicons name="notifications-outline" size={24} color="#17171B" />
        {hasUnread ? (
          <View className="absolute right-1 top-1 h-2.5 w-2.5 rounded-full border border-white bg-[#256EF4]" />
        ) : null}
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
