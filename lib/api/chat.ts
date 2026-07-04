/**
 * 도메인 6. 채팅 (Chat)
 *
 * 채팅방 목록은 REST, 실시간 메시지는 WebSocket(STOMP)으로 처리한다.
 * 여기서는 REST 클라이언트 + WS 경로/페이로드 타입을 제공한다.
 * (실제 STOMP 연결 구현은 소켓 라이브러리 선정 후 별도 작성)
 */
import {
  API_BASE_URL,
  type ApiResponse,
  type PageParams,
  mockOk,
  request,
  USE_MOCK,
} from './client';
import type { OpenApiSchema } from './openapi-types';

// ─── REST Types ───────────────────────────────────────────────────────────────

export type ChatRoomItem = OpenApiSchema<'org.example.knockin.dto.ChatRoomListDto$Response'> &
  Partial<{
    name: string;
    creatAt: string;
    isAgree: boolean;
    lastMessage: string;
    unreadCount: number;
  }>;

export type ChatRoomListData = {
  chatRooms?: ChatRoomItem[];
};

// ─── WebSocket ─────────────────────────────────────────────────────────────────

/** WS 연결 엔드포인트. */
export const WS_CHAT_ENDPOINT = '/ws-chat';

export function wsChatUrl(): string {
  // ws(s):// 스킴으로 변환
  return `${API_BASE_URL.replace(/^http/, 'ws')}${WS_CHAT_ENDPOINT}`;
}

/** SUB: 룸메이트 요청 수신 토픽. */
export function subRoommateRequests(chatId: string): string {
  return `/sub/chats/roommate-requests/${chatId}`;
}

/** SUB: 채팅방 실시간 메시지 토픽. */
export function subChatRoom(chatId: string): string {
  return `/sub/chats/${chatId}`;
}

/** SEND: 메시지 전송 목적지. */
export function pubSendMessage(chatId: string): string {
  return `/pub/chats/${chatId}/messages`;
}

/** SEND: 채팅방 나가기 목적지. */
export function pubLeaveChat(chatId: string): string {
  return `/pub/chats/${chatId}/leave`;
}

/** 메시지 전송 페이로드. */
export type ChatSendPayload = {
  message: string;
  type: string;
};

// ─── Mock ─────────────────────────────────────────────────────────────────────

const MOCK_CHAT_ROOMS: ChatRoomItem[] = [
  {
    name: '하준',
    creatAt: '2026-05-13T09:24:00Z',
    chatRoomId: 2,
    isAgree: true,
    lastMessage: '좋아요. 청소 규칙이랑 공과금 기준만 미리 정하면 괜찮을 것 같아요.',
    unreadCount: 0,
  },
  {
    name: '수아',
    creatAt: '2026-05-14T18:44:00Z',
    chatRoomId: 3,
    isAgree: false,
    lastMessage: '거의 없어요. 친구 방문은 미리 말하는 쪽을 선호해요.',
    unreadCount: 2,
  },
  {
    name: '도윤',
    creatAt: '2026-05-15T12:14:00Z',
    chatRoomId: 4,
    isAgree: false,
    lastMessage: '네 비흡연입니다. 청소는 주 1회 고정으로 정하면 좋겠어요.',
    unreadCount: 1,
  },
  {
    name: '서윤',
    creatAt: '2026-05-16T20:18:00Z',
    chatRoomId: 5,
    isAgree: false,
    lastMessage: '공용공간은 사용 후 바로 정리, 외부인은 사전 공유 기준이에요.',
    unreadCount: 0,
  },
];

// ─── Client ───────────────────────────────────────────────────────────────────

/** GET /chats — 채팅방 목록 조회 */
export function getChatRooms(params: PageParams = {}): Promise<ApiResponse<ChatRoomListData>> {
  if (USE_MOCK) return mockOk({ chatRooms: MOCK_CHAT_ROOMS });
  return request<ChatRoomItem[]>('GET', '/chats', { query: params }).then((res) => ({
    ...res,
    data: { chatRooms: (res.data ?? []).map(normalizeChatRoomItem) },
  }));
}

function normalizeChatRoomItem(item: ChatRoomItem): ChatRoomItem {
  return {
    ...item,
    name: item.name ?? item.memberName,
    creatAt: item.creatAt ?? item.createdAt,
    isAgree: item.isAgree ?? item.status === 'ACCEPTED',
  };
}
