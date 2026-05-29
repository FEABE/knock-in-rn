/**
 * 도메인 1. 인증/회원가입
 */
import {
  type ApiResponse,
  type UpdatedAt,
  mockOk,
  mockUpdatedAt,
  request,
  USE_MOCK,
} from './client';

// ─── Types ──────────────────────────────────────────────────────────────────

/** OAuth SDK 방식 로그인 시 클라이언트가 보내는 토큰 묶음. */
export type AuthObj = {
  access_token: string;
  refresh_token: string;
};

/** 로그인/회원가입 공통 응답 data. */
export type LoginData = {
  accessToken: string;
  /** 기본정보(온보딩 1~3단계) 입력 완료 여부. */
  basicInfo: boolean;
  /** 선호조건 입력 완료 여부. */
  preferenceInfo: boolean;
};

export type SocialProvider = 'kakao' | 'apple';

// ─── Mock ─────────────────────────────────────────────────────────────────────

const MOCK_LOGIN: LoginData = {
  accessToken: 'mock-access-token',
  basicInfo: true,
  preferenceInfo: false,
};

// ─── Client ───────────────────────────────────────────────────────────────────

/** 카카오/애플 로그인·회원가입 (웹 방식) — GET /oauth2/authorization/{provider} */
export function socialLoginWeb(provider: SocialProvider): Promise<ApiResponse<LoginData>> {
  if (USE_MOCK) return mockOk(MOCK_LOGIN);
  return request('GET', `/oauth2/authorization/${provider}`, { auth: false });
}

/** 카카오/애플 로그인·회원가입 (SDK 방식) — POST /sdk/oauth2/authorization/{provider} */
export function socialLoginSdk(
  provider: SocialProvider,
  authObj: AuthObj,
): Promise<ApiResponse<LoginData>> {
  if (USE_MOCK) return mockOk(MOCK_LOGIN);
  return request('POST', `/sdk/oauth2/authorization/${provider}`, {
    auth: false,
    body: { authObj },
  });
}

/** 로그아웃 — POST /auth/logout */
export function logout(accessToken: string): Promise<ApiResponse<UpdatedAt>> {
  if (USE_MOCK) return mockUpdatedAt();
  return request('POST', '/auth/logout', { body: { accessToken } });
}

/** 회원 탈퇴 — DELETE /users/me */
export function withdraw(): Promise<ApiResponse<UpdatedAt>> {
  if (USE_MOCK) return mockUpdatedAt();
  return request('DELETE', '/users/me');
}
