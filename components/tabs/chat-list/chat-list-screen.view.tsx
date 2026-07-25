import { Image } from 'expo-image';
import { ActivityIndicator, Pressable, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { LoginPromptCard } from '@/components/auth/login-prompt-card';

import type { ChatListRow, ChatRequestRow, UseChatListScreenReturn } from './use-chat-list-screen';

export type ChatListScreenViewProps = UseChatListScreenReturn;

export function ChatListScreenView({
  rows,
  requestRows,
  loading,
  requestsLoading,
  error,
  isLoggedIn,
  onLoginPress,
}: ChatListScreenViewProps) {
  return (
    <SafeAreaView className="flex-1 bg-white" edges={['top']}>
      <View className="px-4 pb-5 pt-5">
        <Text className="text-2xl font-bold text-[#17171B]">채팅</Text>
      </View>

      {!isLoggedIn ? (
        <View className="px-5 pt-2">
          <LoginPromptCard
            title="로그인하고 대화를 시작해보세요"
            description="룸메이트와 채팅하고 매칭 요청을 확인할 수 있어요"
            onPress={onLoginPress}
          />
        </View>
      ) : loading || requestsLoading ? (
        <View className="flex-1 items-center justify-center gap-3">
          <ActivityIndicator color="#256EF4" />
          <Text className="text-sm text-neutral-400">채팅방을 불러오는 중...</Text>
        </View>
      ) : error ? (
        <View className="flex-1 items-center justify-center gap-2 p-10">
          <Text className="text-sm text-neutral-500">채팅방을 불러오지 못했어요</Text>
          <Text className="text-xs text-neutral-400">{error}</Text>
        </View>
      ) : rows.length === 0 && requestRows.length === 0 ? (
        <View className="flex-1 items-center justify-center p-10">
          <Text className="text-sm text-neutral-400">아직 채팅방이 없어요</Text>
        </View>
      ) : (
        <ScrollView>
          {requestRows.length ? (
            <View>
              {requestRows.map((row) => (
                <ChatRequestListRow
                  key={String(row.request.chatReqId ?? row.request.requiredId)}
                  row={row}
                />
              ))}
            </View>
          ) : null}
          {rows.map((row) => (
            <ChatRoomRow key={String(row.room.chatRoomId)} row={row} />
          ))}
        </ScrollView>
      )}
    </SafeAreaView>
  );
}

function ChatRequestListRow({ row }: { row: ChatRequestRow }) {
  return (
    <Pressable
      onPress={row.onPress}
      className="min-h-[76px] flex-row items-center gap-3 px-4 py-3 active:bg-[#F6F6FA]"
    >
      <View className="h-12 w-12 items-center justify-center rounded-full bg-[#E9F0FE]">
        <Text className="text-base font-semibold text-[#256EF4]">{row.name.charAt(0)}</Text>
      </View>
      <View className="flex-1 gap-0.5">
        <View className="flex-row items-center gap-2">
          <Text className="text-[15px] font-bold text-[#17171B]">{row.name}</Text>
          <View className="rounded bg-[#E9F0FE] px-2 py-0.5">
            <Text className="text-xs font-medium text-[#256EF4]">매칭 요청</Text>
          </View>
        </View>
        <Text numberOfLines={1} className="text-sm text-[#17171B]">
          {row.preview}
        </Text>
      </View>
      <View className="items-end gap-1">
        <Text className="text-xs text-[#AAAABA]">{row.timeLabel}</Text>
        {row.scoreLabel ? (
          <Text className="text-[11px] font-medium text-[#256EF4]">{row.scoreLabel}</Text>
        ) : null}
      </View>
    </Pressable>
  );
}

function ChatRoomRow({ row }: { row: ChatListRow }) {
  const name = row.room.name ?? '이름 없음';
  return (
    <Pressable
      onPress={row.onPress}
      className="min-h-[76px] flex-row items-center gap-3 px-4 py-3 active:bg-[#F6F6FA]"
    >
      {row.room.memberProfileImageUrl ? (
        <Image
          source={{ uri: row.room.memberProfileImageUrl }}
          style={{ width: 48, height: 48, borderRadius: 24 }}
          contentFit="cover"
        />
      ) : (
        <View className="h-12 w-12 items-center justify-center rounded-full bg-[#ECECF3]">
          <Text className="text-lg font-semibold text-[#696976]">{name.charAt(0)}</Text>
        </View>
      )}
      <View className="flex-1 gap-0.5">
        <View className="flex-row items-center gap-2">
          <Text className="text-[17px] font-bold text-[#17171B]">{name}</Text>
          {row.proposal ? (
            <View className="rounded bg-[#E9F0FE] px-2 py-0.5">
              <Text className="text-xs font-medium text-[#256EF4]">매칭 요청</Text>
            </View>
          ) : null}
        </View>
        <Text numberOfLines={1} className="text-sm text-[#696976]">
          {row.preview}
        </Text>
      </View>
      <View className="items-end gap-1">
        <Text className="text-[15px] text-[#AAAABA]">{row.timeLabel}</Text>
        {row.unread > 0 ? (
          <View className="h-6 min-w-6 items-center justify-center rounded-full bg-[#256EF4] px-1.5">
            <Text className="text-sm font-medium text-white">{row.unread}</Text>
          </View>
        ) : null}
      </View>
    </Pressable>
  );
}
