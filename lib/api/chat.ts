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

// ─── REST Types ───────────────────────────────────────────────────────────────

export type ChatRoomItem = {
  name: string;
  creatAt: string;
  chatRoomId: string;
  isAgree: string;
};

export type ChatRoomListData = {
  chatRooms: ChatRoomItem[];
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
    creatAt: '2026-05-20T10:00:00Z',
    chatRoomId: 'chat-1',
    isAgree: 'true',
  },
  {
    name: '수아',
    creatAt: '2026-05-22T15:30:00Z',
    chatRoomId: 'chat-2',
    isAgree: 'false',
  },
];

// ─── Client ───────────────────────────────────────────────────────────────────

/** GET /chats — 채팅방 목록 조회 */
export function getChatRooms(params: PageParams = {}): Promise<ApiResponse<ChatRoomListData>> {
  if (USE_MOCK) return mockOk({ chatRooms: MOCK_CHAT_ROOMS });
  return request('GET', '/chats', { query: params });
}
