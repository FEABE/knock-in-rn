/**
 * 도메인 9. 알림/고객센터
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

// ─── Request Types ────────────────────────────────────────────────────────────

export type NotificationSettingUpdate = {
  settingId: string;
  enabled: 'true' | 'false' | boolean;
};

/** 문의 작성 본문. */
export type InquiryCreate = {
  categoryId: string;
  title: string;
  contents: string;
};

// ─── Response Types ───────────────────────────────────────────────────────────

export type AlarmItem = {
  title: string;
  contents: string;
  isRead: string;
  createAt: string;
};

export type AlarmListData = {
  alarms: AlarmItem[];
};

export type AlarmSetting = {
  id: string;
  name: string;
  isEnable: string;
};

export type NotificationSettingsData = {
  alarmsSettings: AlarmSetting[];
};

/** 문의 목록 항목. */
export type InquiryItem = {
  id: string;
  title: string;
  writer: string;
  status: string;
  createAt: string;
  type: string;
};

export type InquiryListData = {
  inquiries: InquiryItem[];
};

/** 문의 답변 항목. */
export type InquiryReply = {
  id: string;
  title: string;
  contents: string;
  writer: string;
  createAt: string;
};

/** 문의 상세. (inquirie 오타 유지) */
export type InquiryDetailData = {
  inquirie: {
    id: string;
    title: string;
    contents: string;
    writer: string;
    status: string;
    createAt: string;
    type: string;
    reply: InquiryReply[];
  };
};

/** 문의 카테고리. (inquirieCategorys 오타 유지) */
export type InquiryCategory = {
  id: string;
  name: string;
};

export type InquiryCategoriesData = {
  inquirieCategorys: InquiryCategory[];
};

// ─── Mock ─────────────────────────────────────────────────────────────────────

const MOCK_ALARMS: AlarmItem[] = [
  {
    title: '새로운 채팅 요청',
    contents: '하준님이 채팅을 요청했어요.',
    isRead: 'false',
    createAt: '2026-05-27T08:00:00Z',
  },
  {
    title: '궁합 점수 업데이트',
    contents: '수아님과의 궁합 점수가 갱신되었어요.',
    isRead: 'true',
    createAt: '2026-05-25T20:00:00Z',
  },
];

const MOCK_SETTINGS: AlarmSetting[] = [
  { id: 'set-chat', name: '채팅 알림', isEnable: 'true' },
  { id: 'set-match', name: '매칭 알림', isEnable: 'true' },
  { id: 'set-marketing', name: '마케팅 알림', isEnable: 'false' },
];

const MOCK_INQUIRIES: InquiryItem[] = [
  {
    id: 'q-1',
    title: '프로필 사진 변경은 어떻게 하나요?',
    writer: '지민',
    status: 'answered',
    createAt: '2026-05-08T09:00:00Z',
    type: 'account',
  },
];

const MOCK_INQUIRY_DETAIL: InquiryDetailData = {
  inquirie: {
    id: 'q-1',
    title: '프로필 사진 변경은 어떻게 하나요?',
    contents: '프로필 변경에 사진이 보이지 않습니다.',
    writer: '지민',
    status: 'answered',
    createAt: '2026-05-08T09:00:00Z',
    type: 'account',
    reply: [
      {
        id: 'r-1',
        title: 'RE: 프로필 사진 변경',
        contents: '마이페이지 > 내 프로필 카드 > 프로필 변경에서 가능합니다.',
        writer: '고객센터',
        createAt: '2026-05-10T09:00:00Z',
      },
    ],
  },
};

const MOCK_CATEGORIES: InquiryCategory[] = [
  { id: 'cat-account', name: '계정' },
  { id: 'cat-matching', name: '매칭' },
  { id: 'cat-report', name: '신고' },
  { id: 'cat-etc', name: '기타' },
];

// ─── Client: 알림 ──────────────────────────────────────────────────────────────

/** GET /alarms — 알림 목록 조회 */
export function getAlarms(params: PageParams = {}): Promise<ApiResponse<AlarmListData>> {
  if (USE_MOCK) return mockOk({ alarms: MOCK_ALARMS });
  return request('GET', '/alarms', { query: params });
}

/** PATCH /alarms/{id}/read — 단일 알림 읽음 처리 */
export function readAlarm(id: string): Promise<ApiResponse<UpdatedAt>> {
  if (USE_MOCK) return mockUpdatedAt();
  return request('PATCH', `/alarms/${id}/read`);
}

/** PATCH /alarms/read-all — 전체 알림 읽음 처리 */
export function readAllAlarms(): Promise<ApiResponse<UpdatedAt>> {
  if (USE_MOCK) return mockUpdatedAt();
  return request('PATCH', '/alarms/read-all');
}

/** GET /users/me/notification-settings — 알림 설정 조회 */
export function getNotificationSettings(): Promise<ApiResponse<NotificationSettingsData>> {
  if (USE_MOCK) return mockOk({ alarmsSettings: MOCK_SETTINGS });
  return request('GET', '/users/me/notification-settings');
}

/** PATCH /users/me/notification-settings — 알림 설정 변경 */
export function updateNotificationSetting(
  body: NotificationSettingUpdate,
): Promise<ApiResponse<UpdatedAt>> {
  if (USE_MOCK) return mockUpdatedAt();
  return request('PATCH', '/users/me/notification-settings', { body });
}

// ─── Client: 고객센터 ───────────────────────────────────────────────────────────

/** POST /inquiries — 문의 작성 */
export function createInquiry(body: InquiryCreate): Promise<ApiResponse<UpdatedAt>> {
  if (USE_MOCK) return mockUpdatedAt();
  return request('POST', '/inquiries', { body });
}

/** GET /inquiries — 문의 목록 조회 */
export function getInquiries(params: PageParams = {}): Promise<ApiResponse<InquiryListData>> {
  if (USE_MOCK) return mockOk({ inquiries: MOCK_INQUIRIES });
  return request('GET', '/inquiries', { query: params });
}

/** GET /inquiries/{inquiryId} — 문의 상세 조회 (답변 포함) */
export function getInquiryDetail(inquiryId: string): Promise<ApiResponse<InquiryDetailData>> {
  if (USE_MOCK) return mockOk(MOCK_INQUIRY_DETAIL);
  return request('GET', `/inquiries/${inquiryId}`);
}

/** GET /inquiries/categorys — 문의 카테고리 조회 */
export function getInquiryCategories(): Promise<ApiResponse<InquiryCategoriesData>> {
  if (USE_MOCK) return mockOk({ inquirieCategorys: MOCK_CATEGORIES });
  return request('GET', '/inquiries/categorys');
}
