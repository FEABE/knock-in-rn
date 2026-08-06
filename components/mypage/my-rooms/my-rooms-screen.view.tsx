import { Ionicons } from '@expo/vector-icons';
import { ActivityIndicator, Pressable, RefreshControl, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { LoginPromptCard } from '@/components/auth/login-prompt-card';
import { RoomCard } from '@/components/domain';
import { ErrorState } from '@/components/ui/error-state';
import { ReadyConfirmDialog, ReadyToast } from '@/components/ui/ready-to-dev-feedback';

import type { UseMyRoomsScreenReturn } from './use-my-rooms-screen';

export type MyRoomsScreenViewProps = UseMyRoomsScreenReturn;

export function MyRoomsScreenView({
  loggedIn,
  rooms,
  loading,
  refreshing,
  error,
  deleting,
  bottomPadding,
  deleteDialogOpen,
  toastMessage,
  onBack,
  onLoginPress,
  onRetry,
  onCreatePress,
  onRoomPress,
  onCancelDelete,
  onConfirmDelete,
}: MyRoomsScreenViewProps) {
  return (
    <SafeAreaView className="flex-1 bg-white" edges={['top']}>
      <View className="h-14 flex-row items-center px-3">
        <Pressable onPress={onBack} className="h-10 w-10 items-center justify-center">
          <Ionicons name="chevron-back" size={24} color="#696976" />
        </Pressable>
        <Text className="pointer-events-none absolute left-0 right-0 text-center text-[17px] font-semibold text-[#242429]">
          게시글 관리
        </Text>
      </View>

      {!loggedIn ? (
        <View className="p-5">
          <LoginPromptCard
            title="로그인하고 내 방을 관리해보세요"
            description="등록한 게시글을 확인하고 관리할 수 있어요"
            onPress={onLoginPress}
          />
        </View>
      ) : loading ? (
        <View className="flex-1 items-center justify-center gap-3 bg-[#F7F8FC]">
          <ActivityIndicator color="#256EF4" />
          <Text className="text-sm text-[#AAAABA]">내 방을 불러오는 중...</Text>
        </View>
      ) : error ? (
        <View className="flex-1 bg-[#F7F8FC]">
          <ErrorState message="내 방 목록을 불러오지 못했어요" detail={error} onRetry={onRetry} />
        </View>
      ) : (
        <ScrollView
          className="flex-1 bg-[#F7F8FC]"
          contentContainerClassName="gap-5 px-4 pb-28 pt-5"
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRetry} tintColor="#256EF4" />
          }
        >
          {rooms.length === 0 ? (
            <View className="mt-8 items-center justify-center rounded-xl border border-dashed border-[#DADAE8] bg-white p-10">
              <Ionicons name="home-outline" size={30} color="#AAAABA" />
              <Text className="mt-3 text-center text-sm text-[#8A8A98]">
                아직 등록한 방 게시글이 없어요
              </Text>
            </View>
          ) : (
            rooms.map((post) => <RoomCard key={post.id} post={post} onPress={onRoomPress} />)
          )}
        </ScrollView>
      )}

      {loggedIn ? (
        <Pressable
          onPress={onCreatePress}
          accessibilityRole="button"
          accessibilityLabel="방 게시글 등록하기"
          className="absolute right-5 h-14 w-14 items-center justify-center rounded-full bg-[#256EF4] shadow-lg active:opacity-90"
          style={{ bottom: bottomPadding + 12 }}
        >
          <Ionicons name="add" size={28} color="#FFFFFF" />
        </Pressable>
      ) : null}

      <ReadyConfirmDialog
        open={deleteDialogOpen}
        title="게시글을 삭제하시겠어요?"
        description="게시글 삭제 후에는 복구가 불가해요"
        cancelLabel="취소"
        confirmLabel="삭제"
        processing={deleting}
        onCancel={onCancelDelete}
        onConfirm={onConfirmDelete}
      />
      <ReadyToast visible={toastMessage !== null} message={toastMessage ?? ''} tone="success" />
    </SafeAreaView>
  );
}
