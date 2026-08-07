import * as Linking from 'expo-linking';
import * as WebBrowser from 'expo-web-browser';

import type { LoginData, LoginDeleteInfo } from '@/lib/api/auth';
import { API_BASE_URL, type ApiResponse } from '@/lib/api/client';

/**
 * 안드로이드용 Apple 로그인(브라우저 OAuth 플로우).
 *
 * iOS는 `expo-apple-authentication` 네이티브 SDK(apple-native.ts)를 쓰지만, 안드로이드에는
 * Apple SDK가 없어서 백엔드의 표준 Spring OAuth2 웹 플로우를 브라우저로 태운다.
 *
 * 플로우
 *  1. 앱: `openAuthSessionAsync(`{API_BASE_URL}/oauth2/authorization/apple?target_url=knockinrn://oauth/apple`)`
 *  2. 서버: `HttpCookieOAuth2AuthorizationRequestRepository#saveAuthorizationRequest`가
 *     `request.getParameter("target_url")` 값을 `target_url` 쿠키(180초)에 저장하고 Apple로 보낸다.
 *  3. Apple → 서버 콜백 → `OAuth2SuccessHandler`의 웹 분기가 `target_url` 쿠키
 *     (없으면 `clientSuccessUrl`)로 `response.sendRedirect`.
 *  4. 앱: 커스텀 스킴(`knockinrn://oauth/apple`)으로 돌아온 URL의 쿼리를 파싱해
 *     `socialLoginSdk()`와 동일한 `ApiResponse<LoginData>` 모양으로 변환한다.
 *     → session.tsx의 기존 후처리(탈퇴/정지 분기, 세션 저장)를 그대로 재사용.
 *
 * ⚠ 백엔드 의존사항
 *  현재 `OAuth2SuccessHandler`는 accessToken을 **httpOnly 쿠키로만** 심고 리다이렉트 URL에는
 *  아무 파라미터도 붙이지 않는다. 앱은 쿠키를 읽을 수 없으므로, 앱 스킴으로 리다이렉트할 때
 *  `accessToken` / `basicInfo` / `preferenceInfo` (+실패 시 `error`)를 쿼리 파라미터로
 *  붙여주기로 협의되어 있다. 이 구현은 그 형식을 가정한다.
 *  백엔드 배포 전(파라미터가 하나도 없는 경우)에는 크래시 없이 '준비 중' 실패로 떨어진다.
 */

/** 앱 스킴 리다이렉트 목적지. app.config.ts의 `scheme: 'knockinrn'`과 맞춘다. */
export const APPLE_WEB_REDIRECT_URI = 'knockinrn://oauth/apple';

/**
 * 진입 URL에 실어 보내는 리다이렉트 목적지 파라미터 이름.
 * 서버가 `request.getParameter("target_url")`로 읽으므로 이름이 정확히 일치해야 한다.
 * (HttpCookieOAuth2AuthorizationRequestRepository.REDIRECT_URI_PARAM_COOKIE_NAME)
 */
const TARGET_URL_PARAM = 'target_url';

/** 사용자가 브라우저를 닫았을 때 session.tsx가 'cancelled'로 분류하도록 쓰는 코드. */
const CANCEL_ERROR_CODE = 'ERR_REQUEST_CANCELED';

const NOT_READY_MESSAGE =
  'Apple 웹 로그인 준비 중입니다. 잠시 후 다시 시도하거나 카카오 로그인을 이용해주세요.';

export async function signInWithAppleWeb(): Promise<ApiResponse<LoginData>> {
  if (!API_BASE_URL) {
    throw new AppleWebSignInError(
      'API_BASE_URL_MISSING',
      '서버 주소가 설정되지 않아 Apple 로그인을 시작할 수 없어요.',
    );
  }

  const authorizeUrl =
    `${API_BASE_URL.replace(/\/+$/, '')}/oauth2/authorization/apple` +
    `?${TARGET_URL_PARAM}=${encodeURIComponent(APPLE_WEB_REDIRECT_URI)}`;

  const result = await WebBrowser.openAuthSessionAsync(authorizeUrl, APPLE_WEB_REDIRECT_URI);

  // 'cancel'(사용자가 닫음) / 'dismiss'(시스템이 닫음)는 네이티브 SDK 취소와 동일 취급.
  if (result.type === 'cancel' || result.type === 'dismiss') {
    throw new AppleWebSignInError(CANCEL_ERROR_CODE, 'Apple 로그인을 취소했어요.');
  }

  if (result.type !== 'success' || !result.url) {
    throw new AppleWebSignInError(
      'APPLE_WEB_LOGIN_FAILED',
      `Apple 로그인을 완료하지 못했어요. (${result.type})`,
    );
  }

  const params = parseCallbackParams(result.url);
  return toLoginResponse(params);
}

/** 콜백 URL의 쿼리 + 프래그먼트(#) 파라미터를 한 덩어리로 모은다. */
function parseCallbackParams(url: string): Record<string, string> {
  const [beforeFragment, ...fragmentParts] = url.split('#');
  const params: Record<string, string> = {};

  const parsed = Linking.parse(beforeFragment);
  for (const [key, value] of Object.entries(parsed.queryParams ?? {})) {
    const first = Array.isArray(value) ? value[0] : value;
    if (typeof first === 'string') params[key] = first;
  }

  // 백엔드가 파라미터를 프래그먼트로 붙일 가능성에 대비한 폴백.
  const fragment = fragmentParts.join('#');
  if (fragment) {
    for (const pair of fragment.split('&')) {
      if (!pair) continue;
      const index = pair.indexOf('=');
      const key = index === -1 ? pair : pair.slice(0, index);
      const value = index === -1 ? '' : pair.slice(index + 1);
      if (!key || params[key] !== undefined) continue;
      params[safeDecode(key)] = safeDecode(value);
    }
  }

  return params;
}

/** 웹 콜백 파라미터를 socialLoginSdk와 동일한 `ApiResponse<LoginData>`로 변환한다. */
function toLoginResponse(params: Record<string, string>): ApiResponse<LoginData> {
  const accessToken = pickParam(params, 'accessToken', 'access_token', 'token');
  const errorMessage = pickParam(params, 'error', 'errorMessage', 'error_description');
  const errorCode = pickParam(params, 'errorCode', 'error_code');
  const deleteInfo = parseDeleteInfo(params);

  const data: LoginData = {
    accessToken: accessToken ?? '',
    basicInfo: parseBoolean(pickParam(params, 'basicInfo', 'basic_info')),
    preferenceInfo: parseBoolean(pickParam(params, 'preferenceInfo', 'preference_info')),
    ...(deleteInfo ? { deleteInfo } : null),
    ...pickIdentity(params),
  };

  // 탈퇴/정지: SDK 경로와 동일하게 error가 아니라 deleteInfo로만 통보되고 401로 내려온다.
  if (deleteInfo?.delete === true) {
    return { status: parseStatus(params, 401), data: { ...data, accessToken: '' }, error: null };
  }

  if (errorMessage || errorCode) {
    return {
      status: parseStatus(params, 400),
      data,
      error: {
        code: errorCode ?? 'APPLE_WEB_LOGIN_FAILED',
        message: errorMessage ?? 'Apple 로그인에 실패했어요. 잠시 후 다시 시도해주세요.',
      },
    };
  }

  if (!accessToken) {
    // 백엔드가 아직 앱 스킴 리다이렉트에 파라미터를 붙이지 않는 단계(쿠키로만 내려주는 상태).
    // 크래시 없이 명확한 실패 메시지로 떨어뜨린다.
    return {
      status: 400,
      data,
      error: { code: 'APPLE_WEB_LOGIN_NOT_READY', message: NOT_READY_MESSAGE },
    };
  }

  return { status: parseStatus(params, 200), data, error: null };
}

/** 로그인 응답에 함께 실려올 수 있는 프로필 필드(있을 때만 담는다). */
function pickIdentity(params: Record<string, string>): Partial<LoginData> {
  const identity: Partial<LoginData> = {};
  const name = pickParam(params, 'name', 'memberName');
  const birth = pickParam(params, 'birth');
  const memberAge = pickParam(params, 'memberAge', 'age');
  const gender = pickParam(params, 'gender');
  const profileImageUrl = pickParam(params, 'profileImageUrl', 'memberProfileImageUrl');

  if (name) identity.name = name;
  if (birth) identity.birth = birth;
  if (memberAge && Number.isFinite(Number(memberAge))) identity.memberAge = Number(memberAge);
  if (gender === 'MALE' || gender === 'FEMALE') identity.gender = gender;
  if (profileImageUrl) identity.profileImageUrl = profileImageUrl;

  return identity;
}

function parseDeleteInfo(params: Record<string, string>): LoginDeleteInfo | undefined {
  const flag = pickParam(params, 'delete', 'isDelete', 'deleteInfo');
  const reason = pickParam(params, 'reason', 'deleteReason');
  if (flag === undefined && reason === undefined) return undefined;
  return { delete: parseBoolean(flag), reason: reason ?? null };
}

function parseStatus(params: Record<string, string>, fallback: number): number {
  const raw = pickParam(params, 'status', 'httpStatus');
  const parsed = raw === undefined ? Number.NaN : Number(raw);
  return Number.isFinite(parsed) && parsed >= 100 && parsed < 600 ? parsed : fallback;
}

function pickParam(params: Record<string, string>, ...keys: string[]): string | undefined {
  for (const key of keys) {
    const value = params[key];
    if (typeof value === 'string' && value.length > 0) return value;
  }
  return undefined;
}

function parseBoolean(value?: string): boolean {
  return value === 'true' || value === '1' || value === 'TRUE';
}

function safeDecode(value: string): string {
  try {
    return decodeURIComponent(value.replace(/\+/g, ' '));
  } catch {
    return value;
  }
}

class AppleWebSignInError extends Error {
  constructor(
    public readonly code: string,
    message: string,
  ) {
    super(message);
    this.name = 'AppleWebSignInError';
  }
}
