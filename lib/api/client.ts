/**
 * API 공통 클라이언트 레이어.
 *
 * 모든 응답은 명세의 `{ status, data, error }` 엔벨로프를 따른다.
 * 현재는 mock 응답을 반환하며, `EXPO_PUBLIC_USE_MOCK=false` + `EXPO_PUBLIC_API_BASE_URL`
 * 설정 시 실제 서버로 전환된다.
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

/** 기본값은 mock 사용. 실서버 연동 시 EXPO_PUBLIC_USE_MOCK=false 로 끈다. */
export const USE_MOCK = process.env.EXPO_PUBLIC_USE_MOCK !== 'false';

let accessToken: string | null = null;

export function setAccessToken(token: string | null) {
  accessToken = token;
}

export function getAccessToken() {
  return accessToken;
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
    if (Platform.OS === 'android') return rawUrl.replace(/\/\/(127\.0\.0\.1|localhost)/i, '//10.0.2.2');
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
  headers: {
    'Content-Type': 'application/json',
  },
});

apiClient.interceptors.request.use((config) => {
  const skipAuth = (config as KnockAxiosRequestConfig).skipAuth;
  if (accessToken && !skipAuth) {
    config.headers.Authorization = `Bearer ${accessToken}`;
  }
  if (__DEV__) {
    const url = `${config.baseURL ?? ''}${config.url ?? ''}`;
    console.log(`[API →] ${config.method?.toUpperCase()} ${url}`, config.data ?? '');
  }
  return config;
});

// 개발 중 응답/에러를 터미널에서 바로 보기 위한 로깅.
apiClient.interceptors.response.use(
  (res) => {
    if (__DEV__) {
      console.log(`[API ←] ${res.status} ${res.config.url}`, res.data);
    }
    return res;
  },
  (error) => {
    if (__DEV__) {
      const status = error.response?.status ?? 'NETWORK';
      console.log(
        `[API ✗] ${status} ${error.config?.url ?? ''}`,
        error.response?.data ?? error.message,
      );
    }
    return Promise.reject(error);
  },
);

/**
 * 실제 네트워크 요청 (USE_MOCK=false 일 때 사용).
 */
export async function request<T>(
  method: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE',
  path: string,
  options: RequestOptions = {},
): Promise<ApiResponse<T>> {
  const { query, body, auth = true, headers } = options;

  const config: KnockAxiosRequestConfig = {
    method,
    url: path,
    params: query,
    data: body,
    headers,
    skipAuth: !auth,
  };

  try {
    const res = await apiClient.request<ApiResponse<T>>(config);
    return res.data;
  } catch (error: any) {
    // Axios wraps errors in error.response
    if (error.response?.data) {
      return error.response.data as ApiResponse<T>;
    }
    return {
      status: error.response?.status || 500,
      data: null as any,
      error: { code: 'NETWORK_ERROR', message: error.message },
    };
  }
}
