import { Pressable, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { RoomCard } from '@/components/domain';

import type { UseMyRoomsScreenReturn } from './use-my-rooms-screen';

export type MyRoomsScreenViewProps = UseMyRoomsScreenReturn;

export function MyRoomsScreenView({
  loggedIn,
  rooms,
  onBack,
  onCreatePress,
  onRoomPress,
  onEditPress,
  onDeletePress,
}: MyRoomsScreenViewProps) {
  if (!loggedIn) {
    return (
      <SafeAreaView className="flex-1 bg-white" edges={['top']}>
        <View className="flex-1 items-center justify-center p-10">
          <Text className="text-sm text-neutral-500">로그인 후 이용 가능해요</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-white" edges={['top']}>
      <View className="flex-row items-center gap-2 border-b border-neutral-100 px-3 py-2">
        <Pressable onPress={onBack} className="h-9 w-9 items-center justify-center">
          <Text className="text-2xl text-neutral-700">‹</Text>
        </Pressable>
        <Text className="text-base font-semibold text-neutral-900">내 방 관리</Text>
      </View>

      <ScrollView className="flex-1" contentContainerClassName="gap-4 p-5 pb-28">
        {rooms.length === 0 ? (
          <View className="rounded-2xl border border-dashed border-neutral-200 p-10">
            <Text className="text-center text-sm text-neutral-400">
              아직 등록한 방 게시글이 없어요
            </Text>
          </View>
        ) : (
          rooms.map((post) => (
            <View key={post.id} className="overflow-hidden rounded-2xl border border-neutral-200">
              <RoomCard post={post} className="border-0" onPress={onRoomPress} />
              <View className="flex-row justify-end gap-2 border-t border-neutral-100 px-4 py-2">
                <Pressable
                  onPress={() => onEditPress(post)}
                  className="rounded-lg bg-neutral-100 px-4 py-1.5 active:opacity-80"
                >
                  <Text className="text-xs font-medium text-neutral-700">수정</Text>
                </Pressable>
                <Pressable
                  onPress={() => onDeletePress(post)}
                  className="rounded-lg bg-red-50 px-4 py-1.5 active:opacity-80"
                >
                  <Text className="text-xs font-medium text-red-500">삭제</Text>
                </Pressable>
              </View>
            </View>
          ))
        )}
      </ScrollView>

      <View className="absolute inset-x-0 bottom-0 border-t border-neutral-100 bg-white px-5 pb-6 pt-3">
        <Pressable
          onPress={onCreatePress}
          className="h-12 items-center justify-center rounded-xl bg-[#256EF4] active:opacity-90"
        >
          <Text className="text-base font-semibold text-white">+ 방 게시글 등록하기</Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}
