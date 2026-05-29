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

export type VerificationKind = 'student' | 'company';

// ─── Request Types ────────────────────────────────────────────────────────────

export type VerifySendRequest = {
  email: string;
};

export type VerifyConfirmRequest = {
  email: string;
  authNo: string;
};

export type BlockRequest = {
  userId: string;
};

// ─── Response Types ───────────────────────────────────────────────────────────

export type VerificationStatus = {
  isAccepted: string;
  email: string;
  createAt: string;
};

export type VerificationsData = {
  studentAuth: VerificationStatus;
  employeeAuth: VerificationStatus;
};

export type BlockItem = {
  userId: string;
  name: string;
  createAt: string;
};

export type BlockListData = {
  blocks: BlockItem[];
};

// ─── Mock ─────────────────────────────────────────────────────────────────────

const MOCK_VERIFICATIONS: VerificationsData = {
  studentAuth: {
    isAccepted: 'false',
    email: '',
    createAt: '',
  },
  employeeAuth: {
    isAccepted: 'true',
    email: 'jimin@company.com',
    createAt: '2026-05-15T09:00:00Z',
  },
};

const MOCK_BLOCKS: BlockItem[] = [
  { userId: 'u-9', name: '차단된사용자', createAt: '2026-05-01T09:00:00Z' },
];

// ─── Client ───────────────────────────────────────────────────────────────────

/** POST /auth/verify/{kind}/send — 인증번호 발급 */
export function sendVerificationCode(
  kind: VerificationKind,
  body: VerifySendRequest,
): Promise<ApiResponse<UpdatedAt>> {
  if (USE_MOCK) return mockUpdatedAt();
  return request('POST', `/auth/verify/${kind}/send`, { body });
}

/** POST /auth/verify/{kind}/confirm — 인증번호 인증 */
export function confirmVerificationCode(
  kind: VerificationKind,
  body: VerifyConfirmRequest,
): Promise<ApiResponse<UpdatedAt>> {
  if (USE_MOCK) return mockUpdatedAt();
  return request('POST', `/auth/verify/${kind}/confirm`, { body });
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
