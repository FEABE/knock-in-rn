import { Pressable, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { LoginPromptCard } from '@/components/auth/login-prompt-card';
import {
  ReadyBadge,
  ReadyDivider,
  ReadyPageTitle,
  ReadyProfileAvatar,
} from '@/components/ui/ready-to-dev-components';
import {
  ReadyEmptyState,
  ReadyErrorState,
  ReadyLoadingState,
} from '@/components/ui/ready-to-dev-feedback';

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
      <ReadyPageTitle title="채팅" />

      {!isLoggedIn ? (
        <View className="px-5 pt-2">
          <LoginPromptCard
            title="로그인하고 대화를 시작해보세요"
            description="룸메이트와 채팅하고 매칭 요청을 확인할 수 있어요"
            onPress={onLoginPress}
          />
        </View>
      ) : loading || requestsLoading ? (
        <ReadyLoadingState label="채팅방을 불러오는 중..." />
      ) : error ? (
        <ReadyErrorState title="채팅방을 불러오지 못했어요" description={error} />
      ) : rows.length === 0 && requestRows.length === 0 ? (
        <ReadyEmptyState
          title="아직 채팅방이 없어요"
          description="마음에 드는 룸메이트에게 먼저 말을 걸어보세요"
        />
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
              <ReadyDivider />
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
      className="min-h-[76px] flex-row items-center gap-3 bg-[#F4F7FE] px-4 py-3 active:bg-[#E9F0FE]"
    >
      <ReadyProfileAvatar name={row.name} />
      <View className="flex-1 gap-0.5">
        <View className="flex-row items-center gap-2">
          <Text className="text-[15px] font-bold text-[#17171B]">{row.name}</Text>
          <ReadyBadge label="매칭 요청" tone="blue" />
        </View>
        {row.meta ? (
          <View className="flex-row items-center gap-1.5">
            <ReadyBadge label={row.meta} tone="red" />
            {row.scoreLabel ? <ReadyBadge label={row.scoreLabel} tone="blue" /> : null}
          </View>
        ) : (
          <Text numberOfLines={1} className="text-sm text-[#17171B]">
            {row.preview}
          </Text>
        )}
      </View>
      <View className="items-end gap-1">
        <Text className="text-xs text-[#AAAABA]">{row.timeLabel}</Text>
        {!row.meta && row.scoreLabel ? (
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
      <ReadyProfileAvatar name={name} imageUrl={row.room.memberProfileImageUrl} />
      <View className="flex-1 gap-0.5">
        <View className="flex-row items-center gap-2">
          <Text className="text-[17px] font-bold text-[#17171B]">{name}</Text>
          {row.proposal ? <ReadyBadge label="매칭 요청" tone="blue" /> : null}
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
