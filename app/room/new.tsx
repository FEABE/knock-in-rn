import { useRouter } from 'expo-router';
import { Alert, Pressable, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { RoomPostForm } from '@/components/room/room-post-form';
import { createRoommateBoard } from '@/lib/api';
import { useRoomStore, useSession } from '@/lib/domain';

export default function NewRoomScreen() {
  const router = useRouter();
  const { session, signIn } = useSession();
  const { add } = useRoomStore();

  if (!session) {
    return (
      <SafeAreaView className="flex-1 bg-white" edges={['top']}>
        <View className="flex-1 items-center justify-center gap-4 p-10">
          <Text className="text-base text-neutral-500">방을 등록하려면 로그인이 필요해요</Text>
          <Pressable onPress={() => signIn()} className="rounded-full bg-yellow-300 px-5 py-3">
            <Text className="text-sm font-medium text-neutral-900">카카오로 시작하기</Text>
          </Pressable>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-white" edges={['top']}>
      <View className="flex-row items-center gap-2 border-b border-neutral-100 px-3 py-2">
        <Pressable onPress={() => router.back()} className="h-9 w-9 items-center justify-center">
          <Text className="text-2xl text-neutral-700">‹</Text>
        </Pressable>
        <Text className="text-base font-semibold text-neutral-900">방 게시글 등록</Text>
      </View>

      <RoomPostForm
        mode="create"
        submitLabel="등록하기"
        profile={session.user}
        onSubmit={async (values) => {
          const now = Date.now();
          const thumbnailUrl = `https://picsum.photos/seed/${now}/600/400`;

          // 명세(POST /roommate/boards) 형태로 서버에 등록 요청.
          const res = await createRoommateBoard({
            title: values.title,
            contents: values.description,
            deposit: String(values.deposit),
            mountlyRent: String(values.monthlyRent),
            managementCost: String(values.maintenanceFee ?? 0),
            roomType: values.roomType,
            region: values.region.id,
            comeableAt: values.moveInDate ? values.moveInDate.toISOString() : '',
            images: [{ image: thumbnailUrl, thumnail: true }],
          });

          if (res.error || res.status !== 200) {
            Alert.alert('등록 실패', res.error?.message ?? '잠시 후 다시 시도해주세요.');
            return;
          }

          // 등록 성공 시 로컬 스토어에도 반영해 즉시 목록/상세에 보이도록 한다.
          add({
            id: `p-${now}`,
            title: values.title,
            deposit: values.deposit,
            monthlyRent: values.monthlyRent,
            maintenanceFee: values.maintenanceFee,
            roomType: values.roomType,
            region: values.region,
            views: 0,
            likes: 0,
            createdAt: new Date(),
            moveInDate: values.moveInDate,
            status: 'open',
            author: session.user,
            description: values.description,
            options: values.options,
            thumbnailUrl,
          });
          Alert.alert('등록 완료', '게시글이 등록되었어요.', [
            { text: '확인', onPress: () => router.back() },
          ]);
        }}
      />
    </SafeAreaView>
  );
}
