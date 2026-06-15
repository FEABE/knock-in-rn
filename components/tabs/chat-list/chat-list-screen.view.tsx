import { ActivityIndicator, Pressable, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import type { ChatListRow, UseChatListScreenReturn } from './use-chat-list-screen';

export type ChatListScreenViewProps = UseChatListScreenReturn;

export function ChatListScreenView({ rows, loading, error }: ChatListScreenViewProps) {
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
      ) : rows.length === 0 ? (
        <View className="flex-1 items-center justify-center p-10">
          <Text className="text-sm text-neutral-400">아직 채팅방이 없어요</Text>
        </View>
      ) : (
        <ScrollView contentContainerClassName="p-2">
          {rows.map((row) => (
            <ChatRoomRow key={row.room.chatRoomId} row={row} />
          ))}
        </ScrollView>
      )}
    </SafeAreaView>
  );
}

function ChatRoomRow({ row }: { row: ChatListRow }) {
  return (
    <Pressable
      onPress={row.onPress}
      className={`flex-row items-center gap-3 rounded-2xl p-3 active:opacity-80 ${
        row.proposal ? 'bg-[#256EF4]/10' : ''
      }`}
    >
      <View className="h-12 w-12 items-center justify-center rounded-full bg-[#256EF4]/15">
        <Text className="font-semibold text-[#256EF4]">{row.room.name.charAt(0)}</Text>
      </View>
      <View className="flex-1 gap-0.5">
        <View className="flex-row items-center gap-2">
          {row.proposal ? (
            <View className="rounded bg-[#256EF4] px-1.5 py-0.5">
              <Text className="text-[10px] font-medium text-white">매칭 요청</Text>
            </View>
          ) : null}
          <Text className="text-sm font-semibold text-neutral-900">{row.room.name}</Text>
        </View>
        <Text numberOfLines={1} className="text-xs text-neutral-500">
          {row.preview}
        </Text>
      </View>
      <View className="items-end gap-1">
        <Text className="text-[10px] text-neutral-400">방금</Text>
        {row.unread > 0 ? (
          <View className="h-5 min-w-5 items-center justify-center rounded-full bg-[#256EF4] px-1">
            <Text className="text-[10px] font-bold text-white">{row.unread}</Text>
          </View>
        ) : null}
      </View>
    </Pressable>
  );
}
