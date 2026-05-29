/**
 * 도메인 3. 일반/메타데이터
 */
import { type ApiResponse, mockOk, request, USE_MOCK } from './client';

// ─── Types ──────────────────────────────────────────────────────────────────

export type TermSummary = {
  id: string;
  title: string;
};

export type TermDetail = {
  id: string;
  contents: string;
};

export type PopularKeyword = {
  id: string;
  keyword: string;
};

/** 생활패턴 항목 (메타). details 의 values 는 명세 그대로 단수형. */
export type LifestylePattern = {
  id: string;
  name: string;
  details: {
    values: string;
    description: string;
  }[];
};

export type RoomTypeMeta = {
  id: string;
  name: string;
};

/** 지역 (메타). 프로필 응답의 region 과 형태가 다름(명세 그대로). */
export type RegionMeta = {
  id: string;
  name: string;
  parentId: string;
};

export type RoomAddOption = {
  id: string;
  name: string;
};

export type TermsListData = { terms: TermSummary[] };
export type PopularSearchData = { rank: PopularKeyword[] };
export type LifestylePatternsData = { patterns: LifestylePattern[] };
export type RoomTypesData = { roomType: RoomTypeMeta[] };
export type RegionsData = { region: RegionMeta[] };
export type RoomAddOptionsData = { roomAddOption: RoomAddOption[] };

// ─── Mock ─────────────────────────────────────────────────────────────────────

const MOCK_TERMS: TermSummary[] = [
  { id: 'term-tos', title: '서비스 이용약관 (필수)' },
  { id: 'term-privacy', title: '개인정보 처리방침 (필수)' },
  { id: 'term-marketing', title: '마케팅 정보 수신 (선택)' },
  { id: 'term-location', title: '위치기반 서비스 (선택)' },
];

const MOCK_POPULAR: PopularKeyword[] = [
  { id: 'k-1', keyword: '강남' },
  { id: 'k-2', keyword: '셰어하우스' },
  { id: 'k-3', keyword: '여성전용' },
  { id: 'k-4', keyword: '반려동물' },
  { id: 'k-5', keyword: '직주근접' },
];

const MOCK_LIFESTYLE_PATTERNS: LifestylePattern[] = [
  {
    id: 'lp-sleep',
    name: '취침 패턴',
    details: [
      { values: 'early', description: '일찍 자요 (~23시)' },
      { values: 'late', description: '늦게 자요 (01시~)' },
    ],
  },
  {
    id: 'lp-clean',
    name: '청결',
    details: [
      { values: 'high', description: '매우 깔끔' },
      { values: 'mid', description: '보통' },
    ],
  },
];

const MOCK_ROOM_TYPES: RoomTypeMeta[] = [
  { id: 'one-room', name: '원룸' },
  { id: 'two-room', name: '투룸' },
  { id: 'three-room+', name: '쓰리룸 이상' },
  { id: 'officetel', name: '오피스텔' },
  { id: 'share-house', name: '셰어하우스' },
  { id: 'apt', name: '아파트' },
  { id: 'villa', name: '빌라' },
];

const MOCK_REGIONS: RegionMeta[] = [
  { id: 'seoul', name: '서울', parentId: '' },
  { id: 'seoul-mapo', name: '마포구', parentId: 'seoul' },
  { id: 'seoul-gangnam', name: '강남구', parentId: 'seoul' },
  { id: 'seoul-seongdong', name: '성동구', parentId: 'seoul' },
  { id: 'gg', name: '경기', parentId: '' },
  { id: 'gg-seongnam', name: '성남시', parentId: 'gg' },
];

const MOCK_ROOM_ADD_OPTIONS: RoomAddOption[] = [
  { id: 'opt-parking', name: '주차 가능' },
  { id: 'opt-full', name: '풀옵션' },
  { id: 'opt-elevator', name: '엘리베이터' },
  { id: 'opt-pet', name: '반려동물 가능' },
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
      id: termsId,
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
