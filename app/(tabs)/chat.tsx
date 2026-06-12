import { useRouter } from 'expo-router';
import { useEffect } from 'react';
import { ActivityIndicator, Pressable, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { AnalyticsEvent, logEvent } from '@/lib/analytics';
import { type ChatRoomItem, useChatRooms } from '@/lib/api';
import { useSession } from '@/lib/domain';

export default function ChatScreen() {
  const router = useRouter();
  const { session } = useSession();
  const { data: rooms, loading, error } = useChatRooms();

  // 채팅방 목록 로드 실패 노출.
  useEffect(() => {
    if (error) {
      logEvent(AnalyticsEvent.UI_ERROR_SHOWN, { screen_name: 'chat', error_code: error });
    }
  }, [error]);

  if (!session) {
    return (
      <SafeAreaView className="flex-1 bg-white" edges={['top']}>
        <View className="flex-1 items-center justify-center gap-4 p-10">
          <Text className="text-base text-neutral-500">채팅 기능은 로그인 후 이용 가능해요</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-white" edges={['top']}>
      <View className="px-5 pb-3 pt-2">
        <Text className="text-2xl font-bold text-neutral-900">채팅</Text>
      </View>

      {loading ? (
        <View className="flex-1 items-center justify-center gap-3">
          <ActivityIndicator color="#256EF4" />
          <Text className="text-sm text-neutral-400">채팅방을 불러오는 중...</Text>
        </View>
      ) : error ? (
        <View className="flex-1 items-center justify-center gap-2 p-10">
          <Text className="text-sm text-neutral-500">채팅방을 불러오지 못했어요</Text>
          <Text className="text-xs text-neutral-400">{error}</Text>
        </View>
      ) : !rooms || rooms.length === 0 ? (
        <View className="flex-1 items-center justify-center p-10">
          <Text className="text-sm text-neutral-400">아직 채팅방이 없어요</Text>
        </View>
      ) : (
        <ScrollView contentContainerClassName="p-2">
          {rooms.map((room, i) => (
            <ChatRoomRow
              key={room.chatRoomId}
              room={room}
              // 데모: 첫 행은 매칭 제안, 일부는 안읽음 표시
              proposal={room.isAgree !== 'true'}
              unread={i === 1 ? 3 : 0}
              onPress={() => {
                logEvent(AnalyticsEvent.CHAT_ROOM_ENTER, { room_id: room.chatRoomId });
                router.push(`/chat/${room.chatRoomId}` as never);
              }}
            />
          ))}
        </ScrollView>
      )}
    </SafeAreaView>
  );
}

function ChatRoomRow({
  room,
  proposal,
  unread,
  onPress,
}: {
  room: ChatRoomItem;
  proposal: boolean;
  unread: number;
  onPress: () => void;
}) {
  const preview = proposal
    ? '룸메이트를 제안했어요 · 궁합 91점'
    : '채팅이 시작되었어요. 인사를 건네보세요.';
  return (
    <Pressable
      onPress={onPress}
      className={`flex-row items-center gap-3 rounded-2xl p-3 active:opacity-80 ${
        proposal ? 'bg-[#256EF4]/10' : ''
      }`}
    >
      <View className="h-12 w-12 items-center justify-center rounded-full bg-[#256EF4]/15">
        <Text className="font-semibold text-[#256EF4]">{room.name.charAt(0)}</Text>
      </View>
      <View className="flex-1 gap-0.5">
        <View className="flex-row items-center gap-2">
          {proposal ? (
            <View className="rounded bg-[#256EF4] px-1.5 py-0.5">
              <Text className="text-[10px] font-medium text-white">매칭 요청</Text>
            </View>
          ) : null}
          <Text className="text-sm font-semibold text-neutral-900">{room.name}</Text>
        </View>
        <Text numberOfLines={1} className="text-xs text-neutral-500">
          {preview}
        </Text>
      </View>
      <View className="items-end gap-1">
        <Text className="text-[10px] text-neutral-400">방금</Text>
        {unread > 0 ? (
          <View className="h-5 min-w-5 items-center justify-center rounded-full bg-[#256EF4] px-1">
            <Text className="text-[10px] font-bold text-white">{unread}</Text>
          </View>
        ) : null}
      </View>
    </Pressable>
  );
}
