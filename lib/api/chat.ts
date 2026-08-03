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
  type UpdatedAt,
  mockOk,
  mockUpdatedAt,
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

export type ChatRoomDetailData =
  OpenApiSchema<'org.example.knockin.dto.ChatRoomDetailDto$Response'>;

export type ChatRoomCreateRequest =
  OpenApiSchema<'org.example.knockin.dto.ChatRoomCreateDto$Request'>;

export type ChatRoomCreateData =
  OpenApiSchema<'org.example.knockin.dto.ChatRoomCreateDto$Response'>;

export type ChatRoomImageData = OpenApiSchema<'org.example.knockin.dto.ChatRoomImageDto$Response'>;

export type ChatImageUpload = {
  uri: string;
  name?: string;
  type?: string;
};

/** Figma 채팅 화면에 정의된 첫 대화 문구. */
export const DEFAULT_CHAT_MESSAGE = '안녕하세요!\n프로필 보고 연락드렸어요.';

// ─── WebSocket ─────────────────────────────────────────────────────────────────

/** WS 연결 엔드포인트. */
export const WS_CHAT_ENDPOINT = '/ws-chat';

export function wsChatUrl(): string {
  // ws(s):// 스킴으로 변환
  return `${API_BASE_URL.replace(/^http/, 'ws')}${WS_CHAT_ENDPOINT}`;
}

/** SUB: 채팅 메시지와 룸메이트 요청 이벤트를 함께 받는 토픽. */
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
  clientMessageId: string;
  message: string;
  type: 'TEXT' | 'IMAGE';
  imageUrl?: string;
};

export type ChatSocketMessage = {
  clientMessageId?: string;
  senderId?: number;
  type?: 'TEXT' | 'IMAGE' | 'LEFT_ROOM';
  contents?: string;
  imageUrl?: string;
};

export type ChatSocketEnvelope = {
  eventType: 'USER_MESSAGE' | 'SYSTEM_MESSAGE' | 'ROOMMATE_REQUEST';
  chatRoomId: number;
  payload: ChatSocketMessage | Record<string, unknown>;
  createdAt?: string;
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

const MOCK_CHAT_DETAIL: ChatRoomDetailData = {
  opponentProfile: {
    id: 2,
    name: '하준',
    age: 29,
    gender: 'MALE',
    score: 91,
  },
  messages: [
    {
      id: 1,
      senderId: 2,
      contents: '안녕하세요. 게시글 보고 연락드렸어요.',
      createdAt: '2026-05-13T09:24:00Z',
      type: 'TEXT',
    },
    {
      id: 2,
      senderId: 1,
      contents: '좋아요. 청소 규칙이랑 공과금 기준만 미리 정하면 괜찮을 것 같아요.',
      createdAt: '2026-05-13T09:28:00Z',
      type: 'TEXT',
    },
  ],
  matchingRequiredList: [],
};

// ─── Client ───────────────────────────────────────────────────────────────────

/** GET /chats — 채팅방 목록 조회 */
export function getChatRooms(params: PageParams = {}): Promise<ApiResponse<ChatRoomListData>> {
  if (USE_MOCK) return mockOk({ chatRooms: MOCK_CHAT_ROOMS });
  return request<ChatRoomItem[]>('GET', '/chats', { query: params }).then((res) => ({
    ...res,
    data: { chatRooms: (res.data ?? []).map(normalizeChatRoomItem) },
  }));
}

/** POST /chats — 채팅 요청 단계 없이 채팅방 생성 */
export function createChatRoom(
  body: ChatRoomCreateRequest,
): Promise<ApiResponse<ChatRoomCreateData>> {
  if (USE_MOCK) {
    return mockOk({
      chatRoomId: 99,
      updatedAt: new Date().toISOString(),
    });
  }
  return request('POST', '/chats', { body });
}

/** GET /chats/{chatId} — 채팅방 상세 조회 */
export function getChatRoomDetail(chatId: string): Promise<ApiResponse<ChatRoomDetailData>> {
  if (USE_MOCK) return mockOk(MOCK_CHAT_DETAIL);
  return request('GET', `/chats/${chatId}`);
}

/** POST /chats/{chatId}/images — 채팅방 이미지 업로드 */
export function uploadChatImage(
  chatId: string,
  file: ChatImageUpload,
): Promise<ApiResponse<ChatRoomImageData>> {
  if (USE_MOCK) return mockOk({ imageUrl: file.uri });

  const formData = new FormData();
  formData.append('file', {
    uri: file.uri,
    name: file.name ?? 'chat-image.jpg',
    type: file.type ?? 'image/jpeg',
  } as any);

  return request('POST', `/chats/${chatId}/images`, {
    body: formData,
  });
}

/** POST /chats/{chatId}/leave — 채팅방 나가기 */
export function leaveChatRoom(chatId: string): Promise<ApiResponse<UpdatedAt>> {
  if (USE_MOCK) return mockUpdatedAt();
  return request('POST', `/chats/${chatId}/leave`);
}

function normalizeChatRoomItem(item: ChatRoomItem): ChatRoomItem {
  return {
    ...item,
    name: item.name ?? item.memberName,
    creatAt: item.creatAt ?? item.lastMessageAt ?? item.createdAt,
    isAgree: item.isAgree ?? item.isRoommate ?? item.roommateStatus === 'ACCEPTED',
    unreadCount: item.unreadCount ?? item.messageCount,
  };
}
