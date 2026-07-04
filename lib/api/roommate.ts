/**
 * 도메인 8. 룸메이트 관리 (요청 / 내 룸메이트 / 달력)
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

export type RoommateRequestCreate =
  OpenApiSchema<'org.example.knockin.dto.RoommateRequestDto$Request'>;

/** 달력 등록/수정 본문. */
export type CalendarWriteRequest = OpenApiSchema<'org.example.knockin.dto.CalendarDto$Request'>;

// ─── Response Types ───────────────────────────────────────────────────────────

/** 룸메이트 요청 목록 항목. (reqeustee 오타 유지) */
export type RoommateRequestItem =
  OpenApiSchema<'org.example.knockin.dto.RoommateRequestListDto$Response'> &
    Partial<{
      requester: number;
      reqeustee: number;
      isAgree: boolean;
    }>;

type RoommateRequestPageData =
  OpenApiSchema<'org.springframework.data.domain.PageOrg.example.knockin.dto.RoommateRequestListDto$Response'>;

export type RoommateRequestListData = Partial<RoommateRequestPageData> & {
  roommateRequests?: RoommateRequestItem[];
};

/** 내 룸메이트 조회. */
export type MyRoommateData = OpenApiSchema<'org.example.knockin.dto.MyRoommateDto$Response'>;

export type CalendarItem =
  OpenApiSchema<'org.example.knockin.dto.MyRoommateCalendarListDto$Response$Calendar'>;

export type CalendarListData =
  OpenApiSchema<'org.example.knockin.dto.MyRoommateCalendarListDto$Response'>;

export type CalendarDetailData =
  OpenApiSchema<'org.example.knockin.dto.MyRoommateCalendarDetailDto$Response'>;

export type CalendarType = OpenApiSchema<'org.example.knockin.dto.CalendarTypesDto$Response$Type'>;

export type CalendarTypesData = OpenApiSchema<'org.example.knockin.dto.CalendarTypesDto$Response'>;

export type CalendarQuery = {
  year?: number;
  month?: number;
};

// ─── Mock ─────────────────────────────────────────────────────────────────────

const MOCK_REQUESTS: RoommateRequestItem[] = [
  {
    requester: 2,
    reqeustee: 1,
    createAt: '2026-05-26T11:00:00Z',
    chatRoomId: 1,
    isAgree: false,
  },
];

const MOCK_MY_ROOMMATE: MyRoommateData = {
  userId: 2,
  userName: '하준',
  compatibility: {
    score: 85,
    lifeStyleInfo: [
      { title: '생활 리듬', percent: '88' },
      { title: '청결', percent: '82' },
    ],
  },
  preferences: [
    {
      lifestyleId: 1,
      name: '조용함 선호',
      value: '5',
      description: '소음에 민감해요',
      type: 'SCALE',
    },
  ],
};

const MOCK_CALENDARS: CalendarItem[] = [
  {
    calendarId: 1,
    writer: '지민',
    startDt: '2026-06-05',
    endDt: '2026-06-05',
    createAt: '2026-05-28T09:00:00Z',
    type: 'cleaning',
    title: '대청소',
  },
  {
    calendarId: 2,
    writer: '하준',
    startDt: '2026-06-10',
    endDt: '2026-06-10',
    createAt: '2026-05-28T09:00:00Z',
    type: 'bill',
    title: '관리비 정산',
  },
];

const MOCK_CALENDAR_DETAIL: CalendarDetailData = {
  id: 1,
  title: '대청소',
  contents: '오전에 거실/주방 같이 청소해요.',
};

const MOCK_CALENDAR_TYPES: CalendarType[] = [
  { id: 1, name: '청소' },
  { id: 2, name: '정산' },
  { id: 3, name: '일정' },
];

// ─── Client: 요청 ──────────────────────────────────────────────────────────────

/** POST /roommate-requests — 룸메이트 요청 (같이 살아요) */
export function createRoommateRequest(
  body: RoommateRequestCreate,
): Promise<ApiResponse<UpdatedAt>> {
  if (USE_MOCK) return mockUpdatedAt();
  return request('POST', '/roommate-requests', { body });
}

/** POST /roommate-requests/{requestId}/accept */
export function acceptRoommateRequest(requestId: string): Promise<ApiResponse<UpdatedAt>> {
  if (USE_MOCK) return mockUpdatedAt();
  return request('POST', `/roommate-requests/${requestId}/accept`);
}

/** POST /roommate-requests/{requestId}/reject */
export function rejectRoommateRequest(requestId: string): Promise<ApiResponse<UpdatedAt>> {
  if (USE_MOCK) return mockUpdatedAt();
  return request('POST', `/roommate-requests/${requestId}/reject`);
}

/** POST /roommate-requests/{requestId}/cancel */
export function cancelRoommateRequest(requestId: string): Promise<ApiResponse<UpdatedAt>> {
  if (USE_MOCK) return mockUpdatedAt();
  return request('POST', `/roommate-requests/${requestId}/cancel`);
}

/** GET /roommate-requests — 룸메이트 요청 목록 조회 */
export function getRoommateRequests(
  params: PageParams = {},
): Promise<ApiResponse<RoommateRequestListData>> {
  if (USE_MOCK) return mockOk({ roommateRequests: MOCK_REQUESTS });
  return request<RoommateRequestPageData>('GET', '/roommate-requests', { query: params }).then(
    (res) => ({
      ...res,
      data: {
        ...res.data,
        roommateRequests: (res.data?.content ?? []).map(normalizeRoommateRequestItem),
      },
    }),
  );
}

function normalizeRoommateRequestItem(item: RoommateRequestItem): RoommateRequestItem {
  return {
    ...item,
    requester: item.requester ?? item.requesterId,
    reqeustee: item.reqeustee ?? item.requesteeId,
    isAgree: item.isAgree ?? item.status === 'ACCEPTED',
  };
}

// ─── Client: 내 룸메이트 ────────────────────────────────────────────────────────

/** GET /roommates/me — 내 룸메이트 조회 */
export function getMyRoommate(): Promise<ApiResponse<MyRoommateData>> {
  if (USE_MOCK) return mockOk(MOCK_MY_ROOMMATE);
  return request('GET', '/roommates/me');
}

/** DELETE /roommates/me/{roommateId} — 룸메이트 해제 */
export function removeRoommate(roommateId: string): Promise<ApiResponse<UpdatedAt>> {
  if (USE_MOCK) return mockUpdatedAt();
  return request('DELETE', `/roommates/me/${roommateId}`);
}

// ─── Client: 달력 ──────────────────────────────────────────────────────────────

/** GET /roommates/me/calendar — 달력 목록 조회 */
export function getCalendars(query: CalendarQuery = {}): Promise<ApiResponse<CalendarListData>> {
  if (USE_MOCK) return mockOk({ calendars: MOCK_CALENDARS });
  return request('GET', '/roommates/me/calendar', { query });
}

/** GET /roommates/me/calendar/{id} — 달력 단건 조회 */
export function getCalendar(id: string): Promise<ApiResponse<CalendarDetailData>> {
  if (USE_MOCK) return mockOk(MOCK_CALENDAR_DETAIL);
  return request('GET', `/roommates/me/calendar/${id}`);
}

/** GET /roommates/me/calendar/types — 캘린더 타입 조회 */
export function getCalendarTypes(): Promise<ApiResponse<CalendarTypesData>> {
  if (USE_MOCK) return mockOk({ types: MOCK_CALENDAR_TYPES });
  return request('GET', '/roommates/me/calendar/types');
}

/** POST /roommates/me/calendar — 달력 등록 */
export function createCalendar(body: CalendarWriteRequest): Promise<ApiResponse<UpdatedAt>> {
  if (USE_MOCK) return mockUpdatedAt();
  return request('POST', '/roommates/me/calendar', { body });
}

/** PUT /roommates/me/calendar/{id} — 달력 수정 */
export function updateCalendar(
  id: string,
  body: CalendarWriteRequest,
): Promise<ApiResponse<UpdatedAt>> {
  if (USE_MOCK) return mockUpdatedAt();
  return request('PUT', `/roommates/me/calendar/${id}`, { body });
}

/** DELETE /roommates/me/calendar/{id} — 달력 삭제 */
export function deleteCalendar(id: string): Promise<ApiResponse<UpdatedAt>> {
  if (USE_MOCK) return mockUpdatedAt();
  return request('DELETE', `/roommates/me/calendar/${id}`);
}
