/**
 * 도메인 7. 신원인증/차단
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

export type VerificationKind = 'student' | 'company';

// ─── Request Types ────────────────────────────────────────────────────────────

export type VerifySendRequest = OpenApiSchema<'org.example.knockin.dto.EmailSendDto$Request'>;

export type VerifyConfirmRequest = OpenApiSchema<'org.example.knockin.dto.EmailConfirmDto$Request'>;

export type BlockRequest = OpenApiSchema<'org.example.knockin.dto.BlockDto$Request'>;

// ─── Response Types ───────────────────────────────────────────────────────────

export type VerificationStatus =
  OpenApiSchema<'org.example.knockin.dto.MyVerificationListDto$Response$AuthInfo'>;

export type VerificationsData =
  OpenApiSchema<'org.example.knockin.dto.MyVerificationListDto$Response'>;

export type BlockItem = OpenApiSchema<'org.example.knockin.dto.BlockListDto$Response$Block'> & {
  blockId?: number;
};

export type BlockListData = {
  blocks: BlockItem[];
};

export type MyReportItem = {
  id?: number;
  type?: 'MEMBER' | 'BOARD';
  targetId?: number;
  title?: string;
  reason?: string;
  status?: 'PENDING' | 'NOACTION' | 'SUSPENDED' | 'HIDDEN';
  createdAt?: string;
};

export type MyReportListData = {
  reports?: MyReportItem[];
};

// ─── Mock ─────────────────────────────────────────────────────────────────────

const MOCK_VERIFICATIONS: VerificationsData = {
  studentAuth: {
    status: 'PENDING',
    email: '',
    createAt: '',
  },
  employeeAuth: {
    status: 'ACCEPTED',
    email: 'jimin@company.com',
    createAt: '2026-05-15T09:00:00Z',
  },
};

const MOCK_BLOCKS: BlockItem[] = [
  { userId: 9, name: '차단된사용자', createAt: '2026-05-01T09:00:00Z' },
];

// ─── Client ───────────────────────────────────────────────────────────────────

/** POST /auth/verify/student/send, /auth/verify/company/send — 인증번호 발급 */
export function sendVerificationCode(
  kind: VerificationKind,
  body: VerifySendRequest,
): Promise<ApiResponse<UpdatedAt>> {
  if (USE_MOCK) return mockUpdatedAt();
  return kind === 'student'
    ? request('POST', '/auth/verify/student/send', { body })
    : request('POST', '/auth/verify/company/send', { body });
}

/** POST /auth/verify/student/confirm, /auth/verify/company/confirm — 인증번호 인증 */
export function confirmVerificationCode(
  kind: VerificationKind,
  body: VerifyConfirmRequest,
): Promise<ApiResponse<UpdatedAt>> {
  if (USE_MOCK) return mockUpdatedAt();
  return kind === 'student'
    ? request('POST', '/auth/verify/student/confirm', { body })
    : request('POST', '/auth/verify/company/confirm', { body });
}

/** GET /users/me/verifications — 신원인증 목록 조회 */
export function getVerifications(params: PageParams = {}): Promise<ApiResponse<VerificationsData>> {
  if (USE_MOCK) return mockOk(MOCK_VERIFICATIONS);
  return request('GET', '/users/me/verifications', { query: params });
}

/** POST /blocks — 사용자 차단 */
export function blockUser(body: BlockRequest): Promise<ApiResponse<UpdatedAt>> {
  if (USE_MOCK) return mockUpdatedAt();
  return request('POST', '/blocks', { body });
}

/** GET /blocks — 사용자 차단 목록 조회 */
export function getBlocks(params: PageParams = {}): Promise<ApiResponse<BlockListData>> {
  if (USE_MOCK) return mockOk({ blocks: MOCK_BLOCKS });
  return request('GET', '/blocks', { query: params });
}

/** DELETE /blocks/{blockId} — 사용자 차단 해제 */
export function unblockUser(blockId: string): Promise<ApiResponse<UpdatedAt>> {
  if (USE_MOCK) return mockUpdatedAt();
  return request('DELETE', `/blocks/${blockId}`);
}

/** GET /users/me/reports — 내가 접수한 신고 내역 */
export function getMyReports(): Promise<ApiResponse<MyReportListData>> {
  if (USE_MOCK) {
    return mockOk({
      reports: [
        {
          id: 1,
          type: 'MEMBER',
          targetId: 9,
          title: '차단된사용자 신고',
          reason: '부적절한 대화',
          status: 'PENDING',
          createdAt: '2026-05-01T09:00:00Z',
        },
      ],
    });
  }
  return request('GET', '/users/me/reports');
}
