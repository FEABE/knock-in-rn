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
export type CalendarWriteRequest = {
  calendar: {
    myRoommateId: number;
    title: string;
    contents: string;
    startDate: string;
    endDate: string;
  };
  categoryName: string;
  memberIds: number[];
};

export type HouseRuleWriteRequest = {
  title: string;
  contents: string;
  finalized: boolean;
};

// ─── Response Types ───────────────────────────────────────────────────────────

export type RoommateRequestData =
  OpenApiSchema<'org.example.knockin.dto.RoommateRequestDto$Response'>;

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
export type MyRoommateData = {
  id?: number;
  myRoommateInfo?: {
    memberId?: number;
    memberName?: string;
    memberAge?: number;
    gender?: 'MALE' | 'FEMALE';
    memberProfileImageUrl?: string;
  };
  chatRoomId?: number;
  score?: number;
};

export type HouseRuleItem = {
  id?: number;
  title?: string;
  contents?: string;
  finalized?: boolean;
  createdAt?: string;
};

export type CalendarMonthData = {
  targetMonth?: string;
  calendarDays?: { targetDate?: string; exists?: boolean }[];
};

export type CalendarMember = {
  memberId?: number;
  name?: string;
};

export type CalendarDayItem = {
  calendarBasicInfo?: {
    calendarId?: number;
    canEdit?: boolean;
    title?: string;
    contents?: string;
    isAllDay?: boolean;
    startDate?: string;
    endDate?: string;
    categoryName?: string;
    repeatType?: 'WEEKLY' | 'BI_WEEKLY' | 'MONTHLY';
  };
  calendarMembers?: CalendarMember[];
};

export type CalendarDayData = {
  targetDay?: string;
  calendars?: CalendarDayItem[];
};

export type CalendarDetailData = {
  id?: number;
  title?: string;
  contents?: string;
  startDate?: string;
  endDate?: string;
  categoryName?: string;
  memberIds?: number[];
};

export type CalendarEditData = {
  repeatType?: ('WEEKLY' | 'BI_WEEKLY' | 'MONTHLY')[];
  members?: (CalendarMember & { isMe?: boolean })[];
  categoryNames?: string[];
};

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
  id: 1,
  myRoommateInfo: {
    memberId: 2,
    memberName: '하준',
    memberAge: 27,
    gender: 'MALE',
  },
  chatRoomId: 1,
  score: 85,
};

const MOCK_HOUSE_RULES: HouseRuleItem[] = [
  {
    id: 1,
    title: '청소 / 위생',
    contents: '공용 공간 청소는 격주 토요일에 교대해요.',
    finalized: true,
    createdAt: '2026-05-28T09:00:00Z',
  },
];

const MOCK_CALENDAR_MONTH: CalendarMonthData = {
  targetMonth: '2026-06',
  calendarDays: Array.from({ length: 30 }, (_, index) => ({
    targetDate: `2026-06-${String(index + 1).padStart(2, '0')}`,
    exists: index === 4 || index === 9,
  })),
};

const MOCK_CALENDAR_DAY: CalendarDayData = {
  targetDay: '2026-06-05',
  calendars: [
    {
      calendarBasicInfo: {
        calendarId: 1,
        canEdit: true,
        title: '대청소',
        contents: '오전에 거실과 주방을 같이 청소해요.',
        startDate: '2026-06-05T09:00:00',
        endDate: '2026-06-05T10:00:00',
        categoryName: '청소',
      },
      calendarMembers: [
        { memberId: 1, name: '지민' },
        { memberId: 2, name: '하준' },
      ],
    },
  ],
};

const MOCK_CALENDAR_DETAIL: CalendarDetailData = {
  id: 1,
  title: '대청소',
  contents: '오전에 거실/주방 같이 청소해요.',
  startDate: '2026-06-05T09:00:00',
  endDate: '2026-06-05T10:00:00',
  categoryName: '청소',
  memberIds: [1, 2],
};

const MOCK_CALENDAR_EDIT: CalendarEditData = {
  repeatType: ['WEEKLY', 'BI_WEEKLY', 'MONTHLY'],
  members: [
    { memberId: 1, name: '지민', isMe: true },
    { memberId: 2, name: '하준', isMe: false },
  ],
  categoryNames: ['청소', '공과금', '기타'],
};

// ─── Client: 요청 ──────────────────────────────────────────────────────────────

/** POST /roommate-requests — 룸메이트 요청 (같이 살아요) */
export function createRoommateRequest(
  body: RoommateRequestCreate,
): Promise<ApiResponse<RoommateRequestData>> {
  if (USE_MOCK) {
    return mockOk({
      roommateMatchingRequiredInfo: {
        id: 1,
        requesterMemberId: 1,
        requesteeMemberId: 2,
        status: 'PENDING',
        createdAt: '2026-05-26T11:00:00Z',
      },
    });
  }
  return request('POST', '/roommate-requests', { body });
}

/** POST /roommate-requests/{requestId}/accept */
export function acceptRoommateRequest(
  requestId: string,
): Promise<ApiResponse<RoommateRequestData>> {
  if (USE_MOCK) {
    return mockOk({
      roommateMatchingRequiredInfo: {
        id: Number(requestId) || 1,
        status: 'ACCEPTED',
        updatedAt: '2026-05-26T11:00:00Z',
      },
    });
  }
  return request('POST', `/roommate-requests/${requestId}/accept`);
}

/** POST /roommate-requests/{requestId}/reject */
export function rejectRoommateRequest(
  requestId: string,
): Promise<ApiResponse<RoommateRequestData>> {
  if (USE_MOCK) {
    return mockOk({
      roommateMatchingRequiredInfo: {
        id: Number(requestId) || 1,
        status: 'REJECTED',
        updatedAt: '2026-05-26T11:00:00Z',
      },
    });
  }
  return request('POST', `/roommate-requests/${requestId}/reject`);
}

/** POST /roommate-requests/{requestId}/cancel */
export function cancelRoommateRequest(
  requestId: string,
): Promise<ApiResponse<RoommateRequestData>> {
  if (USE_MOCK) {
    return mockOk({
      roommateMatchingRequiredInfo: {
        id: Number(requestId) || 1,
        status: 'CANCELED',
        updatedAt: '2026-05-26T11:00:00Z',
      },
    });
  }
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
export async function getMyRoommate(): Promise<ApiResponse<MyRoommateData>> {
  if (USE_MOCK) return mockOk(MOCK_MY_ROOMMATE);
  const response = await request<MyRoommateData>('GET', '/roommates/me');
  if (response.status === 404 && response.error?.code === 'NOT_FOUND') {
    return { status: 200, data: {} as MyRoommateData, error: null };
  }
  return response;
}

/** DELETE /roommates/me/{roommateId} — 룸메이트 해제 */
export function removeRoommate(roommateId: string): Promise<ApiResponse<UpdatedAt>> {
  if (USE_MOCK) return mockUpdatedAt();
  return request('DELETE', `/roommates/me/${roommateId}`);
}

// ─── Client: 공동생활 합의서 ─────────────────────────────────────────────────

/** GET /roommates/me/house-rule — 공동생활 규칙 목록 */
export function getHouseRules(): Promise<ApiResponse<HouseRuleItem[]>> {
  if (USE_MOCK) return mockOk(MOCK_HOUSE_RULES);
  return request('GET', '/roommates/me/house-rule');
}

/** POST /roommates/me/house-rule — 공동생활 규칙 저장 */
export function createHouseRule(body: HouseRuleWriteRequest): Promise<ApiResponse<UpdatedAt>> {
  if (USE_MOCK) return mockUpdatedAt();
  return request('POST', '/roommates/me/house-rule', { body });
}

/** PUT /roommates/me/house-rule/{id} — 공동생활 규칙 수정 */
export function updateHouseRule(
  id: string,
  body: HouseRuleWriteRequest,
): Promise<ApiResponse<UpdatedAt>> {
  if (USE_MOCK) return mockUpdatedAt();
  return request('PUT', `/roommates/me/house-rule/${id}`, { body });
}

/** DELETE /roommates/me/house-rule/{id} — 공동생활 규칙 삭제 */
export function deleteHouseRule(id: string): Promise<ApiResponse<UpdatedAt>> {
  if (USE_MOCK) return mockUpdatedAt();
  return request('DELETE', `/roommates/me/house-rule/${id}`);
}

// ─── Client: 달력 ──────────────────────────────────────────────────────────────

/** GET /roommates/me/calendar — 월별 일정 존재 여부 조회 */
export function getCalendars(query: CalendarQuery = {}): Promise<ApiResponse<CalendarMonthData>> {
  if (USE_MOCK) return mockOk(MOCK_CALENDAR_MONTH);
  return request('GET', '/roommates/me/calendar', { query });
}

/** GET /roommates/me/calendar?day= — 선택 날짜 일정 조회 */
export function getDailyCalendars(query: {
  year: number;
  month: number;
  day: number;
}): Promise<ApiResponse<CalendarDayData>> {
  if (USE_MOCK) return mockOk(MOCK_CALENDAR_DAY);
  return request('GET', '/roommates/me/calendar', { query });
}

/** GET /roommates/me/calendar/{id} — 달력 단건 조회 */
export function getCalendar(id: string): Promise<ApiResponse<CalendarDetailData>> {
  if (USE_MOCK) return mockOk(MOCK_CALENDAR_DETAIL);
  return request('GET', `/roommates/me/calendar/${id}`);
}

/** GET /roommates/me/calendar/edit — 캘린더 편집 폼 메타데이터 */
export function getCalendarEdit(): Promise<ApiResponse<CalendarEditData>> {
  if (USE_MOCK) return mockOk(MOCK_CALENDAR_EDIT);
  return request('GET', '/roommates/me/calendar/edit');
}

/** GET /roommates/me/calendar/categories — 캘린더 카테고리 조회 */
export function getCalendarTypes(): Promise<ApiResponse<{ categoryNames?: string[] }>> {
  if (USE_MOCK) return mockOk({ categoryNames: MOCK_CALENDAR_EDIT.categoryNames });
  return request('GET', '/roommates/me/calendar/categories');
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
