import { Pressable, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { RoomCard, RoommateFindCard } from '@/components/domain';
import { Tabs } from '@/components/ui/headless';

import type { UseInterestsScreenReturn } from './use-interests-screen';

export type InterestsScreenViewProps = UseInterestsScreenReturn;

export function InterestsScreenView({
  rooms,
  likedMatches,
  onExplorePress,
  onRoomPress,
  onRoomLikeChange,
  onRoommatePress,
  onRoommateLikeChange,
}: InterestsScreenViewProps) {
  return (
    <SafeAreaView className="flex-1 bg-white" edges={['top']}>
      <View className="px-5 pb-3 pt-2">
        <Text className="text-2xl font-bold text-neutral-900">관심(즐겨찾기)</Text>
      </View>

      <Tabs.Root defaultValue="rooms" className="flex-1">
        <Tabs.List className="flex-row">
          {[
            { value: 'rooms', label: '방 게시글' },
            { value: 'roommates', label: '룸메이트 매칭' },
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
          {rooms.length === 0 ? (
            <Empty title="관심 표시한 방이 없어요" onExplore={onExplorePress} />
          ) : (
            <ScrollView contentContainerClassName="gap-4 p-5">
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
          {likedMatches.length === 0 ? (
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
    </SafeAreaView>
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
