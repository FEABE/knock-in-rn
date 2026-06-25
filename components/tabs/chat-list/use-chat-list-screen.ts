import { useRouter } from 'expo-router';
import { useEffect, useMemo } from 'react';

import { AnalyticsEvent, logEvent } from '@/lib/analytics';
import { type ChatRoomItem, useChatRooms } from '@/lib/api';
import { goChatRoom } from '@/lib/navigation/routes';

export type ChatListRow = {
  room: ChatRoomItem;
  proposal: boolean;
  unread: number;
  preview: string;
  onPress: () => void;
};

export type UseChatListScreenReturn = {
  rows: ChatListRow[];
  loading: boolean;
  error: string | null;
};

export function useChatListScreen(): UseChatListScreenReturn {
  const router = useRouter();
  const { data: rooms, loading, error } = useChatRooms();

  useEffect(() => {
    if (error) {
      logEvent(AnalyticsEvent.UI_ERROR_SHOWN, { screen_name: 'chat', error_code: error });
    }
  }, [error]);

  const rows = useMemo<ChatListRow[]>(
    () =>
      (rooms ?? []).map((room, index) => {
        const proposal = room.isAgree !== true;
        return {
          room,
          proposal,
          unread: room.unreadCount ?? (index === 1 ? 3 : 0),
          preview:
            room.lastMessage ??
            (proposal
              ? '룸메이트를 제안했어요 · 궁합 91점'
              : '채팅이 시작되었어요. 인사를 건네보세요.'),
          onPress: () => {
            logEvent(AnalyticsEvent.CHAT_ROOM_ENTER, { room_id: room.chatRoomId });
            goChatRoom(router, String(room.chatRoomId));
          },
        };
      }),
    [rooms, router],
  );

  return {
    rows,
    loading,
    error,
  };
}
