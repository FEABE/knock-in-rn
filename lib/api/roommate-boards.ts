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
import type { OpenApiSchema } from './openapi-types';

// ─── Request Types ────────────────────────────────────────────────────────────

/** 게시글 리스트 탐색 필터/쿼리. */
export type BoardListQuery = {
  region?: number;
  gender?: 'MALE' | 'FEMALE';
  minDeposit?: number;
  maxDeposit?: number;
  minMounthRent?: number;
  maxMounthRent?: number;
  type?: number;
  page?: number;
  size?: number;
  sort?: string;
};

/** 게시글 등록/수정 이미지 항목. (thumnail 오타 유지) */
export type BoardImageInput = OpenApiSchema<'org.example.knockin.dto.BoardDto$Request$ImageDto'>;

/** 게시글 등록/수정 본문. (mountlyRent 오타 유지) */
export type BoardWriteRequest = OpenApiSchema<'org.example.knockin.dto.BoardDto$Request'>;

export type BoardLikeRequest = Record<string, number>;

export type BoardReportRequest = OpenApiSchema<'org.example.knockin.dto.ReportDto$Request'>;

// ─── Response Types ───────────────────────────────────────────────────────────

/** 게시글 리스트 항목. */
type BoardListItemSwagger =
  OpenApiSchema<'org.example.knockin.dto.BoardListDto$Response$BoardItem'>;

export type BoardListItem = BoardListItemSwagger &
  Partial<{
    title: string;
    deposit: number;
    mounthRent: number;
    roomType: number | string;
    region: number | string;
    writer: string;
    createAt: string;
    viewer: number;
    isPopular: boolean;
    isNew: boolean;
    isLike: boolean;
  }>;

export type BoardListData = OpenApiSchema<'org.example.knockin.dto.BoardListDto$Response'> & {
  boards?: BoardListItem[];
};

/** 게시글 상세. */
export type BoardDetailData = OpenApiSchema<'org.example.knockin.dto.BoardDetailDto$Response'>;

/** 매칭 리스트 항목. */
export type MatchListItem = OpenApiSchema<'org.example.knockin.dto.MatchListDto$Response$Match'>;

export type MatchListData = OpenApiSchema<'org.example.knockin.dto.MatchListDto$Response'>;

/** 매칭 상세. */
export type MatchDetailData = OpenApiSchema<'org.example.knockin.dto.MatchDetailDto$Response'>;

// ─── Mock ─────────────────────────────────────────────────────────────────────

const MOCK_LIFESTYLES: LifestyleItem[] = [
  {
    lifestyleId: 1,
    name: '취침 시간',
    value: '24:00',
    description: '자정쯤 취침',
    type: 'SCALE',
  },
  {
    lifestyleId: 2,
    name: '청결',
    value: '4',
    description: '깔끔한 편',
    type: 'SCALE',
  },
];

const MOCK_PREFERENCES: PreferenceItem[] = [
  {
    preferencesId: 1,
    name: '조용함 선호',
    value: '5',
    description: '소음에 민감해요',
    type: 'SCALE',
  },
];

const MOCK_CONDITIONS: ConditionItem[] = [
  { conditionsId: 1, name: '청결 중시' },
  { conditionsId: 2, name: '조용한 환경' },
];

const MOCK_COMPATIBILITY: Compatibility = {
  score: 82,
  lifeStyleInfo: [
    { title: '생활 리듬', percent: '90' },
    { title: '청결', percent: '80' },
    { title: '소음', percent: '76' },
  ],
};

const MOCK_BOARDS: BoardListItem[] = [
  {
    boardId: 1,
    image: 'https://picsum.photos/seed/p1/600/400',
    title: '망원 한강뷰 투룸 함께 살 룸메 구해요',
    deposit: 1500,
    mounthRent: 80,
    roomType: 'two-room',
    region: '서울 마포구',
    writer: '지민',
    createAt: '2026-05-10T09:00:00Z',
    viewer: 312,
    isPopular: true,
    isNew: false,
    isLike: false,
  },
  {
    boardId: 2,
    image: 'https://picsum.photos/seed/p2/600/400',
    title: '강남 직주근접 오피스텔 룸셰어',
    deposit: 1000,
    mounthRent: 95,
    roomType: 'officetel',
    region: '서울 강남구',
    writer: '수아',
    createAt: '2026-05-08T09:00:00Z',
    viewer: 187,
    isPopular: false,
    isNew: false,
    isLike: true,
  },
];

const MOCK_BOARD_DETAIL: BoardDetailData = {
  boardId: 1,
  images: [
    'https://picsum.photos/seed/p1/600/400',
    'https://picsum.photos/seed/p1b/600/400',
    'https://picsum.photos/seed/p1c/600/400',
  ],
  title: '망원 한강뷰 투룸 함께 살 룸메 구해요',
  deposit: 1500,
  mounthRent: 80,
  roomType: 2,
  region: 3,
  createAt: '2026-05-10T09:00:00Z',
  viewer: 312,
  contents: '한강 도보 5분, 햇볕 잘 들어요. 깨끗이 쓰시는 분 환영합니다.',
  roomOption: [1, 2, 3],
  lifeStyles: MOCK_LIFESTYLES,
  preferences: MOCK_PREFERENCES,
  conditions: MOCK_CONDITIONS,
  writer: '지민',
  isAuthStudent: false,
  isAuthEmployee: true,
  compatibility: MOCK_COMPATIBILITY,
};

const MOCK_MATCHES: MatchListItem[] = [
  {
    userId: 2,
    name: '하준',
    isLike: false,
    roomProfileType: 'OFFER',
    deposit: 1200,
    mounthRent: 70,
    minDeposit: 1000,
    minMounthRent: 60,
    maxDeposit: 1500,
    maxMounthRent: 90,
    comeableAt: '2026-06-01T00:00:00Z',
    roomType: [1],
    region: 3,
    score: 90,
    lifeStyles: MOCK_LIFESTYLES,
    conditions: MOCK_CONDITIONS,
  },
  {
    userId: 3,
    name: '수아',
    isLike: true,
    roomProfileType: 'OFFER',
    deposit: 1000,
    mounthRent: 45,
    minDeposit: 500,
    minMounthRent: 30,
    maxDeposit: 1500,
    maxMounthRent: 60,
    comeableAt: '2026-07-01T00:00:00Z',
    roomType: [4],
    region: 16,
    score: 88,
    lifeStyles: MOCK_LIFESTYLES,
    conditions: MOCK_CONDITIONS,
  },
  {
    userId: 4,
    name: '도윤',
    isLike: false,
    roomProfileType: 'OFFER',
    deposit: 2000,
    mounthRent: 80,
    minDeposit: 1500,
    minMounthRent: 60,
    maxDeposit: 2500,
    maxMounthRent: 100,
    comeableAt: '2026-06-01T00:00:00Z',
    roomType: [2],
    region: 5,
    score: 76,
    lifeStyles: MOCK_LIFESTYLES,
    conditions: MOCK_CONDITIONS,
  },
];

const MOCK_MATCH_DETAIL: MatchDetailData = {
  minDeposit: 1000,
  maxDeposit: 1500,
  deposit: 1200,
  minMounthRent: 60,
  maxMounthRent: 90,
  mounthRent: 70,
  roomProfileType: 'OFFER',
  region: 5,
  roomOption: [1, 3],
  comeableAt: '2026-06-01T00:00:00Z',
  lifeStyles: MOCK_LIFESTYLES,
  preferences: MOCK_PREFERENCES,
  conditions: MOCK_CONDITIONS,
  name: '하준',
  isAuthStudent: true,
  isAuthEmployee: false,
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
  if (USE_MOCK) return mockOk({ ...MOCK_BOARD_DETAIL, boardId: Number(boardId) || 1 });
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
