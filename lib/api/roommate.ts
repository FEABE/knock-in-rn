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
import type { Compatibility, PreferenceItem } from './entities';

// ─── Request Types ────────────────────────────────────────────────────────────

export type RoommateRequestCreate = {
  chatRoomId: string;
};

/** 달력 등록/수정 본문. */
export type CalendarWriteRequest = {
  roommateId: string;
  title: string;
  contents: string;
  startDt: string;
  endDt: string;
};

// ─── Response Types ───────────────────────────────────────────────────────────

/** 룸메이트 요청 목록 항목. (reqeustee 오타 유지) */
export type RoommateRequestItem = {
  requester: string;
  reqeustee: string;
  createAt: string;
  chatRoomId: string;
  isAgree: string;
};

export type RoommateRequestListData = {
  roommateRequests: RoommateRequestItem[];
};

/** 내 룸메이트 조회. compatibility 안에 preferences 포함(명세 그대로). */
export type MyRoommateData = {
  userId: string;
  userName: string;
  compatibility: Compatibility & {
    preferences: PreferenceItem[];
  };
};

export type CalendarItem = {
  calendarId: string;
  writer: string;
  startDt: string;
  endDt: string;
  createAt: string;
  type: string;
  title: string;
};

export type CalendarListData = {
  calendars: CalendarItem[];
};

export type CalendarDetailData = {
  writer: string;
  startDt: string;
  endDt: string;
  createAt: string;
  type: string;
  title: string;
  contents: string;
};

export type CalendarType = {
  id: string;
  name: string;
};

export type CalendarTypesData = {
  types: CalendarType[];
};

export type CalendarQuery = {
  year?: number;
  month?: number;
};

// ─── Mock ─────────────────────────────────────────────────────────────────────

const MOCK_REQUESTS: RoommateRequestItem[] = [
  {
    requester: '하준',
    reqeustee: '지민',
    createAt: '2026-05-26T11:00:00Z',
    chatRoomId: 'chat-1',
    isAgree: 'false',
  },
];

const MOCK_MY_ROOMMATE: MyRoommateData = {
  userId: 'u-2',
  userName: '하준',
  compatibility: {
    score: '85',
    lifeStyleInfo: [
      { title: '생활 리듬', percent: '88' },
      { title: '청결', percent: '82' },
    ],
    preferences: [
      {
        preferencesId: 'pf-quiet',
        name: '조용함 선호',
        value: '5',
        description: '소음에 민감해요',
        type: 'range',
      },
    ],
  },
};

const MOCK_CALENDARS: CalendarItem[] = [
  {
    calendarId: 'cal-1',
    writer: '지민',
    startDt: '2026-06-05',
    endDt: '2026-06-05',
    createAt: '2026-05-28T09:00:00Z',
    type: 'cleaning',
    title: '대청소',
  },
  {
    calendarId: 'cal-2',
    writer: '하준',
    startDt: '2026-06-10',
    endDt: '2026-06-10',
    createAt: '2026-05-28T09:00:00Z',
    type: 'bill',
    title: '관리비 정산',
  },
];

const MOCK_CALENDAR_DETAIL: CalendarDetailData = {
  writer: '지민',
  startDt: '2026-06-05',
  endDt: '2026-06-05',
  createAt: '2026-05-28T09:00:00Z',
  type: 'cleaning',
  title: '대청소',
  contents: '오전에 거실/주방 같이 청소해요.',
};

const MOCK_CALENDAR_TYPES: CalendarType[] = [
  { id: 'cleaning', name: '청소' },
  { id: 'bill', name: '정산' },
  { id: 'event', name: '일정' },
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
  return request('GET', '/roommate-requests', { query: params });
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
