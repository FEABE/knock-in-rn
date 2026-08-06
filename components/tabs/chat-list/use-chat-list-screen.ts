import { useRouter } from 'expo-router';
import { useFocusEffect } from '@react-navigation/native';
import { useCallback, useEffect, useMemo, useRef } from 'react';

import { AnalyticsEvent, logEvent } from '@/lib/analytics';
import {
  type ChatRoomItem,
  isSameKstDay,
  kstClock,
  parseServerDate,
  useChatRooms,
} from '@/lib/api';
import { useSession } from '@/lib/domain';
import { goChatRoom, goKakaoLogin } from '@/lib/navigation/routes';

export type ChatListRow = {
  room: ChatRoomItem;
  proposal: boolean;
  unread: number;
  preview: string;
  timeLabel: string;
  onPress: () => void;
};

export type UseChatListScreenReturn = {
  rows: ChatListRow[];
  loading: boolean;
  refreshing: boolean;
  error: string | null;
  isLoggedIn: boolean;
  onLoginPress: () => void;
  reload: () => void;
};

export function useChatListScreen(): UseChatListScreenReturn {
  const router = useRouter();
  const { session } = useSession();
  const isLoggedIn = !!session;
  const { data: rooms, loading, refreshing, error, reload } = useChatRooms(isLoggedIn);
  const focusedOnceRef = useRef(false);

  useFocusEffect(
    useCallback(() => {
      if (!isLoggedIn) {
        focusedOnceRef.current = false;
        return;
      }
      // 첫 진입은 useChatRooms가 조회하므로, 이후 탭 재진입부터 서버 데이터를 새로 받는다.
      if (!focusedOnceRef.current) {
        focusedOnceRef.current = true;
        return;
      }
      reload();
    }, [isLoggedIn, reload]),
  );

  useEffect(() => {
    if (error) {
      logEvent(AnalyticsEvent.UI_ERROR_SHOWN, { screen_name: 'chat', error_code: error });
    }
  }, [error]);

  const rows = useMemo<ChatListRow[]>(
    () =>
      (rooms ?? []).map((room) => {
        const proposal = room.roommateStatus === 'PENDING';
        return {
          room,
          proposal,
          unread: room.messageCount ?? room.unreadCount ?? 0,
          preview:
            room.lastMessage ??
            (proposal ? '룸메이트를 요청했어요!' : '채팅이 시작되었어요. 인사를 건네보세요.'),
          timeLabel: formatChatTime(room.lastMessageAt ?? room.creatAt ?? room.createdAt),
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
    refreshing,
    error,
    isLoggedIn,
    onLoginPress: () => goKakaoLogin(router),
    reload,
  };
}

function formatChatTime(value?: string): string {
  const date = parseServerDate(value);
  if (!date) return '';
  const now = new Date();
  if (isSameKstDay(date, now)) {
    const { hour, minute } = kstClock(date);
    const period = hour < 12 ? '오전' : '오후';
    const h = hour % 12 || 12;
    return `${period} ${String(h).padStart(2, '0')}:${String(minute).padStart(2, '0')}`;
  }
  if (isSameKstDay(date, new Date(now.getTime() - 24 * 60 * 60 * 1000))) {
    return '어제';
  }
  const { month, day } = kstClock(date);
  return `${month}.${String(day).padStart(2, '0')}`;
}
