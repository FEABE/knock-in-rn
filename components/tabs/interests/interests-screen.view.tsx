import { FlatList, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { RoomCard, RoommateFindCard } from '@/components/domain';
import { LoginPromptCard } from '@/components/auth/login-prompt-card';
import { Tabs } from '@/components/ui/headless';
import { ReadyPageTitle } from '@/components/ui/ready-to-dev-components';
import {
  ReadyEmptyState,
  ReadyErrorState,
  ReadyLoadingState,
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

/** 기존 contentContainer의 gap-5 / gap-4 를 대체한다(가상화 스페이서에 gap이 먹는 문제 회피). */
function RoomListSeparator() {
  return <View className="h-5" />;
}

function MatchListSeparator() {
  return <View className="h-4" />;
}

export type InterestsScreenViewProps = UseInterestsScreenReturn;

export function InterestsScreenView({
  rooms,
  likedMatches,
  isLoggedIn,
  roomsLoading,
  roomsError,
  matchesLoading,
  matchesError,
  reloadRooms,
  reloadMatches,
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
        <Tabs.Root defaultValue="rooms" className="flex-1">
          <Tabs.List className="flex-row">
            {INTERESTS_TABS.map((tab) => (
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
                          : 'text-[17px] font-medium text-[#AAAABA]'
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
            {roomsLoading ? (
              <ReadyLoadingState label="관심 방을 불러오는 중..." />
            ) : roomsError ? (
              <ReadyErrorState
                title="관심 방을 불러오지 못했어요"
                description={roomsError}
                onRetry={reloadRooms}
              />
            ) : rooms.length === 0 ? (
              <ReadyEmptyState
                title="관심 표시한 방이 없어요"
                description="마음에 드는 방을 찾아보세요"
                actionLabel="방 보러가기"
                onAction={onExplorePress}
              />
            ) : (
              <FlatList
                contentContainerClassName="px-4 pb-24 pt-1"
                data={rooms}
                keyExtractor={roomKeyExtractor}
                renderItem={({ item }) => (
                  <RoomCard post={item} onPress={onRoomPress} onLikeChange={onRoomLikeChange} />
                )}
                ItemSeparatorComponent={RoomListSeparator}
                initialNumToRender={4}
                maxToRenderPerBatch={4}
                windowSize={7}
              />
            )}
          </Tabs.Content>

          <Tabs.Content value="roommates" className="flex-1">
            {matchesLoading ? (
              <ReadyLoadingState label="관심 룸메이트를 불러오는 중..." />
            ) : matchesError ? (
              <ReadyErrorState
                title="관심 룸메이트를 불러오지 못했어요"
                description={matchesError}
                onRetry={reloadMatches}
              />
            ) : likedMatches.length === 0 ? (
              <ReadyEmptyState
                title="관심 표시한 룸메이트가 없어요"
                description="마음에 드는 룸메이트를 찾아보세요"
                actionLabel="룸메이트 보러가기"
                onAction={onExplorePress}
              />
            ) : (
              <FlatList
                contentContainerClassName="p-5"
                data={likedMatches}
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
              />
            )}
          </Tabs.Content>
        </Tabs.Root>
      )}
    </SafeAreaView>
  );
}
