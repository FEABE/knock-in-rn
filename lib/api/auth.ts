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

/**
 * 탈퇴/정지 회원 정보.
 *
 * 서버는 탈퇴/정지 회원이 로그인해도 예외를 던지지 않고, 성공 바디 모양 그대로
 * `accessToken`만 null로 비운 채 HTTP 401 + `error: null`로 응답한다. 즉 실패 사유는
 * `error`가 아니라 이 필드에만 담겨 온다.
 *
 * JSON 키가 `isDelete`가 아니라 `delete`인 것은 서버가 Lombok boolean getter 규칙을
 * 따르기 때문이다.
 */
export type LoginDeleteInfo = {
  /** true면 탈퇴 또는 정지 상태(둘을 구분하지 않는 단일 플래그). */
  delete?: boolean;
  /**
   * 탈퇴는 고정 문구 `"탈퇴한 회원입니다."`, 정지는 관리자가 입력한 자유 문자열이다.
   * 정지 사유는 비어 있을 수 있어 null이 올라온다.
   */
  reason?: string | null;
};

export type LoginData = LoginIdentity & {
  accessToken: string;
  /** 기본정보(온보딩 1~3단계) 입력 완료 여부. */
  basicInfo: boolean;
  /** 선호조건 입력 완료 여부. */
  preferenceInfo: boolean;
  /** 탈퇴/정지 회원일 때만 내려온다. */
  deleteInfo?: LoginDeleteInfo;
};

type LoginDataResponse = Omit<Partial<LoginData>, 'accessToken'> & {
  /** 탈퇴/정지 회원 응답에서는 null로 내려온다. */
  accessToken?: string | null;
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
