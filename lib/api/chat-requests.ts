/**
 * 도메인 5. 채팅 요청
 */
import {
  type ApiResponse,
  type PageParams,
  type UpdatedAt,
  mockOk,
  mockUpdatedAt,
  request,
  USE_MOCK,
} from './client';
import type { OpenApiSchema } from './openapi-types';

// ─── Request Types ────────────────────────────────────────────────────────────

export type ChatRequestCreate = OpenApiSchema<'org.example.knockin.dto.ChatRequestDto$Request'>;

// ─── Response Types ───────────────────────────────────────────────────────────

/** 채팅 요청 목록 항목. (creatAt 오타 유지) */
export type ChatRequestItem = OpenApiSchema<'org.example.knockin.dto.ChatRequestListDto$Response'> &
  Partial<{
    name: string;
    type: 'sent' | 'received';
    creatAt: string;
    chatReqId: number;
  }>;

export type ChatRequestListData = {
  chatRequireds?: ChatRequestItem[];
};

/** 요청자/피요청자 공통 프로필. */
export type ChatRequestParty =
  OpenApiSchema<'org.example.knockin.dto.ChatRequestDetailDto$Response$MemberInfo'> &
    Partial<{
      name: string;
      score: number;
      createAt: string;
      isAgree: boolean;
    }>;

export type ChatRequestDetailData =
  OpenApiSchema<'org.example.knockin.dto.ChatRequestDetailDto$Response'> &
    Partial<{
      requester: ChatRequestParty;
      requestee: ChatRequestParty;
    }>;

export type MatchScoreData = OpenApiSchema<'org.example.knockin.dto.MatchScoreDto$Response'>;

export type ChatRequestActionData = Partial<UpdatedAt> & {
  chatRoomId?: number | string;
};

// ─── Mock ─────────────────────────────────────────────────────────────────────

const MOCK_LIFESTYLES: NonNullable<ChatRequestParty['lifeStyles']> = [
  {
    lifestyleId: 1,
    name: '취침 시간',
    value: '24:00',
    description: '자정쯤 취침',
    type: 'SCALE',
  },
];

const MOCK_REQUESTS: ChatRequestItem[] = [
  {
    name: '하준',
    type: 'received',
    score: 75,
    creatAt: '2026-05-25T12:00:00Z',
    chatReqId: 1,
  },
  {
    name: '수아',
    type: 'sent',
    score: 91,
    creatAt: '2026-05-24T18:30:00Z',
    chatReqId: 2,
  },
];

const MOCK_REQUEST_DETAIL: ChatRequestDetailData = {
  requester: {
    name: '하준',
    lifeStyles: MOCK_LIFESTYLES,
    score: 75,
    createAt: '2026-05-25T12:00:00Z',
  },
  requestee: {
    name: '지민',
    lifeStyles: MOCK_LIFESTYLES,
    score: 75,
    createAt: '2026-05-25T12:00:00Z',
    isAgree: false,
  },
};

const MOCK_SCORE: MatchScoreData = {
  compatibility: {
    totalScore: 82,
    lifeStyleInfo: [
      { name: '생활 리듬', percent: 90 },
      { name: '청결', percent: 80 },
    ],
  },
};

// ─── Client ───────────────────────────────────────────────────────────────────

/** GET /chat-requests — 채팅 요청 목록 조회 */
export function getChatRequests(
  params: PageParams = {},
): Promise<ApiResponse<ChatRequestListData>> {
  if (USE_MOCK) return mockOk({ chatRequireds: MOCK_REQUESTS });
  return request<ChatRequestItem[]>('GET', '/chat-requests', { query: params }).then((res) => ({
    ...res,
    data: { chatRequireds: (res.data ?? []).map(normalizeChatRequestItem) },
  }));
}

/** GET /chat-requests/{requestId} — 채팅 요청 상세 조회 */
export function getChatRequestDetail(
  requestId: string,
): Promise<ApiResponse<ChatRequestDetailData>> {
  if (USE_MOCK) return mockOk(MOCK_REQUEST_DETAIL);
  return request<ChatRequestDetailData>('GET', `/chat-requests/${requestId}`).then((res) => ({
    ...res,
    data: normalizeChatRequestDetail(res.data),
  }));
}

/** POST /chat-requests — 채팅 요청 */
export function createChatRequest(body: ChatRequestCreate): Promise<ApiResponse<UpdatedAt>> {
  if (USE_MOCK) return mockUpdatedAt();
  return request('POST', '/chat-requests', { body });
}

/** POST /chat-requests/{requestId}/accept — 채팅 요청 수락 */
export function acceptChatRequest(requestId: string): Promise<ApiResponse<ChatRequestActionData>> {
  if (USE_MOCK) return mockUpdatedAt();
  return request('POST', `/chat-requests/${requestId}/accept`);
}

/** POST /chat-requests/{requestId}/reject — 채팅 요청 거절 */
export function rejectChatRequest(requestId: string): Promise<ApiResponse<UpdatedAt>> {
  if (USE_MOCK) return mockUpdatedAt();
  return request('POST', `/chat-requests/${requestId}/reject`);
}

/** POST /chat-requests/{requestId}/cancel — 채팅 요청 취소 */
export function cancelChatRequest(requestId: string): Promise<ApiResponse<UpdatedAt>> {
  if (USE_MOCK) return mockUpdatedAt();
  return request('POST', `/chat-requests/${requestId}/cancel`);
}

/** GET /roommate/matches/score — 궁합 점수 조회 */
export function getMatchScore(): Promise<ApiResponse<MatchScoreData>> {
  if (USE_MOCK) return mockOk(MOCK_SCORE);
  return request('GET', '/roommate/matches/score');
}

function normalizeChatRequestItem(item: ChatRequestItem): ChatRequestItem {
  return {
    ...item,
    name: item.name ?? item.memberName,
    creatAt: item.creatAt ?? item.createdAt,
    chatReqId: item.chatReqId ?? item.requiredId,
  };
}

function normalizeChatRequestDetail(data: ChatRequestDetailData): ChatRequestDetailData {
  const requester = data.requester ?? normalizeParty(data.isRequester ? data.me : data.opponent);
  const requestee = data.requestee ?? normalizeParty(data.isRequester ? data.opponent : data.me);
  return {
    ...data,
    requester,
    requestee,
  };
}

function normalizeParty(party: ChatRequestParty | undefined): ChatRequestParty | undefined {
  if (!party) return undefined;
  return {
    ...party,
    name: party.name ?? party.memberName,
  };
}
