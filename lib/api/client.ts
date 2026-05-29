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

export const API_BASE_URL = process.env.EXPO_PUBLIC_API_BASE_URL ?? '';

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

/** 테스트/mock에서 사용할 고정 시각. Date.now 의존을 한 곳으로 모은다. */
export function nowIso(): string {
  return new Date().toISOString();
}

type RequestOptions = {
  query?: Record<string, string | number | boolean | undefined | null>;
  body?: unknown;
  auth?: boolean;
};

function buildUrl(path: string, query?: RequestOptions['query']) {
  const url = `${API_BASE_URL}${path}`;
  if (!query) return url;
  const search = new URLSearchParams();
  for (const [key, value] of Object.entries(query)) {
    if (value === undefined || value === null) continue;
    search.append(key, String(value));
  }
  const qs = search.toString();
  return qs ? `${url}?${qs}` : url;
}

/**
 * 실제 네트워크 요청 (USE_MOCK=false 일 때 사용).
 * 서버가 이미 `{ status, data, error }` 엔벨로프를 내려준다고 가정한다.
 */
export async function request<T>(
  method: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE',
  path: string,
  options: RequestOptions = {},
): Promise<ApiResponse<T>> {
  const { query, body, auth = true } = options;
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };
  if (auth && accessToken) {
    headers.Authorization = `Bearer ${accessToken}`;
  }

  const res = await fetch(buildUrl(path, query), {
    method,
    headers,
    body: body === undefined ? undefined : JSON.stringify(body),
  });

  const json = (await res.json()) as ApiResponse<T>;
  return json;
}
