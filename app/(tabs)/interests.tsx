import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { RoomCard, RoommateFindCard } from '@/components/domain';
import { Tabs } from '@/components/ui/headless';
import { useRoommateMatchList } from '@/lib/api';
import { useModeration, useRoomStore, useSession } from '@/lib/domain';

export default function InterestsScreen() {
  const router = useRouter();
  const { session } = useSession();
  const { posts } = useRoomStore();
  const { isPostBlocked, isUserBlocked } = useModeration();
  const { data: matchList } = useRoommateMatchList();

  const [likedRooms, setLikedRooms] = useState<string[]>(
    [posts[0]?.id, posts[2]?.id].filter(Boolean) as string[],
  );

  if (!session) {
    return (
      <SafeAreaView className="flex-1 bg-white" edges={['top']}>
        <ScrollView contentContainerClassName="flex-1 items-center justify-center gap-4 p-10">
          <Text className="text-base text-neutral-500">관심한 카드를 보려면 로그인해주세요</Text>
          <Pressable
            onPress={() => router.push('/')}
            className="rounded-full bg-violet-600 px-5 py-3"
          >
            <Text className="text-sm font-medium text-white">홈으로</Text>
          </Pressable>
        </ScrollView>
      </SafeAreaView>
    );
  }

  const rooms = posts.filter(
    (p) => likedRooms.includes(p.id) && !isPostBlocked(p.id) && !isUserBlocked(p.author.id),
  );
  const likedMatches = (matchList ?? []).filter(
    (m) => m.isLike === 'true' && !isUserBlocked(m.userId),
  );

  return (
    <SafeAreaView className="flex-1 bg-white" edges={['top']}>
      <View className="px-5 pb-3 pt-2">
        <Text className="text-2xl font-bold text-neutral-900">관심(즐겨찾기)</Text>
      </View>

      <Tabs.Root defaultValue="rooms" className="flex-1">
        <Tabs.List className="flex-row gap-1 border-b border-neutral-100 px-5">
          {[
            { value: 'rooms', label: '방 게시글' },
            { value: 'roommates', label: '룸메이트 매칭' },
          ].map((t) => (
            <Tabs.Trigger key={t.value} value={t.value} className="flex-1 py-3">
              {({ selected }) => (
                <View
                  className={`items-center border-b-2 pb-2 ${
                    selected ? 'border-violet-600' : 'border-transparent'
                  }`}
                >
                  <Text
                    className={
                      selected
                        ? 'text-sm font-semibold text-violet-700'
                        : 'text-sm text-neutral-400'
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
          {rooms.length === 0 ? (
            <Empty
              title="관심 표시한 방이 없어요"
              onExplore={() => router.push('/explore' as never)}
            />
          ) : (
            <ScrollView contentContainerClassName="gap-4 p-5">
              {rooms.map((post) => (
                <RoomCard
                  key={post.id}
                  post={{ ...post, liked: true }}
                  onPress={(p) => router.push(`/room/${p.id}` as never)}
                  onLikeChange={(p, liked) =>
                    setLikedRooms((prev) =>
                      liked
                        ? Array.from(new Set([...prev, p.id]))
                        : prev.filter((id) => id !== p.id),
                    )
                  }
                />
              ))}
            </ScrollView>
          )}
        </Tabs.Content>

        <Tabs.Content value="roommates" className="flex-1">
          {likedMatches.length === 0 ? (
            <Empty
              title="관심 표시한 룸메이트가 없어요"
              onExplore={() => router.push('/explore' as never)}
            />
          ) : (
            <ScrollView contentContainerClassName="gap-4 p-5">
              {likedMatches.map((m) => (
                <RoommateFindCard
                  key={m.userId}
                  match={m}
                  onPress={(match) => router.push(`/roommate/${match.userId}` as never)}
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
        className="mt-2 rounded-full border border-violet-600 px-5 py-2.5 active:opacity-80"
      >
        <Text className="text-sm font-medium text-violet-700">방 살펴보러 가기</Text>
      </Pressable>
    </View>
  );
}
