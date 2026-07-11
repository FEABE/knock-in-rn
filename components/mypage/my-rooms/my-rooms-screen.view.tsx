import { Ionicons } from '@expo/vector-icons';
import { ActivityIndicator, Pressable, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { RoomCard } from '@/components/domain';
import { LoginPromptCard } from '@/components/auth/login-prompt-card';
import { ErrorState } from '@/components/ui/error-state';

import type { UseMyRoomsScreenReturn } from './use-my-rooms-screen';

export type MyRoomsScreenViewProps = UseMyRoomsScreenReturn;

export function MyRoomsScreenView({
  loggedIn,
  rooms,
  loading,
  error,
  deleting,
  bottomPadding,
  onBack,
  onLoginPress,
  onRetry,
  onCreatePress,
  onRoomPress,
  onEditPress,
  onDeletePress,
}: MyRoomsScreenViewProps) {
  return (
    <SafeAreaView className="flex-1 bg-white" edges={['top']}>
      <View className="flex-row items-center gap-2 border-b border-neutral-100 px-3 py-2">
        <Pressable onPress={onBack} className="h-9 w-9 items-center justify-center">
          <Ionicons name="chevron-back" size={24} color="#3F3F47" />
        </Pressable>
        <Text className="text-base font-semibold text-neutral-900">내 방 관리</Text>
      </View>

      {!loggedIn ? (
        <View className="p-5">
          <LoginPromptCard
            title="로그인하고 내 방을 관리해보세요"
            description="등록한 게시글을 확인하고 수정하거나 삭제할 수 있어요"
            onPress={onLoginPress}
          />
        </View>
      ) : loading ? (
        <View className="flex-1 items-center justify-center gap-3">
          <ActivityIndicator color="#256EF4" />
          <Text className="text-sm text-[#AAAABA]">내 방을 불러오는 중...</Text>
        </View>
      ) : error ? (
        <ErrorState message="내 방 목록을 불러오지 못했어요" detail={error} onRetry={onRetry} />
      ) : (
        <ScrollView className="flex-1" contentContainerClassName="gap-5 p-5 pb-28">
          {rooms.length === 0 ? (
            <View className="rounded-lg border border-dashed border-neutral-200 p-10">
              <Text className="text-center text-sm text-neutral-400">
                아직 등록한 방 게시글이 없어요
              </Text>
            </View>
          ) : (
            rooms.map((post) => (
              <View key={post.id} className="gap-2">
                <RoomCard post={post} onPress={onRoomPress} />
                <View className="flex-row justify-end gap-2 px-1">
                  <Pressable
                    onPress={() => onEditPress(post)}
                    disabled={deleting}
                    className="h-9 w-9 items-center justify-center rounded-lg bg-neutral-100 active:opacity-80"
                    accessibilityLabel="게시글 수정"
                  >
                    <Ionicons name="pencil-outline" size={18} color="#696976" />
                  </Pressable>
                  <Pressable
                    onPress={() => onDeletePress(post)}
                    disabled={deleting}
                    className="h-9 w-9 items-center justify-center rounded-lg bg-red-50 active:opacity-80"
                    accessibilityLabel="게시글 삭제"
                  >
                    {deleting ? (
                      <ActivityIndicator size="small" color="#EF4444" />
                    ) : (
                      <Ionicons name="trash-outline" size={18} color="#EF4444" />
                    )}
                  </Pressable>
                </View>
              </View>
            ))
          )}
        </ScrollView>
      )}

      {loggedIn ? (
        <View
          className="absolute inset-x-0 bottom-0 border-t border-neutral-100 bg-white px-5 pt-3"
          style={{ paddingBottom: bottomPadding }}
        >
          <Pressable
            onPress={onCreatePress}
            className="h-12 flex-row items-center justify-center gap-2 rounded-lg bg-[#256EF4] active:opacity-90"
          >
            <Ionicons name="add" size={20} color="#ffffff" />
            <Text className="text-base font-semibold text-white">방 게시글 등록하기</Text>
          </Pressable>
        </View>
      ) : null}
    </SafeAreaView>
  );
}
