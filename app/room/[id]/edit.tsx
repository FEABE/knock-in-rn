import { useLocalSearchParams, useRouter } from 'expo-router';
import { useMemo } from 'react';
import { Alert, Pressable, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { RoomPostForm } from '@/components/room/room-post-form';
import { useRoomStore, useSession } from '@/lib/domain';

export default function EditRoomScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { session } = useSession();
  const { getById, update } = useRoomStore();

  const post = useMemo(() => {
    if (typeof id === 'string') return getById(id);
    return undefined;
  }, [id, getById]);

  if (!post) {
    return (
      <SafeAreaView className="flex-1 bg-white" edges={['top']}>
        <View className="flex-1 items-center justify-center gap-3">
          <Text className="text-sm text-neutral-500">
            게시글을 찾을 수 없어요
          </Text>
          <Pressable
            onPress={() => router.back()}
            className="rounded-full bg-neutral-100 px-4 py-2"
          >
            <Text className="text-sm text-neutral-700">돌아가기</Text>
          </Pressable>
        </View>
      </SafeAreaView>
    );
  }

  if (session?.user.id !== post.author.id) {
    return (
      <SafeAreaView className="flex-1 bg-white" edges={['top']}>
        <View className="flex-1 items-center justify-center gap-3">
          <Text className="text-sm text-neutral-500">
            작성자만 수정할 수 있어요
          </Text>
          <Pressable
            onPress={() => router.back()}
            className="rounded-full bg-neutral-100 px-4 py-2"
          >
            <Text className="text-sm text-neutral-700">돌아가기</Text>
          </Pressable>
        </View>
      </SafeAreaView>
    );
  }

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
            방 게시글 수정
          </Text>
        </View>
        <Pressable
          onPress={() => {
            Alert.alert('삭제', '게시글을 삭제할까요?', [
              { text: '취소', style: 'cancel' },
              {
                text: '삭제',
                style: 'destructive',
                onPress: () => router.back(),
              },
            ]);
          }}
          className="px-3 py-1"
        >
          <Text className="text-sm text-rose-500">삭제</Text>
        </Pressable>
      </View>

      <RoomPostForm
        mode="edit"
        submitLabel="수정 완료"
        profile={session.user}
        initial={{
          title: post.title,
          deposit: String(post.deposit),
          rent: String(post.monthlyRent),
          maintenance:
            post.maintenanceFee !== undefined ? String(post.maintenanceFee) : '',
          roomType: post.roomType,
          regions: [post.region],
          description: post.description,
          moveInDate: post.moveInDate
            ? `${post.moveInDate.getFullYear()}-${String(post.moveInDate.getMonth() + 1).padStart(2, '0')}-${String(post.moveInDate.getDate()).padStart(2, '0')}`
            : '',
          options: post.options ?? [],
          showProfileInfo: true,
        }}
        onSubmit={(values) => {
          update(post.id, {
            title: values.title,
            deposit: values.deposit,
            monthlyRent: values.monthlyRent,
            maintenanceFee: values.maintenanceFee,
            roomType: values.roomType,
            region: values.region,
            description: values.description,
            moveInDate: values.moveInDate,
            options: values.options,
          });
          Alert.alert('수정 완료', '게시글이 수정되었어요.', [
            { text: '확인', onPress: () => router.back() },
          ]);
        }}
      />
    </SafeAreaView>
  );
}
