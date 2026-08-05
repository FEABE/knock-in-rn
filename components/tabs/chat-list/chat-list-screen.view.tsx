import { FlatList, Pressable, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { LoginPromptCard } from '@/components/auth/login-prompt-card';
import {
  ReadyBadge,
  ReadyPageTitle,
  ReadyProfileAvatar,
} from '@/components/ui/ready-to-dev-components';
import {
  ReadyEmptyState,
  ReadyErrorState,
  ReadyLoadingState,
} from '@/components/ui/ready-to-dev-feedback';

import type { ChatListRow, UseChatListScreenReturn } from './use-chat-list-screen';

const chatRowKeyExtractor = (row: ChatListRow) => String(row.room.chatRoomId);

const renderChatRow = ({ item }: { item: ChatListRow }) => <ChatRoomRow row={item} />;

export type ChatListScreenViewProps = UseChatListScreenReturn;

export function ChatListScreenView({
  rows,
  loading,
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
            description="마음에 드는 룸메이트와 바로 채팅할 수 있어요"
            onPress={onLoginPress}
          />
        </View>
      ) : loading ? (
        <ReadyLoadingState label="채팅방을 불러오는 중..." />
      ) : error ? (
        <ReadyErrorState title="채팅방을 불러오지 못했어요" description={error} />
      ) : rows.length === 0 ? (
        <ReadyEmptyState
          title="아직 채팅방이 없어요"
          description="마음에 드는 룸메이트에게 먼저 말을 걸어보세요"
        />
      ) : (
        <FlatList
          data={rows}
          keyExtractor={chatRowKeyExtractor}
          renderItem={renderChatRow}
          initialNumToRender={12}
          maxToRenderPerBatch={10}
          windowSize={11}
        />
      )}
    </SafeAreaView>
  );
}

function ChatRoomRow({ row }: { row: ChatListRow }) {
  const name = row.room.name ?? row.room.memberName ?? '이름 없음';
  const matched =
    row.room.isRoommate === true ||
    row.room.isAgree === true ||
    row.room.roommateStatus === 'ACCEPTED';
  return (
    <Pressable
      onPress={row.onPress}
      className={`min-h-[68px] flex-row items-center gap-3 px-4 py-2 ${
        row.proposal
          ? 'bg-[#ECF2FE] active:bg-[#DCE8FD]'
          : 'border-b border-[#F6F6FA] active:bg-[#F6F6FA]'
      }`}
    >
      <ReadyProfileAvatar name={name} imageUrl={row.room.memberProfileImageUrl} size={52} />
      <View className="flex-1 gap-1">
        <View className="flex-row items-center gap-1.5">
          <Text numberOfLines={1} className="shrink text-base font-bold text-[#17171B]">
            {name}
          </Text>
          {row.proposal ? (
            <ReadyBadge label="매칭 요청" tone="blue" />
          ) : matched ? (
            <ReadyBadge label="룸메이트" tone="neutral" />
          ) : null}
          <View className="flex-1" />
          <Text className="text-[13px] leading-5 text-[#AAAABA]">{row.timeLabel}</Text>
        </View>
        <View className="flex-row items-center gap-2">
          <Text
            numberOfLines={1}
            className={`flex-1 text-sm leading-[21px] ${
              row.proposal ? 'font-semibold text-[#256EF4]' : 'text-[#696976]'
            }`}
          >
            {row.preview}
          </Text>
          {row.unread > 0 ? (
            <View className="h-[22px] min-w-[22px] items-center justify-center rounded-full bg-[#256EF4] px-1.5">
              <Text className="text-xs font-medium text-white">
                {row.unread > 99 ? '99+' : row.unread}
              </Text>
            </View>
          ) : null}
        </View>
      </View>
    </Pressable>
  );
}
