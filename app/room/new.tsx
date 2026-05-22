import { useRouter } from 'expo-router';
import { Alert, Pressable, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { RoomPostForm } from '@/components/room/room-post-form';
import { useRoomStore, useSession } from '@/lib/domain';

export default function NewRoomScreen() {
  const router = useRouter();
  const { session, signIn } = useSession();
  const { add } = useRoomStore();

  if (!session) {
    return (
      <SafeAreaView className="flex-1 bg-white" edges={['top']}>
        <View className="flex-1 items-center justify-center gap-4 p-10">
          <Text className="text-base text-neutral-500">
            방을 등록하려면 로그인이 필요해요
          </Text>
          <Pressable
            onPress={() => signIn()}
            className="rounded-full bg-yellow-300 px-5 py-3"
          >
            <Text className="text-sm font-medium text-neutral-900">
              카카오로 시작하기
            </Text>
          </Pressable>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-white" edges={['top']}>
      <View className="flex-row items-center gap-2 border-b border-neutral-100 px-3 py-2">
        <Pressable
          onPress={() => router.back()}
          className="h-9 w-9 items-center justify-center"
        >
          <Text className="text-2xl text-neutral-700">‹</Text>
        </Pressable>
        <Text className="text-base font-semibold text-neutral-900">
          내 방 등록
        </Text>
      </View>

      <RoomPostForm
        submitLabel="등록하기"
        onSubmit={(values) => {
          add({
            id: `p-${Date.now()}`,
            title: values.title,
            deposit: values.deposit,
            monthlyRent: values.monthlyRent,
            roomType: values.roomType,
            region: values.region,
            views: 0,
            likes: 0,
            createdAt: new Date(),
            status: 'open',
            author: session.user,
            description: values.description,
            thumbnailUrl: `https://picsum.photos/seed/${Date.now()}/600/400`,
          });
          Alert.alert('등록 완료', '방 카드가 등록되었어요.', [
            { text: '확인', onPress: () => router.back() },
          ]);
        }}
      />
    </SafeAreaView>
  );
}
