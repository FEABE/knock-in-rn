/**
 * 도메인 3. 일반/메타데이터
 */
import { Platform } from 'react-native';

import { type ApiResponse, type PageParams, mockOk, request, USE_MOCK } from './client';
import type { OpenApiSchema } from './openapi-types';

// ─── Types ──────────────────────────────────────────────────────────────────

export type TermSummary = OpenApiSchema<'org.example.knockin.dto.TermsListDto$Response$TermsItem'>;

export type TermDetail = OpenApiSchema<'org.example.knockin.dto.TermsDetailDto$Response'>;

export type PopularKeyword =
  OpenApiSchema<'org.example.knockin.dto.PopularSearchDto$Response$RankItem'>;

type LifestylePatternBase =
  OpenApiSchema<'org.example.knockin.dto.MetaLifestylePatternsDto$Response$PatternItem'>;

/** 생활패턴 상세 ID는 프로필 저장 시 서버에 그대로 보내야 한다. */
export type LifestylePattern = Omit<LifestylePatternBase, 'details'> & {
  details?: (NonNullable<LifestylePatternBase['details']>[number] & { id?: number })[];
};

export type RoomTypeMeta =
  OpenApiSchema<'org.example.knockin.dto.MetaRoomTypesDto$Response$RoomTypeItem'>;

/** 지역 (메타). 프로필 응답의 region 과 형태가 다름(명세 그대로). */
export type RegionMeta =
  OpenApiSchema<'org.example.knockin.dto.MetaRegionsDto$Response$RegionItem'>;

export type RoomAddOption =
  OpenApiSchema<'org.example.knockin.dto.MetaRoomAddOptionsDto$Response$RoomAddOptionItem'>;

export type AppVersionData = OpenApiSchema<'org.example.knockin.dto.AppVersionDto$Response'>;
export type AuthEmailListData = OpenApiSchema<'org.example.knockin.dto.AuthEmailListDto$Response'>;
export type FaqListData = OpenApiSchema<'org.example.knockin.dto.FaqListDto$Response'>;
export type FaqAllListData = OpenApiSchema<'org.example.knockin.dto.FaqAllListDto$Response'>;
export type FaqDetail = OpenApiSchema<'org.example.knockin.dto.FaqDto$Response'>;
export type TermsListData = OpenApiSchema<'org.example.knockin.dto.TermsListDto$Response'>;
export type PopularSearchData = OpenApiSchema<'org.example.knockin.dto.PopularSearchDto$Response'>;
type LifestylePatternsDataBase =
  OpenApiSchema<'org.example.knockin.dto.MetaLifestylePatternsDto$Response'>;
export type LifestylePatternsData = Omit<LifestylePatternsDataBase, 'patterns'> & {
  patterns?: LifestylePattern[];
};
export type RoomTypesData = OpenApiSchema<'org.example.knockin.dto.MetaRoomTypesDto$Response'>;
export type RegionsData = OpenApiSchema<'org.example.knockin.dto.MetaRegionsDto$Response'>;
export type RoomAddOptionsData =
  OpenApiSchema<'org.example.knockin.dto.MetaRoomAddOptionsDto$Response'>;

// ─── Mock ─────────────────────────────────────────────────────────────────────

const MOCK_TERMS: TermSummary[] = [
  { id: 1, title: '서비스 이용약관' },
  { id: 4, title: '개인정보 처리방침' },
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
    name: '청소 깔끔도',
    type: 'SCALE',
    details: [
      { id: 1, values: '1', description: '자주 안함' },
      { id: 2, values: '2', description: '종종 안함' },
      { id: 3, values: '3', description: '보통' },
      { id: 4, values: '4', description: '깔끔함' },
      { id: 5, values: '5', description: '매우 깔끔함' },
    ],
  },
  {
    id: 2,
    name: '흡연 여부',
    type: 'SINGLE_CHOICE',
    details: [
      { id: 6, values: '1', description: '흡연자' },
      { id: 7, values: '2', description: '비흡연자' },
    ],
  },
  {
    id: 3,
    name: 'MBTI 성향',
    type: 'SINGLE_CHOICE',
    details: [
      { id: 8, values: '1', description: '내향형' },
      { id: 9, values: '2', description: '외향형' },
    ],
  },
];

const MOCK_ROOM_TYPES: RoomTypeMeta[] = [
  { id: 1, name: '원룸' },
  { id: 2, name: '투룸' },
  { id: 3, name: '쓰리룸+' },
  { id: 4, name: '오피스텔' },
  { id: 5, name: '아파트' },
];

const MOCK_REGIONS: RegionMeta[] = [
  { id: 1, name: '서울특별시' },
  { id: 2, name: '경기도' },
  { id: 3, name: '강남구', parentId: 1 },
  { id: 4, name: '마포구', parentId: 1 },
  { id: 5, name: '송파구', parentId: 1 },
  { id: 6, name: '서초구', parentId: 1 },
  { id: 7, name: '성동구', parentId: 1 },
  { id: 8, name: '종로구', parentId: 1 },
  { id: 9, name: '영등포구', parentId: 1 },
  { id: 10, name: '용산구', parentId: 1 },
  { id: 11, name: '수원시 영통구', parentId: 2 },
  { id: 12, name: '성남시 분당구', parentId: 2 },
  { id: 13, name: '고양시 일산동구', parentId: 2 },
  { id: 14, name: '용인시 수지구', parentId: 2 },
  { id: 15, name: '안양시 동안구', parentId: 2 },
  { id: 16, name: '부천시', parentId: 2 },
  { id: 17, name: '남양주시', parentId: 2 },
  { id: 18, name: '화성시', parentId: 2 },
  { id: 19, name: '역삼동', parentId: 3 },
  { id: 20, name: '삼성동', parentId: 3 },
  { id: 21, name: '청담동', parentId: 3 },
  { id: 22, name: '논현동', parentId: 3 },
  { id: 23, name: '서교동', parentId: 4 },
  { id: 24, name: '합정동', parentId: 4 },
  { id: 25, name: '망원동', parentId: 4 },
  { id: 26, name: '연남동', parentId: 4 },
];

const MOCK_ROOM_ADD_OPTIONS: RoomAddOption[] = [
  { id: 1, name: '주차 가능' },
  { id: 2, name: '풀옵션' },
  { id: 3, name: '엘리베이터' },
  { id: 4, name: '반려동물 가능' },
];

const MOCK_FAQS: NonNullable<FaqAllListData['faqInfoList']> = [
  {
    id: 1,
    title: '학교/회사 이메일 인증은 얼마나 걸리나요?',
    contents: '인증 코드를 입력하면 즉시 접수되고, 승인 상태는 인증 화면에서 확인할 수 있어요.',
  },
  {
    id: 2,
    title: '룸메이트 매칭 요청은 어디서 확인하나요?',
    contents: '채팅방과 룸메이트 요청 목록에서 확인할 수 있어요.',
  },
];

const MOCK_AUTH_EMAILS: NonNullable<AuthEmailListData['authEmailInfoList']> = [
  { id: 1, domain: 'ac.kr', name: '학교 이메일', type: 'STUDENT' },
  { id: 2, domain: 'company.com', name: '회사 이메일', type: 'COMPANY' },
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

/** GET /meta/app-version/{platform} — 현재 플랫폼 앱버전 조회 */
export function getAppVersion(): Promise<ApiResponse<AppVersionData>> {
  if (USE_MOCK) return mockOk({ id: 1, version: '1.0.0' });
  if (Platform.OS === 'ios') {
    return request('GET', '/meta/app-version/ios', { auth: false });
  }
  return request('GET', '/meta/app-version/android', { auth: false });
}

/** GET /meta/auth-email — 인증 이메일 목록 조회 */
export function getAuthEmails(): Promise<ApiResponse<AuthEmailListData>> {
  if (USE_MOCK) return mockOk({ authEmailInfoList: MOCK_AUTH_EMAILS });
  return request('GET', '/meta/auth-email', { auth: false });
}

/** GET /meta/faq — 자주묻는 질문 목록 조회 */
export function getFaqs(params: PageParams = {}): Promise<ApiResponse<FaqListData>> {
  if (USE_MOCK) {
    return mockOk({
      faqInfoList: MOCK_FAQS.map(({ id, title, sort }) => ({ id, title, sort })),
    });
  }
  return request('GET', '/meta/faq', {
    auth: false,
    query: { page: 0, size: 50, ...params },
  });
}

/** GET /meta/faq/{id} — 자주묻는 질문 상세 조회 */
export function getFaqDetail(id: string): Promise<ApiResponse<FaqDetail>> {
  if (USE_MOCK) {
    const faq = MOCK_FAQS.find((item) => String(item.id ?? '') === id) ?? MOCK_FAQS[0];
    return mockOk(faq);
  }
  return request('GET', `/meta/faq/${id}`, { auth: false });
}

/** GET /meta/faqAll — 자주묻는 질문 목록,상세 조회 */
export function getFaqAll(params: PageParams = {}): Promise<ApiResponse<FaqAllListData>> {
  if (USE_MOCK) return mockOk({ faqInfoList: MOCK_FAQS });
  return request('GET', '/meta/faqAll', {
    auth: false,
    query: { page: 0, size: 50, ...params },
  });
}
