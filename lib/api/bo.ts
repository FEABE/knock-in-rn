/**
 * 도메인 10. 백오피스 [BO]
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
import type { LifestylePattern, RoomTypeMeta } from './meta';
import type { InquiryDetailData, InquiryListData } from './notification';

// ─── Request Types ────────────────────────────────────────────────────────────

export type TermWriteRequest = {
  title: string;
  contents: string;
};

export type RoomTypeWriteRequest = {
  name: string;
};

export type LifestylePatternWriteRequest = {
  name: string;
  type: string;
  value: string;
  description: string;
};

export type NoticeWriteRequest = {
  title: string;
  contents: string;
};

/** 문의사항 답변 등록. (inquirieId 오타 유지) */
export type InquiryReplyRequest = {
  inquirieId: string;
  contents: string;
};

// ─── Response Types ───────────────────────────────────────────────────────────

export type BoTermItem = {
  id: string;
  title: string;
  createAt: string;
};

export type BoTermListData = {
  terms: BoTermItem[];
};

/** 약관 상세. 명세상 terms 가 배열로 내려옴(그대로 유지). */
export type BoTermDetailItem = {
  id: string;
  title: string;
  contents: string;
  createAt: string;
};

export type BoTermDetailData = {
  terms: BoTermDetailItem[];
};

export type BoRoomTypeListData = {
  roomType: RoomTypeMeta[];
};

export type BoLifestylePatternsData = {
  patterns: LifestylePattern[];
};

export type BoCompanyVerification = {
  isAccepted: string;
  email: string;
  createAt: string;
};

export type BoCompanyVerificationsData = {
  employeeAuth: BoCompanyVerification[];
};

export type BoNoticeItem = {
  id: string;
  title: string;
  writer: string;
  createAt: string;
  type: string;
};

export type BoNoticeListData = {
  notices: BoNoticeItem[];
};

export type BoNoticeDetailData = {
  notice: {
    id: string;
    title: string;
    contents: string;
    writer: string;
    createAt: string;
    type: string;
  };
};

// ─── Mock ─────────────────────────────────────────────────────────────────────

const MOCK_BO_TERMS: BoTermItem[] = [
  { id: 'term-tos', title: '서비스 이용약관', createAt: '2026-04-01T09:00:00Z' },
  {
    id: 'term-privacy',
    title: '개인정보 처리방침',
    createAt: '2026-04-01T09:00:00Z',
  },
];

const MOCK_BO_ROOM_TYPES: RoomTypeMeta[] = [
  { id: 'one-room', name: '원룸' },
  { id: 'two-room', name: '투룸' },
];

const MOCK_BO_PATTERNS: LifestylePattern[] = [
  {
    id: 'lp-sleep',
    name: '취침 패턴',
    details: [
      { values: 'early', description: '일찍 자요' },
      { values: 'late', description: '늦게 자요' },
    ],
  },
];

const MOCK_BO_COMPANY_VERIFS: BoCompanyVerification[] = [
  {
    isAccepted: 'false',
    email: 'newuser@company.com',
    createAt: '2026-05-26T09:00:00Z',
  },
];

const MOCK_BO_NOTICES: BoNoticeItem[] = [
  {
    id: 'n-1',
    title: '서비스 오픈 안내',
    writer: '관리자',
    createAt: '2026-04-15T09:00:00Z',
    type: 'notice',
  },
];

const MOCK_BO_NOTICE_DETAIL: BoNoticeDetailData = {
  notice: {
    id: 'n-1',
    title: '서비스 오픈 안내',
    contents: '안녕하세요, 노크인이 정식 오픈했습니다.',
    writer: '관리자',
    createAt: '2026-04-15T09:00:00Z',
    type: 'notice',
  },
};

const MOCK_BO_INQUIRIES: InquiryListData = {
  inquiries: [
    {
      id: 'q-1',
      title: '프로필 사진 변경은 어떻게 하나요?',
      writer: '지민',
      status: 'pending',
      createAt: '2026-05-08T09:00:00Z',
      type: 'account',
    },
  ],
};

const MOCK_BO_INQUIRY_DETAIL: InquiryDetailData = {
  inquirie: {
    id: 'q-1',
    title: '프로필 사진 변경은 어떻게 하나요?',
    contents: '프로필 변경에 사진이 보이지 않습니다.',
    writer: '지민',
    status: 'pending',
    createAt: '2026-05-08T09:00:00Z',
    type: 'account',
    reply: [],
  },
};

// ─── Client: 약관 ──────────────────────────────────────────────────────────────

/** POST /bo/terms — 약관 신규 등록 */
export function createBoTerm(body: TermWriteRequest): Promise<ApiResponse<UpdatedAt>> {
  if (USE_MOCK) return mockUpdatedAt();
  return request('POST', '/bo/terms', { body });
}

/** PUT /bo/terms/{termsId}/draft — 약관 수정 (임시 저장) */
export function saveBoTermDraft(
  termsId: string,
  body: TermWriteRequest,
): Promise<ApiResponse<UpdatedAt>> {
  if (USE_MOCK) return mockUpdatedAt();
  return request('PUT', `/bo/terms/${termsId}/draft`, { body });
}

/** PUT /bo/terms/{termsId}/publish — 약관 수정 (최종 저장) */
export function publishBoTerm(
  termsId: string,
  body: TermWriteRequest,
): Promise<ApiResponse<UpdatedAt>> {
  if (USE_MOCK) return mockUpdatedAt();
  return request('PUT', `/bo/terms/${termsId}/publish`, { body });
}

/** GET /bo/terms — 약관 목록 조회 */
export function getBoTerms(params: PageParams = {}): Promise<ApiResponse<BoTermListData>> {
  if (USE_MOCK) return mockOk({ terms: MOCK_BO_TERMS });
  return request('GET', '/bo/terms', { query: params });
}

/** GET /bo/terms/{termsId} — 약관 상세 보기 */
export function getBoTermDetail(termsId: string): Promise<ApiResponse<BoTermDetailData>> {
  if (USE_MOCK) {
    return mockOk({
      terms: [
        {
          id: termsId,
          title: '서비스 이용약관',
          contents: '약관 본문 (mock)',
          createAt: '2026-04-01T09:00:00Z',
        },
      ],
    });
  }
  return request('GET', `/bo/terms/${termsId}`);
}

/** DELETE /bo/terms/{termsId} — 약관 삭제 */
export function deleteBoTerm(termsId: string): Promise<ApiResponse<UpdatedAt>> {
  if (USE_MOCK) return mockUpdatedAt();
  return request('DELETE', `/bo/terms/${termsId}`);
}

// ─── Client: 방형태 ─────────────────────────────────────────────────────────────

/** POST /bo/room-types — 방형태 등록 */
export function createBoRoomType(body: RoomTypeWriteRequest): Promise<ApiResponse<UpdatedAt>> {
  if (USE_MOCK) return mockUpdatedAt();
  return request('POST', '/bo/room-types', { body });
}

/** GET /bo/room-types — 방형태 목록 조회 */
export function getBoRoomTypes(params: PageParams = {}): Promise<ApiResponse<BoRoomTypeListData>> {
  if (USE_MOCK) return mockOk({ roomType: MOCK_BO_ROOM_TYPES });
  return request('GET', '/bo/room-types', { query: params });
}

/** PUT /bo/room-types/{id} — 방형태 수정 */
export function updateBoRoomType(
  id: string,
  body: RoomTypeWriteRequest,
): Promise<ApiResponse<UpdatedAt>> {
  if (USE_MOCK) return mockUpdatedAt();
  return request('PUT', `/bo/room-types/${id}`, { body });
}

/** DELETE /bo/room-types/{id} — 방형태 삭제 */
export function deleteBoRoomType(id: string): Promise<ApiResponse<UpdatedAt>> {
  if (USE_MOCK) return mockUpdatedAt();
  return request('DELETE', `/bo/room-types/${id}`);
}

/** GET /bo/room-types/{id} — 방형태 상세 조회 */
export function getBoRoomType(id: string): Promise<ApiResponse<RoomTypeMeta>> {
  if (USE_MOCK) return mockOk({ id, name: '투룸' });
  return request('GET', `/bo/room-types/${id}`);
}

// ─── Client: 생활패턴 ───────────────────────────────────────────────────────────

/** GET /bo/lifestyle-patterns — 생활패턴 목록 조회 */
export function getBoLifestylePatterns(
  params: PageParams = {},
): Promise<ApiResponse<BoLifestylePatternsData>> {
  if (USE_MOCK) return mockOk({ patterns: MOCK_BO_PATTERNS });
  return request('GET', '/bo/lifestyle-patterns', { query: params });
}

/** GET /bo/lifestyle-patterns/{id} — 생활패턴 상세 조회 */
export function getBoLifestylePattern(id: string): Promise<ApiResponse<BoLifestylePatternsData>> {
  if (USE_MOCK) return mockOk({ patterns: MOCK_BO_PATTERNS });
  return request('GET', `/bo/lifestyle-patterns/${id}`);
}

/** POST /bo/lifestyle-patterns — 생활패턴 등록 */
export function createBoLifestylePattern(
  body: LifestylePatternWriteRequest,
): Promise<ApiResponse<UpdatedAt>> {
  if (USE_MOCK) return mockUpdatedAt();
  return request('POST', '/bo/lifestyle-patterns', { body });
}

/** PUT /bo/lifestyle-patterns/{id} — 생활패턴 수정 */
export function updateBoLifestylePattern(
  id: string,
  body: LifestylePatternWriteRequest,
): Promise<ApiResponse<UpdatedAt>> {
  if (USE_MOCK) return mockUpdatedAt();
  return request('PUT', `/bo/lifestyle-patterns/${id}`, { body });
}

/** DELETE /bo/lifestyle-patterns/{id} — 생활패턴 삭제 */
export function deleteBoLifestylePattern(id: string): Promise<ApiResponse<UpdatedAt>> {
  if (USE_MOCK) return mockUpdatedAt();
  return request('DELETE', `/bo/lifestyle-patterns/${id}`);
}

// ─── Client: 신원인증(회사) ──────────────────────────────────────────────────────

/** GET /bo/verifications/company — 신원인증(회사) 목록 조회 */
export function getBoCompanyVerifications(
  params: PageParams = {},
): Promise<ApiResponse<BoCompanyVerificationsData>> {
  if (USE_MOCK) return mockOk({ employeeAuth: MOCK_BO_COMPANY_VERIFS });
  return request('GET', '/bo/verifications/company', { query: params });
}

/** PATCH /bo/verifications/company/{id}/approve — 인증 수락 */
export function approveBoCompanyVerification(id: string): Promise<ApiResponse<UpdatedAt>> {
  if (USE_MOCK) return mockUpdatedAt();
  return request('PATCH', `/bo/verifications/company/${id}/approve`);
}

// ─── Client: 공지사항 ───────────────────────────────────────────────────────────

/** POST /bo/notices — 공지사항 작성 */
export function createBoNotice(body: NoticeWriteRequest): Promise<ApiResponse<UpdatedAt>> {
  if (USE_MOCK) return mockUpdatedAt();
  return request('POST', '/bo/notices', { body });
}

/** GET /bo/notices — 공지사항 목록 조회 */
export function getBoNotices(params: PageParams = {}): Promise<ApiResponse<BoNoticeListData>> {
  if (USE_MOCK) return mockOk({ notices: MOCK_BO_NOTICES });
  return request('GET', '/bo/notices', { query: params });
}

/** GET /bo/notices/{id} — 공지사항 상세 조회 */
export function getBoNotice(id: string): Promise<ApiResponse<BoNoticeDetailData>> {
  if (USE_MOCK) return mockOk(MOCK_BO_NOTICE_DETAIL);
  return request('GET', `/bo/notices/${id}`);
}

/** PUT /bo/notices/{id} — 공지사항 수정 */
export function updateBoNotice(
  id: string,
  body: NoticeWriteRequest,
): Promise<ApiResponse<UpdatedAt>> {
  if (USE_MOCK) return mockUpdatedAt();
  return request('PUT', `/bo/notices/${id}`, { body });
}

/** DELETE /bo/notices/{id} — 공지사항 삭제 */
export function deleteBoNotice(id: string): Promise<ApiResponse<UpdatedAt>> {
  if (USE_MOCK) return mockUpdatedAt();
  return request('DELETE', `/bo/notices/${id}`);
}

// ─── Client: 문의사항 ───────────────────────────────────────────────────────────

/** POST /bo/inquiries — 문의사항 답변 등록 */
export function replyBoInquiry(body: InquiryReplyRequest): Promise<ApiResponse<UpdatedAt>> {
  if (USE_MOCK) return mockUpdatedAt();
  return request('POST', '/bo/inquiries', { body });
}

/** GET /bo/inquiries — 문의사항 목록 조회 */
export function getBoInquiries(params: PageParams = {}): Promise<ApiResponse<InquiryListData>> {
  if (USE_MOCK) return mockOk(MOCK_BO_INQUIRIES);
  return request('GET', '/bo/inquiries', { query: params });
}

/** GET /bo/inquiries/{id} — 문의사항 상세 조회 */
export function getBoInquiry(id: string): Promise<ApiResponse<InquiryDetailData>> {
  if (USE_MOCK) return mockOk(MOCK_BO_INQUIRY_DETAIL);
  return request('GET', `/bo/inquiries/${id}`);
}
