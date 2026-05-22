import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { RoomCard, RoommateCard } from '@/components/domain';
import { Tabs } from '@/components/ui/headless';
import {
  MOCK_ROOMMATE_CARDS,
  useModeration,
  useRoomStore,
  useSession,
} from '@/lib/domain';

export default function InterestsScreen() {
  const router = useRouter();
  const { session } = useSession();
  const { posts } = useRoomStore();
  const { isPostBlocked, isUserBlocked } = useModeration();
  const [likedRooms, setLikedRooms] = useState<string[]>([
    posts[0]?.id,
    posts[2]?.id,
  ].filter(Boolean) as string[]);
  const [likedRoommates, setLikedRoommates] = useState<string[]>([
    MOCK_ROOMMATE_CARDS[0]?.id,
  ].filter(Boolean) as string[]);

  if (!session) {
    return (
      <SafeAreaView className="flex-1 bg-white" edges={['top']}>
        <ScrollView
          contentContainerClassName="flex-1 items-center justify-center gap-4 p-10"
        >
          <Text className="text-base text-neutral-500">
            관심한 카드를 보려면 로그인해주세요
          </Text>
          <Pressable
            onPress={() => router.push('/')}
            className="rounded-full bg-blue-600 px-5 py-3"
          >
            <Text className="text-sm font-medium text-white">홈으로</Text>
          </Pressable>
        </ScrollView>
      </SafeAreaView>
    );
  }

  const rooms = posts.filter(
    (p) =>
      likedRooms.includes(p.id) &&
      !isPostBlocked(p.id) &&
      !isUserBlocked(p.author.id),
  );
  const roommates = MOCK_ROOMMATE_CARDS.filter(
    (c) => likedRoommates.includes(c.id) && !isUserBlocked(c.user.id),
  );

  return (
    <SafeAreaView className="flex-1 bg-white" edges={['top']}>
      <View className="border-b border-neutral-100 px-5 pb-3 pt-2">
        <Text className="text-xl font-bold text-neutral-900">관심</Text>
      </View>

      <Tabs.Root defaultValue="rooms" className="flex-1">
        <Tabs.List className="flex-row gap-1 border-b border-neutral-100 px-5">
          {[
            { value: 'rooms', label: `방 ${rooms.length}` },
            { value: 'roommates', label: `룸메이트 ${roommates.length}` },
          ].map((t) => (
            <Tabs.Trigger key={t.value} value={t.value} className="py-3">
              {({ selected }) => (
                <View
                  className={`border-b-2 pb-2 ${
                    selected ? 'border-blue-600' : 'border-transparent'
                  }`}
                >
                  <Text
                    className={
                      selected
                        ? 'text-sm font-semibold text-blue-600'
                        : 'text-sm text-neutral-500'
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
          <ScrollView contentContainerClassName="gap-4 p-5">
            {rooms.length === 0 ? (
              <Empty label="관심한 방이 없어요" />
            ) : (
              rooms.map((post) => (
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
              ))
            )}
          </ScrollView>
        </Tabs.Content>

        <Tabs.Content value="roommates" className="flex-1">
          <ScrollView contentContainerClassName="gap-4 p-5">
            {roommates.length === 0 ? (
              <Empty label="관심한 룸메이트가 없어요" />
            ) : (
              roommates.map((c) => (
                <RoommateCard
                  key={c.id}
                  card={{ ...c, liked: true }}
                  onPress={(card) =>
                    router.push(`/roommate/${card.id}` as never)
                  }
                  onLikeChange={(card, liked) =>
                    setLikedRoommates((prev) =>
                      liked
                        ? Array.from(new Set([...prev, card.id]))
                        : prev.filter((id) => id !== card.id),
                    )
                  }
                />
              ))
            )}
          </ScrollView>
        </Tabs.Content>
      </Tabs.Root>
    </SafeAreaView>
  );
}

function Empty({ label }: { label: string }) {
  return (
    <View className="rounded-2xl border border-dashed border-neutral-200 p-10">
      <Text className="text-center text-sm text-neutral-400">{label}</Text>
    </View>
  );
}
