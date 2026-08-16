import { FlatList, RefreshControl, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { RoomCard, RoommateFindCard } from '@/components/domain';
import { LoginPromptCard } from '@/components/auth/login-prompt-card';
import { Tabs } from '@/components/ui/headless';
import { ReadyPageTitle } from '@/components/ui/ready-to-dev-components';
import {
  ReadyEmptyState,
  ReadyErrorState,
  ReadyListFooterLoading,
  ReadyLoadingState,
  ReadyToast,
} from '@/components/ui/ready-to-dev-feedback';
import type { RoommateMatchCardModel } from '@/lib/api';
import type { RoomPost } from '@/lib/domain';

import type { UseInterestsScreenReturn } from './use-interests-screen';

const INTERESTS_TABS = [
  { value: 'rooms', label: '룸메 구해요' },
  { value: 'roommates', label: '룸메 찾아요' },
];

const roomKeyExtractor = (post: RoomPost) => post.id;
const matchKeyExtractor = (match: RoommateMatchCardModel) => match.id;
const EMPTY_ROOM_POSTS: RoomPost[] = [];
const EMPTY_MATCHES: RoommateMatchCardModel[] = [];

/**
 * 게시물 사이 구분선 — 탐색 탭 목록과 동일 (Figma 탐색_3_메인 기준).
 * 카드 - 24pt - 1px 라인 - 24pt - 카드. 라인은 화면 전체 너비라서
 * 리스트 좌우 패딩(px-4)을 음수 마진으로 빠져나온다.
 */
function RoomListSeparator() {
  return <View className="-mx-4 my-6 h-px bg-[#ECECF3]" />;
}

function MatchListSeparator() {
  return <View className="h-4" />;
}

export type InterestsScreenViewProps = UseInterestsScreenReturn;

export function InterestsScreenView({
  rooms,
  likedMatches,
  isLoggedIn,
  activeTab,
  toastMessage,
  roomsLoading,
  roomsRefreshing,
  roomsError,
  roomsLoadingMore,
  loadMoreRooms,
  matchesLoading,
  matchesRefreshing,
  matchesError,
  matchesLoadingMore,
  loadMoreMatches,
  reloadRooms,
  reloadMatches,
  setActiveTab,
  onLoginPress,
  onExplorePress,
  onRoomPress,
  onRoomLikeChange,
  onRoommatePress,
  onRoommateLikeChange,
}: InterestsScreenViewProps) {
  return (
    <SafeAreaView className="flex-1 bg-white" edges={['top']}>
      <ReadyPageTitle title="관심" />

      {!isLoggedIn ? (
        <View className="px-5 pt-3">
          <LoginPromptCard
            title="로그인하고 관심 목록을 모아보세요"
            description="마음에 드는 방과 룸메이트를 한곳에서 확인할 수 있어요"
            onPress={onLoginPress}
          />
        </View>
      ) : (
        <Tabs.Root
          value={activeTab}
          onValueChange={(next) => setActiveTab(next as typeof activeTab)}
          className="flex-1"
        >
          <Tabs.List className="flex-row border-b border-[#DADAE8]">
            {INTERESTS_TABS.map((tab) => (
              <Tabs.Trigger key={tab.value} value={tab.value} className="flex-1">
                {({ selected }) => (
                  <View
                    className={`items-center border-b-2 pb-3 ${
                      selected ? 'border-[#256EF4]' : 'border-transparent'
                    }`}
                  >
                    <Text
                      className={
                        selected
                          ? 'text-sm font-semibold text-neutral-900'
                          : 'text-sm font-medium text-[#AAAABA]'
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
            <FlatList
              automaticallyAdjustContentInsets={false}
              contentInsetAdjustmentBehavior="never"
              contentContainerClassName="grow px-4 pb-24 pt-4"
              data={roomsLoading || roomsError ? EMPTY_ROOM_POSTS : rooms}
              keyExtractor={roomKeyExtractor}
              renderItem={({ item }) => (
                <RoomCard post={item} onPress={onRoomPress} onLikeChange={onRoomLikeChange} />
              )}
              ItemSeparatorComponent={RoomListSeparator}
              initialNumToRender={4}
              maxToRenderPerBatch={4}
              windowSize={7}
              onEndReached={loadMoreRooms}
              onEndReachedThreshold={0.5}
              ListFooterComponent={<ReadyListFooterLoading visible={roomsLoadingMore} />}
              refreshControl={
                activeTab === 'rooms' ? (
                  <RefreshControl
                    refreshing={roomsRefreshing}
                    onRefresh={reloadRooms}
                    tintColor="#256EF4"
                  />
                ) : undefined
              }
              ListEmptyComponent={
                roomsLoading ? (
                  <ReadyLoadingState label="관심 방을 불러오는 중..." />
                ) : roomsError ? (
                  <ReadyErrorState
                    title="관심 방을 불러오지 못했어요"
                    description={roomsError}
                    onRetry={reloadRooms}
                  />
                ) : (
                  <ReadyEmptyState
                    title="관심 표시한 방이 없어요"
                    description="마음에 드는 방을 찾아보세요"
                    actionLabel="방 보러가기"
                    onAction={() => onExplorePress('rooms')}
                  />
                )
              }
            />
          </Tabs.Content>

          <Tabs.Content value="roommates" className="flex-1">
            <FlatList
              automaticallyAdjustContentInsets={false}
              contentInsetAdjustmentBehavior="never"
              contentContainerClassName="grow px-4 pb-24 pt-4"
              data={matchesLoading || matchesError ? EMPTY_MATCHES : likedMatches}
              keyExtractor={matchKeyExtractor}
              renderItem={({ item }) => (
                <RoommateFindCard
                  match={item}
                  onPress={onRoommatePress}
                  onLikeChange={onRoommateLikeChange}
                />
              )}
              ItemSeparatorComponent={MatchListSeparator}
              initialNumToRender={5}
              maxToRenderPerBatch={5}
              windowSize={7}
              onEndReached={loadMoreMatches}
              onEndReachedThreshold={0.5}
              ListFooterComponent={<ReadyListFooterLoading visible={matchesLoadingMore} />}
              refreshControl={
                activeTab === 'roommates' ? (
                  <RefreshControl
                    refreshing={matchesRefreshing}
                    onRefresh={reloadMatches}
                    tintColor="#256EF4"
                  />
                ) : undefined
              }
              ListEmptyComponent={
                matchesLoading ? (
                  <ReadyLoadingState label="관심 룸메이트를 불러오는 중..." />
                ) : matchesError ? (
                  <ReadyErrorState
                    title="관심 룸메이트를 불러오지 못했어요"
                    description={matchesError}
                    onRetry={reloadMatches}
                  />
                ) : (
                  <ReadyEmptyState
                    title="관심 표시한 룸메이트가 없어요"
                    description="마음에 드는 룸메이트를 찾아보세요"
                    actionLabel="룸메이트 보러가기"
                    onAction={() => onExplorePress('roommates')}
                  />
                )
              }
            />
          </Tabs.Content>
        </Tabs.Root>
      )}
      <ReadyToast visible={toastMessage !== null} message={toastMessage ?? ''} tone="success" />
    </SafeAreaView>
  );
}
