/**
 * 도메인 3. 일반/메타데이터
 */
import { type ApiResponse, mockOk, request, USE_MOCK } from './client';
import type { OpenApiSchema } from './openapi-types';

// ─── Types ──────────────────────────────────────────────────────────────────

export type TermSummary = OpenApiSchema<'org.example.knockin.dto.TermsListDto$Response$TermsItem'>;

export type TermDetail = OpenApiSchema<'org.example.knockin.dto.TermsDetailDto$Response'>;

export type PopularKeyword =
  OpenApiSchema<'org.example.knockin.dto.PopularSearchDto$Response$RankItem'>;

/** 생활패턴 항목 (메타). details 의 values 는 명세 그대로 단수형. */
export type LifestylePattern =
  OpenApiSchema<'org.example.knockin.dto.MetaLifestylePatternsDto$Response$PatternItem'>;

export type RoomTypeMeta =
  OpenApiSchema<'org.example.knockin.dto.MetaRoomTypesDto$Response$RoomTypeItem'>;

/** 지역 (메타). 프로필 응답의 region 과 형태가 다름(명세 그대로). */
export type RegionMeta =
  OpenApiSchema<'org.example.knockin.dto.MetaRegionsDto$Response$RegionItem'>;

export type RoomAddOption =
  OpenApiSchema<'org.example.knockin.dto.MetaRoomAddOptionsDto$Response$RoomAddOptionItem'>;

export type TermsListData = OpenApiSchema<'org.example.knockin.dto.TermsListDto$Response'>;
export type PopularSearchData = OpenApiSchema<'org.example.knockin.dto.PopularSearchDto$Response'>;
export type LifestylePatternsData =
  OpenApiSchema<'org.example.knockin.dto.MetaLifestylePatternsDto$Response'>;
export type RoomTypesData = OpenApiSchema<'org.example.knockin.dto.MetaRoomTypesDto$Response'>;
export type RegionsData = OpenApiSchema<'org.example.knockin.dto.MetaRegionsDto$Response'>;
export type RoomAddOptionsData =
  OpenApiSchema<'org.example.knockin.dto.MetaRoomAddOptionsDto$Response'>;

// ─── Mock ─────────────────────────────────────────────────────────────────────

const MOCK_TERMS: TermSummary[] = [
  { id: 1, title: '서비스 이용약관 (필수)' },
  { id: 2, title: '개인정보 처리방침 (필수)' },
  { id: 3, title: '마케팅 정보 수신 (선택)' },
  { id: 4, title: '위치기반 서비스 (선택)' },
];

const MOCK_POPULAR: PopularKeyword[] = [
  { id: 1, keyword: '강남' },
  { id: 2, keyword: '셰어하우스' },
  { id: 3, keyword: '여성전용' },
  { id: 4, keyword: '반려동물' },
  { id: 5, keyword: '직주근접' },
];

const MOCK_LIFESTYLE_PATTERNS: LifestylePattern[] = [
  {
    id: 1,
    name: '취침 패턴',
    type: 'SCALE',
    details: [
      { values: 'early', description: '일찍 자요 (~23시)' },
      { values: 'late', description: '늦게 자요 (01시~)' },
    ],
  },
  {
    id: 2,
    name: '청결',
    type: 'SCALE',
    details: [
      { values: 'high', description: '매우 깔끔' },
      { values: 'mid', description: '보통' },
    ],
  },
];

const MOCK_ROOM_TYPES: RoomTypeMeta[] = [
  { id: 1, name: '원룸' },
  { id: 2, name: '투룸' },
  { id: 3, name: '쓰리룸 이상' },
  { id: 4, name: '오피스텔' },
  { id: 5, name: '셰어하우스' },
  { id: 6, name: '아파트' },
  { id: 7, name: '빌라' },
];

const MOCK_REGIONS: RegionMeta[] = [
  { id: 1, name: '서울', parentId: 0 },
  { id: 2, name: '마포구', parentId: 1 },
  { id: 3, name: '강남구', parentId: 1 },
  { id: 4, name: '성동구', parentId: 1 },
  { id: 5, name: '경기', parentId: 0 },
  { id: 6, name: '성남시', parentId: 5 },
];

const MOCK_ROOM_ADD_OPTIONS: RoomAddOption[] = [
  { id: 1, name: '주차 가능' },
  { id: 2, name: '풀옵션' },
  { id: 3, name: '엘리베이터' },
  { id: 4, name: '반려동물 가능' },
];

// ─── Client ───────────────────────────────────────────────────────────────────

/** GET /terms — 약관 목록 조회 */
export function getTerms(): Promise<ApiResponse<TermsListData>> {
  if (USE_MOCK) return mockOk({ terms: MOCK_TERMS });
  return request('GET', '/terms', { auth: false });
}

/** GET /terms/{termsId} — 약관 상세 조회 */
export function getTermDetail(termsId: string): Promise<ApiResponse<TermDetail>> {
  if (USE_MOCK) {
    return mockOk({
      id: Number(termsId) || 1,
      contents: '약관 본문 내용입니다. (mock)',
    });
  }
  return request('GET', `/terms/${termsId}`, { auth: false });
}

/** GET /search/popular — 인기검색어 조회 */
export function getPopularSearch(): Promise<ApiResponse<PopularSearchData>> {
  if (USE_MOCK) return mockOk({ rank: MOCK_POPULAR });
  return request('GET', '/search/popular', { auth: false });
}

/** GET /meta/lifestyle-patterns — 생활패턴 항목 조회 */
export function getLifestylePatterns(): Promise<ApiResponse<LifestylePatternsData>> {
  if (USE_MOCK) return mockOk({ patterns: MOCK_LIFESTYLE_PATTERNS });
  return request('GET', '/meta/lifestyle-patterns', { auth: false });
}

/** GET /meta/room-types — 방형태 목록 조회 */
export function getRoomTypes(): Promise<ApiResponse<RoomTypesData>> {
  if (USE_MOCK) return mockOk({ roomType: MOCK_ROOM_TYPES });
  return request('GET', '/meta/room-types', { auth: false });
}

/** GET /meta/regions — 지역 목록 조회 */
export function getRegions(): Promise<ApiResponse<RegionsData>> {
  if (USE_MOCK) return mockOk({ region: MOCK_REGIONS });
  return request('GET', '/meta/regions', { auth: false });
}

/** GET /meta/room-add-options — 방 추가 옵션 조회 */
export function getRoomAddOptions(): Promise<ApiResponse<RoomAddOptionsData>> {
  if (USE_MOCK) return mockOk({ roomAddOption: MOCK_ROOM_ADD_OPTIONS });
  return request('GET', '/meta/room-add-options', { auth: false });
}
