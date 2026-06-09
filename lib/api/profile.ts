/**
 * 도메인 2. 온보딩/프로필
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
import type { ConditionItem, LifestyleItem, ProfileRegionItem, RoomProfileItem } from './entities';

// ─── Request Types ────────────────────────────────────────────────────────────

/** 기본정보1 (온보딩 1단계). */
export type ProfileBasicRequest = {
  name: string;
  /** "YYYY-MM-DD" (OpenAPI string($date)) */
  birth: string;
  /** "MALE" | "FEMALE" (OpenAPI enum) */
  gender: string;
  email: string;
  /** 동의한 약관의 정수 ID 목록 (OpenAPI array<integer>). */
  terms: number[];
};

/** 기본정보2 (온보딩 2단계) — 생활패턴. */
export type ProfileLifestyleRequest = {
  lifestyles: string[];
};

/** 기본정보3 (온보딩 3단계) — 방 정보. (명세상 mounthRent 오타 유지) */
export type ProfileRoomInfoRequest = {
  type: string;
  minDeposit: string;
  maxDeposit: string;
  minMounthRent: string;
  maxMounthRent: string;
  comeEnableAt: string;
  region: string[];
  roomProfile: string[];
  deposit: string;
  mounthRent: string;
};

/** 기본정보 1,2,3 일괄. */
export type ProfileAllRequest = ProfileBasicRequest &
  ProfileLifestyleRequest &
  ProfileRoomInfoRequest;

/** 선호조건1 (Phase 2 Step A). */
export type PreferenceLifestyleRequest = {
  lifestyles: string[];
};

/** 선호조건2 (Phase 2 Step B). (명세상 값은 lifestyleId 형태) */
export type PreferenceConditionsRequest = {
  conditions: string[];
};

/** 선호조건 1,2 일괄. */
export type PreferenceAllRequest = PreferenceLifestyleRequest & PreferenceConditionsRequest;

/** 프로필 노출 상태 변경. */
export type VisibilityRequest = {
  status: string;
};

// ─── Response Types ───────────────────────────────────────────────────────────

/** GET /users/me/profile/all */
export type ProfileAllData = {
  lifestyles: LifestyleItem[];
  type: string;
  minDeposit: string;
  maxDeposit: string;
  minMounthRent: string;
  maxMounthRent: string;
  comeEnableAt: string;
  region: ProfileRegionItem[];
  roomProfile: RoomProfileItem[];
  deposit: string;
  mounthRent: string;
};

/** GET /users/me/preferences/all */
export type PreferenceAllData = {
  lifestyles: LifestyleItem[];
  conditions: ConditionItem[];
};

/** 내 룸메이트 게시글 리스트 항목. (createAt 오타 유지) */
export type MyBoardItem = {
  boardId: string;
  image: string;
  title: string;
  deposit: string;
  mounthRent: string;
  roomType: string;
  region: string;
  writer: string;
  createAt: string;
  viewer: string;
};

export type MyBoardListData = {
  boards: MyBoardItem[];
};

// ─── Mock ─────────────────────────────────────────────────────────────────────

const MOCK_LIFESTYLES: LifestyleItem[] = [
  {
    lifestyleId: 'ls-sleep',
    name: '취침 시간',
    value: '24:00',
    description: '보통 자정쯤 잠들어요',
    type: 'range',
  },
  {
    lifestyleId: 'ls-clean',
    name: '청결',
    value: '4',
    description: '깔끔한 편이에요',
    type: 'range',
  },
  {
    lifestyleId: 'ls-smoking',
    name: '흡연',
    value: 'no',
    description: '비흡연',
    type: 'single',
  },
];

const MOCK_CONDITIONS: ConditionItem[] = [
  { conditionsId: 'cond-quiet', name: '조용한 환경' },
  { conditionsId: 'cond-clean', name: '청결 중시' },
  { conditionsId: 'cond-no-smoke', name: '비흡연자' },
];

const MOCK_PROFILE_ALL: ProfileAllData = {
  lifestyles: MOCK_LIFESTYLES,
  type: 'two-room',
  minDeposit: '1000',
  maxDeposit: '2000',
  minMounthRent: '50',
  maxMounthRent: '90',
  comeEnableAt: '2026-06-01',
  region: [
    { regionId: 'seoul-mapo', region: '서울 마포구' },
    { regionId: 'seoul-seongdong', region: '서울 성동구' },
  ],
  roomProfile: [
    { roomProfileId: 'rp-1', roomProfileName: '풀옵션' },
    { roomProfileId: 'rp-2', roomProfileName: '주차 가능' },
  ],
  deposit: '1500',
  mounthRent: '80',
};

const MOCK_PREFERENCE_ALL: PreferenceAllData = {
  lifestyles: MOCK_LIFESTYLES,
  conditions: MOCK_CONDITIONS,
};

const MOCK_MY_BOARDS: MyBoardListData = {
  boards: [
    {
      boardId: 'p-1',
      image: 'https://picsum.photos/seed/p1/600/400',
      title: '망원 한강뷰 투룸 함께 살 룸메 구해요',
      deposit: '1500',
      mounthRent: '80',
      roomType: 'two-room',
      region: '서울 마포구',
      writer: '지민',
      createAt: '2026-05-10T09:00:00Z',
      viewer: '312',
    },
  ],
};

// ─── Client: 기본정보 저장 ──────────────────────────────────────────────────────

/** POST /users/me/profile/basic */
export function saveProfileBasic(body: ProfileBasicRequest): Promise<ApiResponse<UpdatedAt>> {
  if (USE_MOCK) return mockUpdatedAt();
  return request('POST', '/users/me/profile/basic', { body });
}

/** POST /users/me/profile/lifestyle */
export function saveProfileLifestyle(
  body: ProfileLifestyleRequest,
): Promise<ApiResponse<UpdatedAt>> {
  if (USE_MOCK) return mockUpdatedAt();
  return request('POST', '/users/me/profile/lifestyle', { body });
}

/** POST /users/me/profile/roominfo */
export function saveProfileRoomInfo(body: ProfileRoomInfoRequest): Promise<ApiResponse<UpdatedAt>> {
  if (USE_MOCK) return mockUpdatedAt();
  return request('POST', '/users/me/profile/roominfo', { body });
}

/** POST /users/me/profile/all */
export function saveProfileAll(body: ProfileAllRequest): Promise<ApiResponse<UpdatedAt>> {
  if (USE_MOCK) return mockUpdatedAt();
  return request('POST', '/users/me/profile/all', { body });
}

// ─── Client: 기본정보 수정 ──────────────────────────────────────────────────────

/** PUT /users/me/profile/basic */
export function updateProfileBasic(body: ProfileBasicRequest): Promise<ApiResponse<UpdatedAt>> {
  if (USE_MOCK) return mockUpdatedAt();
  return request('PUT', '/users/me/profile/basic', { body });
}

/** PUT /users/me/profile/lifestyle */
export function updateProfileLifestyle(
  body: ProfileLifestyleRequest,
): Promise<ApiResponse<UpdatedAt>> {
  if (USE_MOCK) return mockUpdatedAt();
  return request('PUT', '/users/me/profile/lifestyle', { body });
}

/** PUT /users/me/profile/roominfo */
export function updateProfileRoomInfo(
  body: ProfileRoomInfoRequest,
): Promise<ApiResponse<UpdatedAt>> {
  if (USE_MOCK) return mockUpdatedAt();
  return request('PUT', '/users/me/profile/roominfo', { body });
}

/** PUT /users/me/profile/all */
export function updateProfileAll(body: ProfileAllRequest): Promise<ApiResponse<UpdatedAt>> {
  if (USE_MOCK) return mockUpdatedAt();
  return request('PUT', '/users/me/profile/all', { body });
}

// ─── Client: 선호조건 저장/수정 ─────────────────────────────────────────────────

/** POST /users/me/preferences/lifestyle */
export function savePreferenceLifestyle(
  body: PreferenceLifestyleRequest,
): Promise<ApiResponse<UpdatedAt>> {
  if (USE_MOCK) return mockUpdatedAt();
  return request('POST', '/users/me/preferences/lifestyle', { body });
}

/** POST /users/me/preferences/conditions */
export function savePreferenceConditions(
  body: PreferenceConditionsRequest,
): Promise<ApiResponse<UpdatedAt>> {
  if (USE_MOCK) return mockUpdatedAt();
  return request('POST', '/users/me/preferences/conditions', { body });
}

/** POST /users/me/preferences/all */
export function savePreferenceAll(body: PreferenceAllRequest): Promise<ApiResponse<UpdatedAt>> {
  if (USE_MOCK) return mockUpdatedAt();
  return request('POST', '/users/me/preferences/all', { body });
}

/** PUT /users/me/preferences/lifestyle */
export function updatePreferenceLifestyle(
  body: PreferenceLifestyleRequest,
): Promise<ApiResponse<UpdatedAt>> {
  if (USE_MOCK) return mockUpdatedAt();
  return request('PUT', '/users/me/preferences/lifestyle', { body });
}

/** PUT /users/me/preferences/conditions */
export function updatePreferenceConditions(
  body: PreferenceConditionsRequest,
): Promise<ApiResponse<UpdatedAt>> {
  if (USE_MOCK) return mockUpdatedAt();
  return request('PUT', '/users/me/preferences/conditions', { body });
}

/** PUT /users/me/preferences/all */
export function updatePreferenceAll(body: PreferenceAllRequest): Promise<ApiResponse<UpdatedAt>> {
  if (USE_MOCK) return mockUpdatedAt();
  return request('PUT', '/users/me/preferences/all', { body });
}

// ─── Client: 조회 / 기타 ────────────────────────────────────────────────────────

/** GET /users/me/profile/all — 내 기본정보 조회 */
export function getProfileAll(): Promise<ApiResponse<ProfileAllData>> {
  if (USE_MOCK) return mockOk(MOCK_PROFILE_ALL);
  return request('GET', '/users/me/profile/all');
}

/** GET /users/me/preferences/all — 내 선호조건 조회 */
export function getPreferenceAll(): Promise<ApiResponse<PreferenceAllData>> {
  if (USE_MOCK) return mockOk(MOCK_PREFERENCE_ALL);
  return request('GET', '/users/me/preferences/all');
}

/** PATCH /users/me/visibility — 상태 변경(프로필 노출) */
export function updateVisibility(body: VisibilityRequest): Promise<ApiResponse<UpdatedAt>> {
  if (USE_MOCK) return mockUpdatedAt();
  return request('PATCH', '/users/me/visibility', { body });
}

/** GET /users/me/boards — 내 룸메이트 게시글 리스트 탐색 */
export function getMyBoards(params: PageParams = {}): Promise<ApiResponse<MyBoardListData>> {
  if (USE_MOCK) return mockOk(MOCK_MY_BOARDS);
  return request('GET', '/users/me/boards', { query: params });
}
