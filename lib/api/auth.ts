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

/** 카카오 SDK 인증 후 백엔드에 전달하는 토큰 묶음. */
export type KakaoAuthObj = {
  access_token: string;
  refresh_token: string;
};

/** Apple SDK 인증 후 백엔드에서 검증할 자격 증명. */
export type AppleAuthObj = {
  identity_token: string;
  authorization_code?: string;
};

export type AuthObj = KakaoAuthObj | AppleAuthObj;

/** 로그인/회원가입 공통 응답 data. */
export type LoginIdentity = {
  name?: string;
  memberName?: string;
  birth?: string;
  memberAge?: number;
  gender?: 'MALE' | 'FEMALE';
  profileImageUrl?: string;
  memberProfileImageUrl?: string;
};

export type LoginData = LoginIdentity & {
  accessToken: string;
  /** 기본정보(온보딩 1~3단계) 입력 완료 여부. */
  basicInfo: boolean;
  /** 선호조건 입력 완료 여부. */
  preferenceInfo: boolean;
};

type LoginDataResponse = Partial<LoginData> & {
  access_token?: string;
  token?: string;
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
  return request<LoginDataResponse>('GET', `/oauth2/authorization/${provider}`, {
    auth: false,
  }).then(normalizeLoginResponse);
}

/** 카카오/Apple 로그인·회원가입 (SDK 방식) — POST /sdk/oauth2/authorization/{provider} */
export function socialLoginSdk(
  provider: SocialProvider,
  authObj: AuthObj,
): Promise<ApiResponse<LoginData>> {
  if (USE_MOCK) return mockOk(MOCK_LOGIN);
  return request<LoginDataResponse>('POST', `/sdk/oauth2/authorization/${provider}`, {
    auth: false,
    body: { authObj },
  }).then(normalizeLoginResponse);
}

/** 로그아웃 — Swagger에는 서버 로그아웃 API가 없어서 기기 세션 삭제만 수행한다. */
export function logout(_accessToken?: string): Promise<ApiResponse<UpdatedAt>> {
  return mockUpdatedAt();
}

/** 회원 탈퇴 — DELETE /users/me */
export function withdraw(): Promise<ApiResponse<UpdatedAt>> {
  if (USE_MOCK) return mockUpdatedAt();
  return request('DELETE', '/users/me');
}

function normalizeLoginResponse(res: ApiResponse<LoginDataResponse>): ApiResponse<LoginData> {
  if (!res.data) return res as ApiResponse<LoginData>;
  const accessToken = res.data.accessToken ?? res.data.access_token ?? res.data.token;
  return {
    ...res,
    data: {
      ...res.data,
      accessToken: accessToken ?? '',
      basicInfo: res.data.basicInfo === true,
      preferenceInfo: res.data.preferenceInfo === true,
    },
  };
}
