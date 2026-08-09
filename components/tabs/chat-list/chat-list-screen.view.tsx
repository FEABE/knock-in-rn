import { FlatList, Pressable, RefreshControl, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { LoginPromptCard } from '@/components/auth/login-prompt-card';
import { ReadyChatStatusBadge, ReadyProfileAvatar } from '@/components/ui/ready-to-dev-components';
import {
  ReadyEmptyState,
  ReadyErrorState,
  ReadyLoadingState,
} from '@/components/ui/ready-to-dev-feedback';

import type { ChatListRow, UseChatListScreenReturn } from './use-chat-list-screen';

const chatRowKeyExtractor = (row: ChatListRow) => String(row.room.chatRoomId);
const EMPTY_ROWS: ChatListRow[] = [];

const renderChatRow = ({ item }: { item: ChatListRow }) => <ChatRoomRow row={item} />;

export type ChatListScreenViewProps = UseChatListScreenReturn;

export function ChatListScreenView({
  rows,
  loading,
  refreshing,
  error,
  isLoggedIn,
  onLoginPress,
  reload,
}: ChatListScreenViewProps) {
  return (
    <SafeAreaView className="flex-1 bg-white" edges={['top']}>
      <View className="px-4 pb-7 pt-4">
        <Text className="text-xl font-bold leading-[30px] text-[#17171B]">채팅</Text>
      </View>

      {!isLoggedIn ? (
        <View className="px-5 pt-2">
          <LoginPromptCard
            title="로그인하고 대화를 시작해보세요"
            description="마음에 드는 룸메이트와 바로 채팅할 수 있어요"
            onPress={onLoginPress}
          />
        </View>
      ) : (
        <FlatList
          automaticallyAdjustContentInsets={false}
          contentInsetAdjustmentBehavior="never"
          contentContainerClassName="grow"
          data={loading || error ? EMPTY_ROWS : rows}
          keyExtractor={chatRowKeyExtractor}
          renderItem={renderChatRow}
          initialNumToRender={12}
          maxToRenderPerBatch={10}
          windowSize={11}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={reload} tintColor="#256EF4" />
          }
          ListEmptyComponent={
            loading ? (
              <ReadyLoadingState label="채팅방을 불러오는 중..." />
            ) : error ? (
              <ReadyErrorState title="채팅방을 불러오지 못했어요" description={error} />
            ) : (
              <ReadyEmptyState
                title="아직 채팅방이 없어요"
                description="마음에 드는 룸메이트에게 먼저 말을 걸어보세요"
              />
            )
          }
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
      className={`flex-row items-center gap-3 px-4 ${
        row.proposal
          ? 'h-[83px] bg-[#ECF2FE] pb-4 pt-[15px] active:bg-[#DCE8FD]'
          : 'min-h-[68px] border-b border-[#F6F6FA] py-2 active:bg-[#F6F6FA]'
      }`}
    >
      <ReadyProfileAvatar name={name} imageUrl={row.room.memberProfileImageUrl} size={52} />
      <View className="flex-1 gap-1">
        <View className="flex-row items-center">
          <View className="min-w-0 flex-1 flex-row items-center gap-1.5">
            <Text
              numberOfLines={1}
              className="shrink text-base font-semibold leading-6 text-[#17171B]"
            >
              {name}
            </Text>
            {row.proposal ? (
              <ReadyChatStatusBadge status="request" />
            ) : matched ? (
              <ReadyChatStatusBadge status="roommate" />
            ) : null}
          </View>
          <Text className="ml-2 shrink-0 text-sm leading-[21px] text-[#AAAABA]">
            {row.timeLabel}
          </Text>
        </View>
        <View className="flex-row items-center gap-2">
          <Text
            numberOfLines={1}
            className={`flex-1 text-sm leading-[21px] ${
              row.proposal
                ? 'font-medium text-[#256EF4]'
                : row.unread > 0
                  ? 'text-[#17171B]'
                  : 'text-[#696976]'
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
