/**
 * API 공통 클라이언트 레이어.
 *
 * 모든 응답은 명세의 `{ status, data, error }` 엔벨로프를 따른다.
 * `EXPO_PUBLIC_API_BASE_URL` 설정 시 실제 서버로 요청한다.
 * 테스트 데이터가 필요할 때만 `EXPO_PUBLIC_USE_MOCK=true` 로 mock 응답을 사용한다.
 *
 * 필드명은 서버 명세를 1:1로 따른다. 명세상의 오타(mounthRent, thumnail,
 * createAt, mountlyRent, comeableAt 등)도 그대로 유지한다.
 */

import { create, type AxiosRequestConfig } from 'axios';
import Constants from 'expo-constants';
import { Platform } from 'react-native';

export type ApiError = {
  code?: string;
  message: string;
} | null;

/** 명세 공통 응답 엔벨로프. */
export type ApiResponse<T> = {
  status: number;
  data: T;
  error: ApiError;
};

/** 다수의 쓰기(저장/수정/삭제) 엔드포인트 공통 응답 data. */
export type UpdatedAt = {
  updatedAt: string;
};

/** 페이지네이션 쿼리 파라미터 (?page=0&size=20&sort=createdAt,desc). */
export type PageParams = {
  page?: number;
  size?: number;
  /** 예: "createdAt,desc" */
  sort?: string;
};

const RAW_API_BASE_URL = process.env.EXPO_PUBLIC_API_BASE_URL ?? '';
export const API_BASE_URL = resolveApiBaseUrl(RAW_API_BASE_URL);

/** 기본값은 실 API 사용. 테스트 데이터가 필요할 때만 EXPO_PUBLIC_USE_MOCK=true 로 켠다. */
export const USE_MOCK = process.env.EXPO_PUBLIC_USE_MOCK === 'true';
const API_TIMEOUT_MS = 15_000;

let accessToken: string | null = null;
let authFailureHandler: (() => void) | null = null;

export function setAccessToken(token: string | null) {
  accessToken = token;
}

export function getAccessToken() {
  return accessToken;
}

export function getAccessTokenMemberId(): string | null {
  const claims = decodeAccessToken();
  return claims?.memberId == null ? null : String(claims.memberId);
}

export function setAuthFailureHandler(handler: (() => void) | null) {
  authFailureHandler = handler;
}

export function notifyAuthFailure() {
  authFailureHandler?.();
}

/** mock 응답 헬퍼. 네트워크 지연을 흉내내기 위한 약간의 delay 포함. */
export function mockOk<T>(data: T, status = 200): Promise<ApiResponse<T>> {
  return new Promise((resolve) => {
    setTimeout(() => resolve({ status, data, error: null }), MOCK_DELAY_MS);
  });
}

/** 명세의 updatedAt 응답을 만드는 헬퍼. */
export function mockUpdatedAt(): Promise<ApiResponse<UpdatedAt>> {
  return mockOk({ updatedAt: nowIso() });
}

const MOCK_DELAY_MS = 250;

function resolveApiBaseUrl(rawUrl: string): string {
  if (!rawUrl || !__DEV__ || Platform.OS === 'web') return rawUrl;
  if (!/^https?:\/\/(127\.0\.0\.1|localhost)(:\d+)?/i.test(rawUrl)) return rawUrl;

  const expoHost = getExpoDevHost();
  if (!expoHost) {
    if (Platform.OS === 'android')
      return rawUrl.replace(/\/\/(127\.0\.0\.1|localhost)/i, '//10.0.2.2');
    return rawUrl;
  }

  return rawUrl.replace(/\/\/(127\.0\.0\.1|localhost)/i, `//${expoHost}`);
}

function getExpoDevHost(): string | null {
  const constants = Constants as any;
  const candidates = [
    constants.expoConfig?.hostUri,
    constants.manifest2?.extra?.expoClient?.hostUri,
    constants.manifest?.debuggerHost,
    constants.manifest?.hostUri,
  ];
  const hostUri = candidates.find((value) => typeof value === 'string' && value.length > 0);
  if (!hostUri) return null;
  return hostUri.split(':')[0] ?? null;
}

/** 테스트/mock에서 사용할 고정 시각. Date.now 의존을 한 곳으로 모은다. */
export function nowIso(): string {
  return new Date().toISOString();
}

type RequestOptions = {
  query?: Record<
    string,
    string | number | boolean | readonly (string | number | boolean)[] | undefined | null
  >;
  body?: unknown;
  auth?: boolean;
  headers?: Record<string, string>;
};

type KnockAxiosRequestConfig = AxiosRequestConfig & {
  skipAuth?: boolean;
};

export const apiClient = create({
  baseURL: API_BASE_URL,
  timeout: API_TIMEOUT_MS,
});

apiClient.interceptors.request.use((config) => {
  const skipAuth = (config as KnockAxiosRequestConfig).skipAuth;
  if (accessToken && !isAccessTokenExpired() && !skipAuth) {
    config.headers.Authorization = `Bearer ${accessToken}`;
  }
  return config;
});

/**
 * 실제 네트워크 요청 (USE_MOCK=false 일 때 사용).
 */
export async function request<T>(
  method: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE',
  path: string,
  options: RequestOptions = {},
): Promise<ApiResponse<T>> {
  const { query, body, auth = true, headers } = options;
  const isFormDataBody = typeof FormData !== 'undefined' && body instanceof FormData;

  const config: KnockAxiosRequestConfig = {
    method,
    url: path,
    params: query,
    paramsSerializer: { indexes: null },
    data: body,
    headers: isFormDataBody ? { 'Content-Type': 'multipart/form-data', ...headers } : headers,
    skipAuth: !auth,
  };

  try {
    const res = await apiClient.request<ApiResponse<T>>(config);
    if (auth && isAuthFailure(res.data, res.status)) authFailureHandler?.();
    return res.data;
  } catch (error: any) {
    // Axios wraps errors in error.response
    if (error.response?.data) {
      if (auth && isAuthFailure(error.response.data, error.response.status)) {
        authFailureHandler?.();
      }
      return error.response.data as ApiResponse<T>;
    }
    return {
      status: error.response?.status || 500,
      data: null as any,
      error: { code: 'NETWORK_ERROR', message: error.message },
    };
  }
}

function decodeAccessToken(): { memberId?: string | number; exp?: number } | null {
  if (!accessToken) return null;
  const payload = accessToken.split('.')[1];
  if (!payload) return null;
  try {
    const normalized = payload.replace(/-/g, '+').replace(/_/g, '/');
    const padded = normalized.padEnd(Math.ceil(normalized.length / 4) * 4, '=');
    const decoded =
      typeof globalThis.atob === 'function' ? globalThis.atob(padded) : decodeBase64Ascii(padded);
    return JSON.parse(decoded);
  } catch {
    return null;
  }
}

function decodeBase64Ascii(value: string): string {
  const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';
  let bits = 0;
  let bitCount = 0;
  let result = '';
  for (const char of value.replace(/=+$/, '')) {
    const index = alphabet.indexOf(char);
    if (index < 0) continue;
    bits = (bits << 6) | index;
    bitCount += 6;
    if (bitCount >= 8) {
      bitCount -= 8;
      result += String.fromCharCode((bits >> bitCount) & 0xff);
    }
  }
  return result;
}

export function isAccessTokenExpired(): boolean {
  const exp = decodeAccessToken()?.exp;
  return typeof exp === 'number' && exp * 1000 <= Date.now();
}

function isAuthFailure(payload: unknown, httpStatus: number): boolean {
  const response = payload as Partial<ApiResponse<unknown>> | null;
  const status = response?.status ?? httpStatus;
  const code = response?.error?.code?.toUpperCase() ?? '';
  return status === 401 || code.includes('UNAUTHORIZED') || code.includes('TOKEN_EXPIRED');
}
