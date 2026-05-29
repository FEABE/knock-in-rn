/**
 * 도메인 4. 룸메이트 게시물/매칭
 */
import {
  type ApiResponse,
  type UpdatedAt,
  mockOk,
  mockUpdatedAt,
  request,
  USE_MOCK,
} from './client';
import type { Compatibility, ConditionItem, LifestyleItem, PreferenceItem } from './entities';

// ─── Request Types ────────────────────────────────────────────────────────────

/** 게시글 리스트 탐색 필터/쿼리. */
export type BoardListQuery = {
  region?: number | string;
  gender?: number | string;
  minDeposit?: number;
  maxDeposit?: number;
  minMounthRent?: number;
  maxMounthRent?: number;
  type?: number | string;
  page?: number;
  size?: number;
  sort?: string;
};

/** 게시글 등록/수정 이미지 항목. (thumnail 오타 유지) */
export type BoardImageInput = {
  image: string;
  thumnail: boolean;
};

/** 게시글 등록/수정 본문. (mountlyRent 오타 유지) */
export type BoardWriteRequest = {
  title: string;
  contents: string;
  deposit: string;
  mountlyRent: string;
  managementCost: string;
  roomType: string;
  region: string;
  comeableAt: string;
  images: BoardImageInput[];
};

export type BoardLikeRequest = {
  boardId: string;
};

export type BoardReportRequest = {
  contents: string;
};

// ─── Response Types ───────────────────────────────────────────────────────────

/** 게시글 리스트 항목. */
export type BoardListItem = {
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
  isPopular: string;
  isNew: string;
  isLike: string;
};

export type BoardListData = {
  boards: BoardListItem[];
};

/** 게시글 상세. */
export type BoardDetailData = {
  boardId: string;
  images: string[];
  title: string;
  deposit: string;
  mounthRent: string;
  roomType: string;
  region: string;
  createAt: string;
  viewer: string;
  contents: string;
  roomOption: string[];
  lifeStyles: LifestyleItem[];
  preferences: PreferenceItem[];
  conditions: ConditionItem[];
  writer: string;
  isAuthStudent: string;
  isAuthEmployee: string;
  compatibility: Compatibility;
};

/** 매칭 리스트 항목. */
export type MatchListItem = {
  userId: string;
  name: string;
  isLike: string;
  roomProfileType: string;
  deposit: string;
  mounthRent: string;
  minDeposit: string;
  minMounthRent: string;
  maxDeposit: string;
  maxMounthRent: string;
  comeableAt: string;
  roomType: string[];
  region: string;
  score: string;
  lifeStyles: LifestyleItem[];
  conditions: ConditionItem[];
};

export type MatchListData = {
  matches: MatchListItem[];
};

/** 매칭 상세. */
export type MatchDetailData = {
  minDeposit: string;
  maxDeposit: string;
  deposit: string;
  minMounthRent: string;
  maxMounthRent: string;
  mounthRent: string;
  roomProfileType: string;
  region: string;
  roomOption: string[];
  comeableAt: string;
  lifeStyles: LifestyleItem[];
  preferences: PreferenceItem[];
  conditions: ConditionItem[];
  name: string;
  isAuthStudent: string;
  isAuthEmployee: string;
  compatibility: Compatibility;
};

// ─── Mock ─────────────────────────────────────────────────────────────────────

const MOCK_LIFESTYLES: LifestyleItem[] = [
  {
    lifestyleId: 'ls-sleep',
    name: '취침 시간',
    value: '24:00',
    description: '자정쯤 취침',
    type: 'range',
  },
  {
    lifestyleId: 'ls-clean',
    name: '청결',
    value: '4',
    description: '깔끔한 편',
    type: 'range',
  },
];

const MOCK_PREFERENCES: PreferenceItem[] = [
  {
    preferencesId: 'pf-quiet',
    name: '조용함 선호',
    value: '5',
    description: '소음에 민감해요',
    type: 'range',
  },
];

const MOCK_CONDITIONS: ConditionItem[] = [
  { conditionsId: 'cond-clean', name: '청결 중시' },
  { conditionsId: 'cond-quiet', name: '조용한 환경' },
];

const MOCK_COMPATIBILITY: Compatibility = {
  score: '82',
  lifeStyleInfo: [
    { title: '생활 리듬', percent: '90' },
    { title: '청결', percent: '80' },
    { title: '소음', percent: '76' },
  ],
};

const MOCK_BOARDS: BoardListItem[] = [
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
    isPopular: 'true',
    isNew: 'false',
    isLike: 'false',
  },
  {
    boardId: 'p-2',
    image: 'https://picsum.photos/seed/p2/600/400',
    title: '강남 직주근접 오피스텔 룸셰어',
    deposit: '1000',
    mounthRent: '95',
    roomType: 'officetel',
    region: '서울 강남구',
    writer: '수아',
    createAt: '2026-05-08T09:00:00Z',
    viewer: '187',
    isPopular: 'false',
    isNew: 'false',
    isLike: 'true',
  },
];

const MOCK_BOARD_DETAIL: BoardDetailData = {
  boardId: 'p-1',
  images: [
    'https://picsum.photos/seed/p1/600/400',
    'https://picsum.photos/seed/p1b/600/400',
    'https://picsum.photos/seed/p1c/600/400',
  ],
  title: '망원 한강뷰 투룸 함께 살 룸메 구해요',
  deposit: '1500',
  mounthRent: '80',
  roomType: 'two-room',
  region: '서울 마포구',
  createAt: '2026-05-10T09:00:00Z',
  viewer: '312',
  contents: '한강 도보 5분, 햇볕 잘 들어요. 깨끗이 쓰시는 분 환영합니다.',
  roomOption: ['풀옵션', '주차 가능', '엘리베이터'],
  lifeStyles: MOCK_LIFESTYLES,
  preferences: MOCK_PREFERENCES,
  conditions: MOCK_CONDITIONS,
  writer: '지민',
  isAuthStudent: 'false',
  isAuthEmployee: 'true',
  compatibility: MOCK_COMPATIBILITY,
};

const MOCK_MATCHES: MatchListItem[] = [
  {
    userId: 'u-2',
    name: '하준',
    isLike: 'false',
    roomProfileType: 'two-room',
    deposit: '1200',
    mounthRent: '70',
    minDeposit: '1000',
    minMounthRent: '60',
    maxDeposit: '1500',
    maxMounthRent: '90',
    comeableAt: '즉시',
    roomType: ['원룸'],
    region: '마포구 합정동',
    score: '90',
    lifeStyles: MOCK_LIFESTYLES,
    conditions: MOCK_CONDITIONS,
  },
  {
    userId: 'u-3',
    name: '수아',
    isLike: 'true',
    roomProfileType: 'officetel',
    deposit: '1000',
    mounthRent: '45',
    minDeposit: '500',
    minMounthRent: '30',
    maxDeposit: '1500',
    maxMounthRent: '60',
    comeableAt: '1개월 후',
    roomType: ['오피스텔'],
    region: '서대문구 신촌동',
    score: '88',
    lifeStyles: MOCK_LIFESTYLES,
    conditions: MOCK_CONDITIONS,
  },
  {
    userId: 'u-4',
    name: '도윤',
    isLike: 'false',
    roomProfileType: 'two-room',
    deposit: '2000',
    mounthRent: '80',
    minDeposit: '1500',
    minMounthRent: '60',
    maxDeposit: '2500',
    maxMounthRent: '100',
    comeableAt: '즉시',
    roomType: ['투룸'],
    region: '성동구 성수동',
    score: '76',
    lifeStyles: MOCK_LIFESTYLES,
    conditions: MOCK_CONDITIONS,
  },
];

const MOCK_MATCH_DETAIL: MatchDetailData = {
  minDeposit: '1000',
  maxDeposit: '1500',
  deposit: '1200',
  minMounthRent: '60',
  maxMounthRent: '90',
  mounthRent: '70',
  roomProfileType: 'two-room',
  region: '서울 성동구',
  roomOption: ['풀옵션', '엘리베이터'],
  comeableAt: '2026-06-01',
  lifeStyles: MOCK_LIFESTYLES,
  preferences: MOCK_PREFERENCES,
  conditions: MOCK_CONDITIONS,
  name: '하준',
  isAuthStudent: 'true',
  isAuthEmployee: 'false',
  compatibility: MOCK_COMPATIBILITY,
};

// ─── Client ───────────────────────────────────────────────────────────────────

/** GET /roommate/boards — 게시글 리스트 탐색 */
export function getRoommateBoards(query: BoardListQuery = {}): Promise<ApiResponse<BoardListData>> {
  if (USE_MOCK) return mockOk({ boards: MOCK_BOARDS });
  return request('GET', '/roommate/boards', { query });
}

/** GET /roommate/boards/{boardId} — 게시글 상세 조회 */
export function getRoommateBoardDetail(boardId: string): Promise<ApiResponse<BoardDetailData>> {
  if (USE_MOCK) return mockOk({ ...MOCK_BOARD_DETAIL, boardId });
  return request('GET', `/roommate/boards/${boardId}`);
}

/** GET /roommate/matches — 매칭 리스트 탐색 */
export function getRoommateMatches(): Promise<ApiResponse<MatchListData>> {
  if (USE_MOCK) return mockOk({ matches: MOCK_MATCHES });
  return request('GET', '/roommate/matches');
}

/** GET /roommate/matches/{userId} — 매칭 상세 조회 */
export function getRoommateMatchDetail(userId: string): Promise<ApiResponse<MatchDetailData>> {
  if (USE_MOCK) return mockOk(MOCK_MATCH_DETAIL);
  return request('GET', `/roommate/matches/${userId}`);
}

/** POST /roommate/boards/likes — 게시글 관심(찜) 등록/취소 */
export function toggleBoardLike(body: BoardLikeRequest): Promise<ApiResponse<UpdatedAt>> {
  if (USE_MOCK) return mockUpdatedAt();
  return request('POST', '/roommate/boards/likes', { body });
}

/** POST /roommate/boards — 게시글 등록 */
export function createRoommateBoard(body: BoardWriteRequest): Promise<ApiResponse<UpdatedAt>> {
  if (USE_MOCK) return mockUpdatedAt();
  return request('POST', '/roommate/boards', { body });
}

/** PUT /roommate/boards/{boardId} — 게시글 수정 */
export function updateRoommateBoard(
  boardId: string,
  body: BoardWriteRequest,
): Promise<ApiResponse<UpdatedAt>> {
  if (USE_MOCK) return mockUpdatedAt();
  return request('PUT', `/roommate/boards/${boardId}`, { body });
}

/** DELETE /roommate/boards/{boardId} — 게시글 삭제 */
export function deleteRoommateBoard(boardId: string): Promise<ApiResponse<UpdatedAt>> {
  if (USE_MOCK) return mockUpdatedAt();
  return request('DELETE', `/roommate/boards/${boardId}`);
}

/** POST /roommate/boards/{boardId}/reports — 방 게시글 신고 */
export function reportRoommateBoard(
  boardId: string,
  body: BoardReportRequest,
): Promise<ApiResponse<UpdatedAt>> {
  if (USE_MOCK) return mockUpdatedAt();
  return request('POST', `/roommate/boards/${boardId}/reports`, { body });
}
