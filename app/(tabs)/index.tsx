import { useRouter } from 'expo-router';
import { useMemo } from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ProfileCard, RoomCard, RoommateCard } from '@/components/domain';
import { Tabs } from '@/components/ui/headless';
import {
  MOCK_ROOMMATE_CARDS,
  useModeration,
  useRoomStore,
  useSession,
} from '@/lib/domain';

export default function HomeScreen() {
  const router = useRouter();
  const { session, signIn } = useSession();
  const { posts } = useRoomStore();
  const { isPostBlocked, isUserBlocked } = useModeration();

  const visiblePosts = useMemo(
    () =>
      posts.filter(
        (p) => !isPostBlocked(p.id) && !isUserBlocked(p.author.id),
      ),
    [posts, isPostBlocked, isUserBlocked],
  );
  const visibleRoommates = useMemo(
    () => MOCK_ROOMMATE_CARDS.filter((c) => !isUserBlocked(c.user.id)),
    [isUserBlocked],
  );

  return (
    <SafeAreaView className="flex-1 bg-white" edges={['top']}>
      <View className="flex-row items-center justify-between border-b border-neutral-100 px-5 py-3">
        <Text className="text-xl font-bold text-violet-600">노크인</Text>
        <View className="flex-row gap-2">
          {!session ? (
            <Pressable
              onPress={() => signIn()}
              className="rounded-full bg-yellow-300 px-4 py-2 active:opacity-80"
            >
              <Text className="text-xs font-medium text-neutral-900">
                카카오 로그인
              </Text>
            </Pressable>
          ) : (
            <Pressable
              onPress={() => router.push('/onboarding' as never)}
              className="rounded-full bg-violet-600 px-4 py-2 active:opacity-80"
            >
              <Text className="text-xs font-medium text-white">
                내 방 등록
              </Text>
            </Pressable>
          )}
        </View>
      </View>

      <Tabs.Root defaultValue="all" className="flex-1">
        <Tabs.List className="flex-row gap-1 border-b border-neutral-100 px-5">
          {[
            { value: 'all', label: '전체' },
            { value: 'rooms', label: '방 살피기' },
            { value: 'roommates', label: '룸메이트 매칭' },
          ].map((t) => (
            <Tabs.Trigger key={t.value} value={t.value} className="py-3">
              {({ selected }) => (
                <View
                  className={`border-b-2 pb-2 ${
                    selected ? 'border-violet-600' : 'border-transparent'
                  }`}
                >
                  <Text
                    className={
                      selected
                        ? 'text-sm font-semibold text-violet-600'
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

        <ScrollView className="flex-1" contentContainerClassName="gap-4 p-5">
          {session ? (
            <ProfileCard
              user={session.user}
              visibility={session.visibility}
              onEdit={() => router.push('/onboarding' as never)}
            />
          ) : (
            <Pressable
              onPress={() => signIn()}
              className="gap-1 rounded-2xl border border-violet-100 bg-violet-50/60 p-4 active:opacity-80"
            >
              <Text className="text-sm font-semibold text-violet-700">
                로그인하고 매칭을 시작해보세요
              </Text>
              <Text className="text-xs text-violet-700/70">
                생활패턴 기반 궁합 점수 확인 · 학교/회사 이메일 인증
              </Text>
            </Pressable>
          )}

          <Tabs.Content value="all" className="gap-4">
            <Section title="추천 방">
              {visiblePosts.slice(0, 3).map((post) => (
                <RoomCard
                  key={post.id}
                  post={post}
                  onPress={(p) => router.push(`/room/${p.id}` as never)}
                />
              ))}
            </Section>
            <Section title="추천 룸메이트">
              {visibleRoommates.slice(0, 3).map((c) => (
                <RoommateCard
                  key={c.id}
                  card={c}
                  onPress={(card) =>
                    router.push(`/roommate/${card.id}` as never)
                  }
                />
              ))}
            </Section>
          </Tabs.Content>

          <Tabs.Content value="rooms" className="gap-4">
            {visiblePosts.map((post) => (
              <RoomCard
                key={post.id}
                post={post}
                onPress={(p) => router.push(`/room/${p.id}` as never)}
              />
            ))}
          </Tabs.Content>

          <Tabs.Content value="roommates" className="gap-4">
            {visibleRoommates.map((c) => (
              <RoommateCard
                key={c.id}
                card={c}
                onPress={(card) => router.push(`/roommate/${card.id}` as never)}
              />
            ))}
          </Tabs.Content>
        </ScrollView>
      </Tabs.Root>
    </SafeAreaView>
  );
}

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <View className="gap-3">
      <Text className="text-base font-bold text-neutral-900">{title}</Text>
      <View className="gap-3">{children}</View>
    </View>
  );
}
