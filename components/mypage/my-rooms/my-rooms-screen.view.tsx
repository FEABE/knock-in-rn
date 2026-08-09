import { Ionicons } from '@expo/vector-icons';
import { ActivityIndicator, FlatList, Pressable, RefreshControl, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { LoginPromptCard } from '@/components/auth/login-prompt-card';
import { RoomCard } from '@/components/domain';
import { ErrorState } from '@/components/ui/error-state';
import { HeaderBackButton } from '@/components/ui/header-back-button';
import {
  ReadyConfirmDialog,
  ReadyListFooterLoading,
  ReadyToast,
} from '@/components/ui/ready-to-dev-feedback';
import type { RoomPost } from '@/lib/domain';

import type { UseMyRoomsScreenReturn } from './use-my-rooms-screen';

export type MyRoomsScreenViewProps = UseMyRoomsScreenReturn;

const roomKeyExtractor = (post: RoomPost) => post.id;

/** 기존 카드 사이 구분선(-mx-4 my-6 h-px)을 FlatList separator 로 옮긴 것. */
function MyRoomSeparator() {
  return <View className="-mx-4 my-6 h-px bg-[#ECECF3]" />;
}

export function MyRoomsScreenView({
  loggedIn,
  rooms,
  loading,
  refreshing,
  error,
  loadingMore,
  onEndReached,
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
      <View className="h-12 flex-row items-center px-3">
        <HeaderBackButton onPress={onBack} />
        <View pointerEvents="none" className="flex-1 items-center justify-center">
          <Text className="text-center text-[17px] font-medium leading-[26px] text-[#17171B]">
            게시글 관리
          </Text>
        </View>
        <View className="h-10 w-10" />
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
        <View className="flex-1 items-center justify-center gap-3 bg-white">
          <ActivityIndicator color="#256EF4" />
          <Text className="text-sm text-[#AAAABA]">내 방을 불러오는 중...</Text>
        </View>
      ) : error ? (
        <View className="flex-1 bg-white">
          <ErrorState message="내 방 목록을 불러오지 못했어요" detail={error} onRetry={onRetry} />
        </View>
      ) : (
        <FlatList
          className="flex-1 bg-white"
          automaticallyAdjustContentInsets={false}
          contentInsetAdjustmentBehavior="never"
          contentContainerClassName="px-4 pb-28 pt-[21px]"
          showsVerticalScrollIndicator={false}
          data={rooms}
          keyExtractor={roomKeyExtractor}
          renderItem={({ item }) => <RoomCard post={item} onPress={onRoomPress} />}
          ItemSeparatorComponent={MyRoomSeparator}
          initialNumToRender={4}
          maxToRenderPerBatch={4}
          windowSize={7}
          onEndReached={onEndReached}
          onEndReachedThreshold={0.5}
          ListFooterComponent={<ReadyListFooterLoading visible={loadingMore} />}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRetry} tintColor="#256EF4" />
          }
          ListEmptyComponent={
            <View className="mt-8 items-center justify-center rounded-xl border border-dashed border-[#DADAE8] bg-white p-10">
              <Ionicons name="home-outline" size={30} color="#AAAABA" />
              <Text className="mt-3 text-center text-sm text-[#8A8A98]">
                아직 등록한 방 게시글이 없어요
              </Text>
            </View>
          }
        />
      )}

      {loggedIn ? (
        <Pressable
          onPress={onCreatePress}
          accessibilityRole="button"
          accessibilityLabel="방 게시글 등록하기"
          className="absolute right-4 h-12 w-12 items-center justify-center active:opacity-90"
          style={{ bottom: bottomPadding + 12 }}
        >
          <View className="h-11 w-11 items-center justify-center rounded-full bg-[#256EF4] shadow-md">
            <Ionicons name="add" size={18} color="#FFFFFF" />
          </View>
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
