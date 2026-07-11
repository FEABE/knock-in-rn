import { Ionicons } from '@expo/vector-icons';
import { Pressable, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { RoomPostForm } from '@/components/room/room-post-form';

import type { UseEditRoomScreenReturn } from './use-edit-room-screen';

export type EditRoomScreenViewProps = UseEditRoomScreenReturn;

export function EditRoomScreenView({
  state,
  profile,
  initial,
  submitting,
  onBack,
  onDelete,
  onSubmit,
}: EditRoomScreenViewProps) {
  if (state === 'loading') {
    return <MessageState message="게시글을 불러오는 중..." onBack={onBack} />;
  }

  if (state === 'missing') {
    return <MessageState message="게시글을 찾을 수 없어요" onBack={onBack} />;
  }

  if (state === 'forbidden' || !profile || !initial) {
    return <MessageState message="작성자만 수정할 수 있어요" onBack={onBack} />;
  }

  return (
    <SafeAreaView className="flex-1 bg-white" edges={['top']}>
      <View className="relative h-12 items-center justify-center px-3">
        <Pressable onPress={onBack} className="absolute left-3 h-9 w-9 items-center justify-center">
          <Ionicons name="chevron-back" size={24} color="#404047" />
        </Pressable>
        <Text className="text-base font-semibold text-neutral-900">게시글 수정</Text>
        <Pressable onPress={onDelete} className="absolute right-3 px-3 py-1">
          <Text className="text-sm text-rose-500">삭제</Text>
        </Pressable>
      </View>

      <RoomPostForm
        mode="edit"
        submitLabel="수정 완료"
        profile={profile}
        initial={initial}
        submitting={submitting}
        onSubmit={onSubmit}
      />
    </SafeAreaView>
  );
}

function MessageState({ message, onBack }: { message: string; onBack: () => void }) {
  return (
    <SafeAreaView className="flex-1 bg-white" edges={['top', 'bottom']}>
      <View className="flex-1 items-center justify-center gap-3">
        <Text className="text-sm text-neutral-500">{message}</Text>
        <Pressable onPress={onBack} className="rounded-full bg-neutral-100 px-4 py-2">
          <Text className="text-sm text-neutral-700">돌아가기</Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}
