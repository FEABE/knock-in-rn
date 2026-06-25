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
export type ChatRequestItem =
  OpenApiSchema<'org.example.knockin.dto.ChatRequestListDto$Response$ChatRequired'>;

export type ChatRequestListData =
  OpenApiSchema<'org.example.knockin.dto.ChatRequestListDto$Response'>;

/** 요청자/피요청자 공통 프로필. */
export type ChatRequestParty =
  OpenApiSchema<'org.example.knockin.dto.ChatRequestDetailDto$Response$RequesterInfo'>;

export type ChatRequestDetailData =
  OpenApiSchema<'org.example.knockin.dto.ChatRequestDetailDto$Response'>;

export type MatchScoreData = OpenApiSchema<'org.example.knockin.dto.MatchScoreDto$Response'>;

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
    score: 82,
    lifeStyleInfo: [
      { title: '생활 리듬', percent: '90' },
      { title: '청결', percent: '80' },
    ],
  },
};

// ─── Client ───────────────────────────────────────────────────────────────────

/** GET /chat-requests — 채팅 요청 목록 조회 */
export function getChatRequests(
  params: PageParams = {},
): Promise<ApiResponse<ChatRequestListData>> {
  if (USE_MOCK) return mockOk({ chatRequireds: MOCK_REQUESTS });
  return request('GET', '/chat-requests', { query: params });
}

/** GET /chat-requests/{requestId} — 채팅 요청 상세 조회 */
export function getChatRequestDetail(
  requestId: string,
): Promise<ApiResponse<ChatRequestDetailData>> {
  if (USE_MOCK) return mockOk(MOCK_REQUEST_DETAIL);
  return request('GET', `/chat-requests/${requestId}`);
}

/** POST /chat-requests — 채팅 요청 */
export function createChatRequest(body: ChatRequestCreate): Promise<ApiResponse<UpdatedAt>> {
  if (USE_MOCK) return mockUpdatedAt();
  return request('POST', '/chat-requests', { body });
}

/** POST /chat-requests/{requestId}/accept — 채팅 요청 수락 */
export function acceptChatRequest(requestId: string): Promise<ApiResponse<UpdatedAt>> {
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
