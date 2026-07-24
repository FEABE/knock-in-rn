import { Ionicons } from '@expo/vector-icons';
import { ActivityIndicator, Pressable, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { RoomCard, RoommateFindCard } from '@/components/domain';
import { LoginPromptCard } from '@/components/auth/login-prompt-card';
import { ErrorState } from '@/components/ui/error-state';
import { Tabs } from '@/components/ui/headless';
import { EmptyHouseArtwork } from '@/components/ui/ready-to-dev-assets';

import type { UseInterestsScreenReturn } from './use-interests-screen';

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
      <View className="px-4 pb-5 pt-4">
        <Text className="text-[26px] font-bold leading-[39px] text-neutral-900">관심</Text>
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
              { value: 'rooms', label: '룸메 구해요' },
              { value: 'roommates', label: '룸메 찾아요' },
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
            {roomsLoading ? (
              <Loading label="관심 방을 불러오는 중..." />
            ) : roomsError ? (
              <ErrorState
                message="관심 방을 불러오지 못했어요"
                detail={roomsError}
                onRetry={reloadRooms}
              />
            ) : rooms.length === 0 ? (
              <Empty
                title="관심 표시한 방이 없어요"
                description="마음에 드는 방을 찾아보세요"
                actionLabel="방 보러가기"
                onExplore={onExplorePress}
              />
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
            {matchesLoading ? (
              <Loading label="관심 룸메이트를 불러오는 중..." />
            ) : matchesError ? (
              <ErrorState
                message="관심 룸메이트를 불러오지 못했어요"
                detail={matchesError}
                onRetry={reloadMatches}
              />
            ) : likedMatches.length === 0 ? (
              <Empty
                title="관심 표시한 룸메이트가 없어요"
                description="마음에 드는 룸메이트를 찾아보세요"
                actionLabel="룸메이트 보러가기"
                onExplore={onExplorePress}
              />
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

function Empty({
  title,
  description,
  actionLabel,
  onExplore,
}: {
  title: string;
  description: string;
  actionLabel: string;
  onExplore: () => void;
}) {
  return (
    <View className="flex-1 items-center justify-center gap-4 px-8 pb-16">
      <View className="items-center gap-6">
        <EmptyHouseArtwork size={172} />
        <View className="items-center gap-1">
          <Text className="text-[17px] font-semibold leading-[26px] text-[#17171B]">{title}</Text>
          <Text className="max-w-[280px] text-center text-sm leading-[21px] text-[#AAAABA]">
            {description}
          </Text>
        </View>
      </View>
      <Pressable
        onPress={onExplore}
        className="h-11 min-w-[139px] flex-row items-center justify-center gap-2 rounded-full border-[1.5px] border-[#256EF4] px-4 active:opacity-80"
      >
        <Text className="text-base font-medium text-[#256EF4]">{actionLabel}</Text>
        <Ionicons name="chevron-forward" size={16} color="#256EF4" />
      </Pressable>
    </View>
  );
}
