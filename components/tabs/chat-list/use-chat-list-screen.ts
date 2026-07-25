import { useRouter } from 'expo-router';
import { useEffect, useMemo } from 'react';

import { AnalyticsEvent, logEvent } from '@/lib/analytics';
import { type ChatRequestItem, type ChatRoomItem, useChatRequests, useChatRooms } from '@/lib/api';
import { useSession } from '@/lib/domain';
import { goChatRequest, goChatRoom, goKakaoLogin } from '@/lib/navigation/routes';

export type ChatListRow = {
  room: ChatRoomItem;
  proposal: boolean;
  unread: number;
  preview: string;
  timeLabel: string;
  onPress: () => void;
};

export type ChatRequestRow = {
  request: ChatRequestItem;
  name: string;
  meta: string;
  scoreLabel: string;
  preview: string;
  timeLabel: string;
  onPress: () => void;
};

export type UseChatListScreenReturn = {
  rows: ChatListRow[];
  requestRows: ChatRequestRow[];
  loading: boolean;
  requestsLoading: boolean;
  error: string | null;
  isLoggedIn: boolean;
  onLoginPress: () => void;
};

export function useChatListScreen(): UseChatListScreenReturn {
  const router = useRouter();
  const { session } = useSession();
  const isLoggedIn = !!session;
  const { data: rooms, loading, error } = useChatRooms(isLoggedIn);
  const { data: requests, loading: requestsLoading } = useChatRequests(isLoggedIn);

  useEffect(() => {
    if (error) {
      logEvent(AnalyticsEvent.UI_ERROR_SHOWN, { screen_name: 'chat', error_code: error });
    }
  }, [error]);

  const rows = useMemo<ChatListRow[]>(
    () =>
      (rooms ?? []).map((room) => {
        const proposal = room.status === 'PENDING';
        return {
          room,
          proposal,
          unread: room.unreadCount ?? 0,
          preview:
            room.lastMessage ??
            (proposal ? '룸메이트를 요청했어요!' : '채팅이 시작되었어요. 인사를 건네보세요.'),
          timeLabel: formatChatTime(room.creatAt ?? room.createdAt),
          onPress: () => {
            logEvent(AnalyticsEvent.CHAT_ROOM_ENTER, { room_id: room.chatRoomId });
            goChatRoom(router, String(room.chatRoomId));
          },
        };
      }),
    [rooms, router],
  );

  const requestRows = useMemo<ChatRequestRow[]>(
    () =>
      (requests ?? [])
        .filter((request) => request.status === 'PENDING')
        .map((request) => {
          const name = request.name ?? request.memberName ?? '사용자';
          return {
            request,
            name,
            meta: [
              request.memberAge ? `${request.memberAge}세` : null,
              request.gender === 'FEMALE' ? '여성' : request.gender === 'MALE' ? '남성' : null,
            ]
              .filter(Boolean)
              .join(' · '),
            scoreLabel: request.score != null ? `궁합 ${request.score}점` : '채팅 요청',
            preview: `${name}님이 룸메이트를 요청했어요!`,
            timeLabel: formatChatTime(request.createdAt),
            onPress: () => {
              const requestId = request.chatReqId ?? request.requiredId;
              if (requestId != null) goChatRequest(router, requestId);
            },
          };
        }),
    [requests, router],
  );

  return {
    rows,
    requestRows,
    loading,
    requestsLoading,
    error,
    isLoggedIn,
    onLoginPress: () => goKakaoLogin(router),
  };
}

function formatChatTime(value?: string): string {
  if (!value) return '';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '';
  const now = new Date();
  const sameDay =
    date.getFullYear() === now.getFullYear() &&
    date.getMonth() === now.getMonth() &&
    date.getDate() === now.getDate();
  if (sameDay) {
    const period = date.getHours() < 12 ? '오전' : '오후';
    const hour = date.getHours() % 12 || 12;
    return `${period} ${String(hour).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`;
  }
  const yesterday = new Date(now);
  yesterday.setDate(now.getDate() - 1);
  if (
    date.getFullYear() === yesterday.getFullYear() &&
    date.getMonth() === yesterday.getMonth() &&
    date.getDate() === yesterday.getDate()
  ) {
    return '어제';
  }
  return `${date.getMonth() + 1}.${String(date.getDate()).padStart(2, '0')}`;
}
