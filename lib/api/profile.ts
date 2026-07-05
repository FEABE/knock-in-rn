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
import type { ConditionItem, LifestyleItem } from './entities';
import type { OpenApiSchema } from './openapi-types';

// ─── Request Types ────────────────────────────────────────────────────────────

/** 기본정보1 (온보딩 1단계). */
export type ProfileBasicRequest =
  OpenApiSchema<'org.example.knockin.dto.SaveProfileBasicDto$Request'>;
export type ProfileBasicUpdateRequest =
  OpenApiSchema<'org.example.knockin.dto.ModifyProfileBasicDto$Request'>;

/** 기본정보2 (온보딩 2단계) — 생활패턴. */
export type ProfileLifestyleRequest =
  OpenApiSchema<'org.example.knockin.dto.SaveProfileLifeStyleDto$Request'>;
export type ProfileLifestyleUpdateRequest =
  OpenApiSchema<'org.example.knockin.dto.ModifyProfileLifeStyleDto$Request'>;

/** 기본정보3 (온보딩 3단계) — 방 정보. (명세상 mounthRent 오타 유지) */
export type ProfileRoomInfoRequest =
  OpenApiSchema<'org.example.knockin.dto.SaveProfileRoomInfoDto$Request'>;
export type ProfileRoomInfoUpdateRequest =
  OpenApiSchema<'org.example.knockin.dto.ModifyProfileRoomInfoDto$Request'>;

/** 기본정보 1,2,3 일괄. */
export type ProfileAllRequest = OpenApiSchema<'org.example.knockin.dto.SaveProfileAllDto$Request'>;
export type ProfileAllUpdateRequest =
  OpenApiSchema<'org.example.knockin.dto.ModifyProfileAllDto$Request'>;

type ComeableAtNegotiableRequest = {
  comeableAtNegotiable?: boolean;
  isComeableAtNegotiable?: boolean;
};

export type ProfileRoomInfoRuntimeRequest = ProfileRoomInfoRequest &
  Required<ComeableAtNegotiableRequest>;

export type ProfileAllRuntimeRequest = ProfileAllRequest & Required<ComeableAtNegotiableRequest>;

/** 선호조건1 (Phase 2 Step A). */
export type PreferenceLifestyleRequest =
  OpenApiSchema<'org.example.knockin.dto.SavePreferencesLifeStyleDto$Request'>;
export type PreferenceLifestyleUpdateRequest =
  OpenApiSchema<'org.example.knockin.dto.ModifyPreferencesLifeStyleDto$Request'>;

/** 선호조건2 (Phase 2 Step B). (명세상 값은 lifestyleId 형태) */
export type PreferenceConditionsRequest =
  OpenApiSchema<'org.example.knockin.dto.SavePreferencesConditionsDto$Request'>;
export type PreferenceConditionsUpdateRequest =
  OpenApiSchema<'org.example.knockin.dto.ModifyPreferencesConditionsDto$Request'>;

/** 선호조건 1,2 일괄. */
export type PreferenceAllRequest =
  OpenApiSchema<'org.example.knockin.dto.SavePreferencesAllDto$Request'>;
export type PreferenceAllUpdateRequest =
  OpenApiSchema<'org.example.knockin.dto.ModifyPreferencesAllDto$Request'>;

/** 프로필 노출 상태 변경. */
export type VisibilityRequest =
  OpenApiSchema<'org.example.knockin.dto.ProfileVisibilityDto$Request'>;

// ─── Response Types ───────────────────────────────────────────────────────────

/** GET /users/me/profile/all */
export type ProfileAllData = OpenApiSchema<'org.example.knockin.dto.MyProfileAllDto$Response'>;

/** GET /users/me/preferences/all */
export type PreferenceAllData =
  OpenApiSchema<'org.example.knockin.dto.MyPreferencesAllDto$Response'>;

/** 내 룸메이트 게시글 리스트 항목. (createAt 오타 유지) */
export type MyBoardItem =
  OpenApiSchema<'org.example.knockin.dto.MyBoardListDto$Response$BoardItem'>;

export type MyBoardListData = OpenApiSchema<'org.example.knockin.dto.MyBoardListDto$Response'>;

export function withComeableAtNegotiable<T extends object>(
  body: T,
): T & Required<ComeableAtNegotiableRequest> {
  const current = body as ComeableAtNegotiableRequest;
  const value = current.comeableAtNegotiable ?? current.isComeableAtNegotiable ?? false;
  return {
    ...body,
    // Swagger exposes comeableAtNegotiable, while the current backend runtime also expects isComeableAtNegotiable.
    comeableAtNegotiable: value,
    isComeableAtNegotiable: value,
  };
}

// ─── Mock ─────────────────────────────────────────────────────────────────────

const MOCK_LIFESTYLES: LifestyleItem[] = [
  {
    lifestyleId: 1,
    name: '취침 시간',
    value: '24:00',
    description: '보통 자정쯤 잠들어요',
    type: 'SCALE',
  },
  {
    lifestyleId: 2,
    name: '청결',
    value: '4',
    description: '깔끔한 편이에요',
    type: 'SCALE',
  },
  {
    lifestyleId: 3,
    name: '흡연',
    value: 'no',
    description: '비흡연',
    type: 'SINGLE_CHOICE',
  },
];

const MOCK_CONDITIONS: ConditionItem[] = [
  { conditionsId: 1, name: '조용한 환경' },
  { conditionsId: 2, name: '청결 중시' },
  { conditionsId: 3, name: '비흡연자' },
];

const MOCK_PROFILE_ALL: ProfileAllData = {
  lifestyles: MOCK_LIFESTYLES,
  type: 'OFFER',
  minDeposit: 1000,
  maxDeposit: 2000,
  minMounthRent: 50,
  maxMounthRent: 90,
  comeEnableAt: '2026-06-01T00:00:00Z',
  region: [
    { regionId: 3, region: '서울 마포구' },
    { regionId: 5, region: '서울 성동구' },
  ],
  roomProfile: [
    { roomProfileId: 1, roomProfileName: '풀옵션' },
    { roomProfileId: 2, roomProfileName: '주차 가능' },
  ],
  deposit: 1500,
  mounthRent: 80,
};

const MOCK_PREFERENCE_ALL: PreferenceAllData = {
  lifestyles: MOCK_LIFESTYLES,
  conditions: MOCK_CONDITIONS,
};

const MOCK_MY_BOARDS: MyBoardListData = {
  boards: [
    {
      boardId: 1,
      image: 'https://picsum.photos/seed/p1/600/400',
      title: '망원 한강뷰 투룸 함께 살 룸메 구해요',
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
export function updateProfileBasic(
  body: ProfileBasicUpdateRequest,
): Promise<ApiResponse<UpdatedAt>> {
  if (USE_MOCK) return mockUpdatedAt();
  return request('PUT', '/users/me/profile/basic', { body });
}

/** PUT /users/me/profile/lifestyle */
export function updateProfileLifestyle(
  body: ProfileLifestyleUpdateRequest,
): Promise<ApiResponse<UpdatedAt>> {
  if (USE_MOCK) return mockUpdatedAt();
  return request('PUT', '/users/me/profile/lifestyle', { body });
}

/** PUT /users/me/profile/roominfo */
export function updateProfileRoomInfo(
  body: ProfileRoomInfoUpdateRequest,
): Promise<ApiResponse<UpdatedAt>> {
  if (USE_MOCK) return mockUpdatedAt();
  return request('PUT', '/users/me/profile/roominfo', { body });
}

/** PUT /users/me/profile/all */
export function updateProfileAll(body: ProfileAllUpdateRequest): Promise<ApiResponse<UpdatedAt>> {
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
  body: PreferenceLifestyleUpdateRequest,
): Promise<ApiResponse<UpdatedAt>> {
  if (USE_MOCK) return mockUpdatedAt();
  return request('PUT', '/users/me/preferences/lifestyle', { body });
}

/** PUT /users/me/preferences/conditions */
export function updatePreferenceConditions(
  body: PreferenceConditionsUpdateRequest,
): Promise<ApiResponse<UpdatedAt>> {
  if (USE_MOCK) return mockUpdatedAt();
  return request('PUT', '/users/me/preferences/conditions', { body });
}

/** PUT /users/me/preferences/all */
export function updatePreferenceAll(
  body: PreferenceAllUpdateRequest,
): Promise<ApiResponse<UpdatedAt>> {
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
  return request('GET', '/users/me/boards', { query: { page: 0, size: 20, ...params } });
}
