import { Ionicons } from '@expo/vector-icons';
import { Pressable, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { RoomPostForm } from '@/components/room/room-post-form';

import type { UseNewRoomScreenReturn } from './use-new-room-screen';

export type NewRoomScreenViewProps = UseNewRoomScreenReturn;

export function NewRoomScreenView({
  session,
  submitting,
  onBack,
  onSignIn,
  onSubmit,
}: NewRoomScreenViewProps) {
  if (!session) {
    return (
      <SafeAreaView className="flex-1 bg-white" edges={['top', 'bottom']}>
        <View className="flex-1 items-center justify-center gap-4 p-10">
          <Text className="text-base text-neutral-500">방을 등록하려면 로그인이 필요해요</Text>
          <Pressable onPress={onSignIn} className="rounded-full bg-yellow-300 px-5 py-3">
            <Text className="text-sm font-medium text-neutral-900">카카오로 시작하기</Text>
          </Pressable>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-white" edges={['top']}>
      <View className="relative h-12 items-center justify-center px-3">
        <Pressable onPress={onBack} className="absolute left-3 h-9 w-9 items-center justify-center">
          <Ionicons name="chevron-back" size={24} color="#404047" />
        </Pressable>
        <Text className="text-base font-semibold text-neutral-900">게시글 등록</Text>
      </View>

      <RoomPostForm
        mode="create"
        submitLabel="등록하기"
        profile={session.user}
        submitting={submitting}
        onSubmit={onSubmit}
      />
    </SafeAreaView>
  );
}
