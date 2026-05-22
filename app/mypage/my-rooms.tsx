import { useRouter } from 'expo-router';
import { Alert, Pressable, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { RoomCard } from '@/components/domain';
import { useRoomStore, useSession } from '@/lib/domain';

export default function MyRoomsScreen() {
  const router = useRouter();
  const { session } = useSession();
  const { byAuthor, remove } = useRoomStore();

  if (!session) {
    return (
      <SafeAreaView className="flex-1 bg-white" edges={['top']}>
        <View className="flex-1 items-center justify-center p-10">
          <Text className="text-sm text-neutral-500">
            로그인 후 이용 가능해요
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  const mine = byAuthor(session.user.id);

  return (
    <SafeAreaView className="flex-1 bg-white" edges={['top']}>
      <View className="flex-row items-center justify-between border-b border-neutral-100 px-3 py-2">
        <View className="flex-row items-center gap-2">
          <Pressable
            onPress={() => router.back()}
            className="h-9 w-9 items-center justify-center"
          >
            <Text className="text-2xl text-neutral-700">‹</Text>
          </Pressable>
          <Text className="text-base font-semibold text-neutral-900">
            내가 쓴 방 게시글
          </Text>
        </View>
        <Pressable
          onPress={() => router.push('/room/new' as never)}
          className="rounded-full bg-blue-600 px-3 py-1.5"
        >
          <Text className="text-xs font-semibold text-white">+ 새 글</Text>
        </Pressable>
      </View>

      <ScrollView contentContainerClassName="gap-4 p-5">
        {mine.length === 0 ? (
          <View className="rounded-2xl border border-dashed border-neutral-200 p-10">
            <Text className="text-center text-sm text-neutral-400">
              아직 등록한 방 게시글이 없어요
            </Text>
          </View>
        ) : (
          mine.map((post) => (
            <View key={post.id} className="gap-3">
              <RoomCard
                post={post}
                onPress={(p) =>
                  router.push(`/room/${p.id}` as never)
                }
              />
              <View className="flex-row gap-2">
                <Pressable
                  onPress={() =>
                    router.push(`/room/${post.id}/edit` as never)
                  }
                  className="flex-1 items-center rounded-xl border border-neutral-200 py-3 active:bg-neutral-50"
                >
                  <Text className="text-sm font-medium text-neutral-700">
                    수정
                  </Text>
                </Pressable>
                <Pressable
                  onPress={() =>
                    Alert.alert('삭제', '게시글을 삭제할까요?', [
                      { text: '취소', style: 'cancel' },
                      {
                        text: '삭제',
                        style: 'destructive',
                        onPress: () => remove(post.id),
                      },
                    ])
                  }
                  className="flex-1 items-center rounded-xl border border-red-200 py-3 active:bg-red-50"
                >
                  <Text className="text-sm font-medium text-red-500">
                    삭제
                  </Text>
                </Pressable>
              </View>
            </View>
          ))
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
