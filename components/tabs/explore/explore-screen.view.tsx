import { Ionicons } from '@expo/vector-icons';
import { ActivityIndicator, Pressable, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { RoomCard, RoommateFindCard } from '@/components/domain';
import { RoomListControls } from '@/components/domain/room-list-controls';
import { RoomFilterSheet } from '@/components/room/filters';
import { ErrorState } from '@/components/ui/error-state';
import { Tabs } from '@/components/ui/headless';
import { EmptyHouseArtwork } from '@/components/ui/ready-to-dev-assets';

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
  onCreatePress,
  onRoomPress,
  onRoomLikeChange,
  onRoommatePress,
  onRoommateLikeChange,
}: ExploreScreenViewProps) {
  return (
    <SafeAreaView className="flex-1 bg-white" edges={['top']}>
      <Header hasUnread={hasUnreadAlarms} onNotificationPress={onNotificationPress} />

      <Tabs.Root defaultValue="rooms" className="flex-1">
        <Tabs.List className="flex-row border-b border-[#DADAE8]">
          {[
            { value: 'rooms', label: '룸메 구해요' },
            { value: 'roommates', label: '룸메 찾아요' },
          ].map((tab) => (
            <Tabs.Trigger key={tab.value} value={tab.value} className="flex-1">
              {({ selected }) => (
                <View
                  className={`-mb-px items-center border-b-2 pb-3 pt-1 ${
                    selected ? 'border-[#256EF4]' : 'border-transparent'
                  }`}
                >
                  <Text
                    className={
                      selected
                        ? 'text-base font-semibold text-[#17171B]'
                        : 'text-base font-medium text-[#AAAABA]'
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

          <ScrollView className="flex-1" contentContainerClassName="gap-5 px-4 pb-24">
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
              <EmptyBox message={searchQuery ? '검색 결과가 없어요' : '조건에 맞는 방이 없어요'} />
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

          <Pressable
            onPress={onCreatePress}
            accessibilityRole="button"
            accessibilityLabel="룸메이트 게시글 등록"
            className="absolute bottom-5 right-4 h-11 w-11 items-center justify-center rounded-full bg-[#256EF4] shadow-md active:opacity-90"
          >
            <Ionicons name="add" size={22} color="#FFFFFF" />
          </Pressable>
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
          <ScrollView className="flex-1" contentContainerClassName="gap-5 px-4 pb-24">
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
              <EmptyBox message={searchQuery ? '검색 결과가 없어요' : '매칭된 룸메이트가 없어요'} />
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
    <View className="flex-row items-center justify-between px-4 pb-6 pt-7">
      <Text className="text-xl font-bold leading-6 text-[#256EF4]" style={{ letterSpacing: 3.2 }}>
        KNOCKIN
      </Text>
      <Pressable
        onPress={onNotificationPress}
        hitSlop={6}
        className="h-9 w-9 items-center justify-center"
      >
        <Ionicons name="notifications-outline" size={24} color="#696976" />
        {hasUnread ? (
          <View className="absolute right-1 top-1 h-2.5 w-2.5 rounded-full border border-white bg-[#256EF4]" />
        ) : null}
      </Pressable>
    </View>
  );
}

function EmptyBox({ message }: { message: string }) {
  return (
    <View className="items-center gap-3 px-8 py-10">
      <EmptyHouseArtwork size={168} />
      <Text className="text-center text-[17px] font-semibold text-[#17171B]">{message}</Text>
      <Text className="text-center text-sm text-[#AAAABA]">다른 조건으로 다시 찾아보세요</Text>
    </View>
  );
}
