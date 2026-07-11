import { ActivityIndicator, Pressable, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { RoomCard, RoommateFindCard } from '@/components/domain';
import { LoginPromptCard } from '@/components/auth/login-prompt-card';
import { RoomListControls } from '@/components/domain/room-list-controls';
import { RoomFilterSheet } from '@/components/room/filters';
import { ErrorState } from '@/components/ui/error-state';
import { Tabs } from '@/components/ui/headless';

import { INITIAL_EXPLORE_FILTER } from '../explore/use-explore-screen';

import type { UseInterestsScreenReturn } from './use-interests-screen';

export type InterestsScreenViewProps = UseInterestsScreenReturn;

export function InterestsScreenView({
  rooms,
  likedMatches,
  isLoggedIn,
  filter,
  sort,
  openSheet,
  roomsLoading,
  roomsError,
  matchesLoading,
  matchesError,
  reloadRooms,
  reloadMatches,
  sortLabel,
  setSort,
  setOpenSheet,
  setFilter,
  onSearchPress,
  onLoginPress,
  onExplorePress,
  onRoomPress,
  onRoomLikeChange,
  onRoommatePress,
  onRoommateLikeChange,
}: InterestsScreenViewProps) {
  return (
    <SafeAreaView className="flex-1 bg-white" edges={['top']}>
      <View className="px-4 pb-2 pt-4">
        <Text className="text-[28px] font-extrabold text-neutral-900">관심</Text>
      </View>

      {!isLoggedIn ? (
        <View className="px-5 pt-3">
          <LoginPromptCard
            title="로그인하고 관심 목록을 모아보세요"
            description="마음에 드는 방과 룸메이트를 한곳에서 확인할 수 있어요"
            onPress={onLoginPress}
          />
        </View>
      ) : (
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
              sortLabel={sortLabel}
              onSearchPress={onSearchPress}
              onSortPress={() =>
                setSort(sort === 'latest' ? 'likes' : sort === 'likes' ? 'views' : 'latest')
              }
              onFilterPress={setOpenSheet}
            />
            {roomsLoading ? (
              <Loading label="관심 방을 불러오는 중..." />
            ) : roomsError ? (
              <ErrorState
                message="관심 방을 불러오지 못했어요"
                detail={roomsError}
                onRetry={reloadRooms}
              />
            ) : rooms.length === 0 ? (
              <Empty title="관심 표시한 방이 없어요" onExplore={onExplorePress} />
            ) : (
              <ScrollView contentContainerClassName="gap-5 px-4 pb-24 pt-1">
                {rooms.map((post) => (
                  <RoomCard
                    key={post.id}
                    post={post}
                    onPress={onRoomPress}
                    onLikeChange={onRoomLikeChange}
                  />
                ))}
              </ScrollView>
            )}
          </Tabs.Content>

          <Tabs.Content value="roommates" className="flex-1">
            <RoomListControls
              filter={filter}
              initialFilter={INITIAL_EXPLORE_FILTER}
              sortLabel={sortLabel}
              onSearchPress={onSearchPress}
              onSortPress={() =>
                setSort(sort === 'latest' ? 'likes' : sort === 'likes' ? 'views' : 'latest')
              }
              onFilterPress={setOpenSheet}
            />
            {matchesLoading ? (
              <Loading label="관심 룸메이트를 불러오는 중..." />
            ) : matchesError ? (
              <ErrorState
                message="관심 룸메이트를 불러오지 못했어요"
                detail={matchesError}
                onRetry={reloadMatches}
              />
            ) : likedMatches.length === 0 ? (
              <Empty title="관심 표시한 룸메이트가 없어요" onExplore={onExplorePress} />
            ) : (
              <ScrollView contentContainerClassName="gap-4 p-5">
                {likedMatches.map((match) => (
                  <RoommateFindCard
                    key={match.id}
                    match={match}
                    onPress={onRoommatePress}
                    onLikeChange={onRoommateLikeChange}
                  />
                ))}
              </ScrollView>
            )}
          </Tabs.Content>
        </Tabs.Root>
      )}

      {isLoggedIn ? (
        <RoomFilterSheet
          open={openSheet !== null}
          onOpenChange={(open) => setOpenSheet(open ? openSheet : null)}
          defaultTab={openSheet ?? 'region'}
          value={filter}
          onChange={setFilter}
          initial={INITIAL_EXPLORE_FILTER}
        />
      ) : null}
    </SafeAreaView>
  );
}

function Loading({ label }: { label: string }) {
  return (
    <View className="flex-1 items-center justify-center gap-3">
      <ActivityIndicator color="#256EF4" />
      <Text className="text-sm text-neutral-400">{label}</Text>
    </View>
  );
}

function Empty({ title, onExplore }: { title: string; onExplore: () => void }) {
  return (
    <View className="flex-1 items-center justify-center gap-3 p-10">
      <Text className="text-4xl text-neutral-300">♡</Text>
      <Text className="text-base font-semibold text-neutral-800">{title}</Text>
      <Text className="text-center text-sm text-neutral-400">
        마음에 드는 방에 하트를 눌러{'\n'}관심 목록에 저장해 보세요
      </Text>
      <Pressable
        onPress={onExplore}
        className="mt-2 rounded-full border border-[#256EF4] px-5 py-2.5 active:opacity-80"
      >
        <Text className="text-sm font-medium text-[#256EF4]">방 살펴보러 가기</Text>
      </Pressable>
    </View>
  );
}
