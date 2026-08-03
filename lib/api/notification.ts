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
import type { OpenApiSchema } from './openapi-types';

// ─── Request Types ────────────────────────────────────────────────────────────

export type NotificationSettingUpdate =
  OpenApiSchema<'org.example.knockin.dto.AlarmSettingDto$Request'>;

/** 문의 작성 본문. */
export type InquiryCreate = OpenApiSchema<'org.example.knockin.dto.InquiryDto$Request'>;

// ─── Response Types ───────────────────────────────────────────────────────────

export type AlarmItem = OpenApiSchema<'org.example.knockin.dto.AlarmListDto$Response$Alarm'>;

export type AlarmListData = OpenApiSchema<'org.example.knockin.dto.AlarmListDto$Response'>;

export type BoNoticeItem =
  OpenApiSchema<'org.example.knockin.dto.BoNoticeListDto$Response$NoticeItem'>;

export type BoNoticeListData = OpenApiSchema<'org.example.knockin.dto.BoNoticeListDto$Response'>;

export type BoNoticeDetailData =
  OpenApiSchema<'org.example.knockin.dto.BoNoticeDetailDto$Response'>;

// 현재 포함된 OpenAPI 스냅샷에는 사용자용 NoticeListDto가 빠져 있어,
// 백엔드 DTO와 같은 목록 구조를 직접 정의합니다.
export type NoticeItem = BoNoticeItem;

export type NoticeListData = {
  notices?: NoticeItem[];
};

export type AlarmSetting =
  OpenApiSchema<'org.example.knockin.dto.MyNotificationSettingsDto$Response$AlarmSettingItem'>;

export type NotificationSettingsData =
  OpenApiSchema<'org.example.knockin.dto.MyNotificationSettingsDto$Response'>;

/** 문의 목록 항목. */
export type InquiryItem =
  OpenApiSchema<'org.example.knockin.dto.InquiryListDto$Response$InquiryItem'>;

export type InquiryListData = OpenApiSchema<'org.example.knockin.dto.InquiryListDto$Response'>;

/** 문의 답변 항목. */
export type InquiryReply =
  OpenApiSchema<'org.example.knockin.dto.InquiryDetailDto$Response$InquiryDetail$Reply'>;

/** 문의 상세. (inquirie 오타 유지) */
export type InquiryDetailData = OpenApiSchema<'org.example.knockin.dto.InquiryDetailDto$Response'>;

/** 문의 카테고리. (inquirieCategorys 오타 유지) */
export type InquiryCategory =
  OpenApiSchema<'org.example.knockin.dto.InquiryCategoryListDto$Response$Category'>;

export type InquiryCategoriesData =
  OpenApiSchema<'org.example.knockin.dto.InquiryCategoryListDto$Response'>;

export type DevicePlatform = 'ANDROID' | 'IOS';

/** 로그인 직후 백엔드에 저장하는 설치 기기 정보. */
export type DeviceRegistrationRequest = {
  /** 앱 설치별 UUID. 백엔드 제한: 50자. */
  deviceId: string;
  /** Firebase Messaging이 발급한 실제 토큰. 백엔드 제한: 512자. */
  fcmToken: string;
  platform: DevicePlatform;
};

// ─── Mock ─────────────────────────────────────────────────────────────────────

const MOCK_ALARMS: AlarmItem[] = [
  {
    title: '새로운 채팅',
    contents: '하준님과 채팅이 시작됐어요.',
    isRead: false,
    createAt: '2026-05-27T08:00:00Z',
  },
  {
    title: '궁합 점수 업데이트',
    contents: '수아님과의 궁합 점수가 갱신되었어요.',
    isRead: true,
    createAt: '2026-05-25T20:00:00Z',
  },
];

const MOCK_SETTINGS: AlarmSetting[] = [
  { id: 1, name: '채팅 알림', isEnable: true },
  { id: 2, name: '매칭 알림', isEnable: true },
  { id: 3, name: '마케팅 알림', isEnable: false },
];

const MOCK_NOTICES: BoNoticeItem[] = [
  {
    id: 1,
    title: '노크인 서비스 오픈 안내',
    writer: '운영자',
    createAt: '2026-05-01T09:00:00Z',
  },
];

const MOCK_INQUIRIES: InquiryItem[] = [
  {
    id: 1,
    title: '프로필 사진 변경은 어떻게 하나요?',
    writer: '지민',
    status: 'answered',
    createAt: '2026-05-08T09:00:00Z',
    type: 'account',
  },
];

const MOCK_INQUIRY_DETAIL: InquiryDetailData = {
  inquirie: {
    id: 1,
    title: '프로필 사진 변경은 어떻게 하나요?',
    contents: '프로필 변경에 사진이 보이지 않습니다.',
    writer: '지민',
    status: 'answered',
    createAt: '2026-05-08T09:00:00Z',
    type: 'account',
    reply: [
      {
        id: 1,
        title: 'RE: 프로필 사진 변경',
        contents: '마이페이지 > 내 프로필 카드 > 프로필 변경에서 가능합니다.',
        writer: '고객센터',
        createAt: '2026-05-10T09:00:00Z',
      },
    ],
  },
};

const MOCK_CATEGORIES: InquiryCategory[] = [
  { id: 1, name: '계정' },
  { id: 2, name: '매칭' },
  { id: 3, name: '신고' },
  { id: 4, name: '기타' },
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

/** POST /users/me/devices — 로그인한 회원의 FCM 기기 정보 저장 */
export function registerMyDevice(body: DeviceRegistrationRequest): Promise<ApiResponse<UpdatedAt>> {
  if (USE_MOCK) return mockUpdatedAt();
  return request('POST', '/users/me/devices', { body });
}

/** GET /bo/notices — 운영 공지 목록 조회 */
export function getBoNotices(params: PageParams = {}): Promise<ApiResponse<BoNoticeListData>> {
  if (USE_MOCK) return mockOk({ notices: MOCK_NOTICES });
  return request('GET', '/bo/notices', { query: params });
}

/** GET /bo/notices/{id} — 운영 공지 상세 조회 */
export function getBoNoticeDetail(id: string): Promise<ApiResponse<BoNoticeDetailData>> {
  if (USE_MOCK) {
    const notice = MOCK_NOTICES.find((item) => String(item.id) === id) ?? MOCK_NOTICES[0];
    return mockOk({
      notice: notice ? { ...notice, contents: '노크인 서비스 공지사항입니다.' } : undefined,
    });
  }
  return request('GET', `/bo/notices/${id}`);
}

/** GET /users/me/notices — 사용자 공지 목록 조회 */
export function getNotices(params: PageParams = {}): Promise<ApiResponse<NoticeListData>> {
  if (USE_MOCK) return mockOk({ notices: MOCK_NOTICES });
  return request('GET', '/users/me/notices', { query: params });
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
