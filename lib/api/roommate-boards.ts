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
  regionIds?: number[];
  gender?: 'MALE' | 'FEMALE';
  minDeposit?: number;
  maxDeposit?: number;
  minMounthRent?: number;
  maxMounthRent?: number;
  roomTypeIds?: number[];
  page?: number;
  size?: number;
  sort?: string;
};

/** 게시글 등록/수정 이미지 항목. (서버는 fileIndex/thumbnail, 기존 화면은 image/thumnail 사용) */
export type BoardImageInput = Partial<OpenApiSchema<'BoardFileRequest'>> &
  Partial<{
    image: string;
    uri: string;
    name: string;
    type: string;
    thumnail: boolean;
  }>;

type BoardSaveRequest = Omit<OpenApiSchema<'BoardSaveRequest'>, 'images'>;
type BoardModifyRequest = Omit<
  OpenApiSchema<'org.example.knockin.dto.BoardModifyDto$Request'>,
  'existingImages' | 'newImages'
>;

/** 게시글 등록/수정 본문. 기존 화면의 오타 필드도 호환한다. */
export type BoardWriteRequest = Partial<BoardSaveRequest & BoardModifyRequest> & {
  title: string;
  contents: string;
  deposit: number;
  managementCost: number;
  mountlyRent?: number;
  monthlyRent?: number;
  roomType?: number;
  roomTypeId?: number;
  region?: number;
  regionId?: number;
  comeableAt?: string;
  comeableDate?: string;
  roomOption?: number[];
  images?: BoardImageInput[];
  existingImages?: OpenApiSchema<'org.example.knockin.dto.BoardModifyDto$Request$ExistingFileDto'>[];
  newImages?: OpenApiSchema<'org.example.knockin.dto.BoardModifyDto$Request$NewFileDto'>[];
};

export type BoardReportRequest = OpenApiSchema<'org.example.knockin.dto.ReportDto$Request'>;
export type MatchReportRequest = OpenApiSchema<'org.example.knockin.dto.MemberReportDto$Request'>;

// ─── Response Types ───────────────────────────────────────────────────────────

/** 게시글 리스트 항목. */
type BoardListItemSwagger = Omit<
  OpenApiSchema<'org.example.knockin.dto.BoardListDto$Response'>,
  'roomTypes' | 'badges'
> & {
  roomTypes?: string | string[];
  badges?: string | string[];
};

export type BoardListItem = BoardListItemSwagger &
  Partial<{
    boardId: number;
    image: string;
    title: string;
    deposit: number;
    mounthRent: number;
    monthlyRent: number;
    roomType: number | string;
    region: number | string;
    writer: string;
    createAt: string;
    createdAt: string;
    viewer: number;
    isPopular: boolean;
    isNew: boolean;
    isLike: boolean;
  }>;

type BoardListPageData =
  OpenApiSchema<'org.springframework.data.domain.PageOrg.example.knockin.dto.BoardListDto$Response'>;

export type BoardListData = Partial<BoardListPageData> & {
  boards?: BoardListItem[];
};

/** 게시글 상세. */
type BoardDetailSwagger = Omit<
  OpenApiSchema<'org.example.knockin.dto.BoardDetailDto$Response'>,
  'images'
>;

export type BoardDetailData = BoardDetailSwagger &
  Partial<{
    images: (
      | OpenApiSchema<'org.example.knockin.dto.BoardDetailDto$Response$FileDetailDto'>
      | string
    )[];
    mounthRent: number;
    roomType: number | string;
    region: number | string;
    createAt: string;
    viewer: number;
    roomOption: number[];
    writer: string;
    imageUrl: string;
    preferences: PreferenceItem[];
    isAuthStudent: boolean;
    isAuthEmployee: boolean;
    isLike: boolean;
  }>;

export type BoardEditData = OpenApiSchema<'org.example.knockin.dto.BoardEditDto$Response'>;

/** 매칭 리스트 항목. */
export type MatchListItem = OpenApiSchema<'org.example.knockin.dto.MatchListDto$Response'> &
  Partial<{
    userId: number;
    name: string;
    deposit: number;
    mounthRent: number;
    minDeposit: number;
    minMounthRent: number;
    maxDeposit: number;
    maxMounthRent: number;
    comeableAt: string;
    roomType: (number | string)[];
    region: number | string;
  }>;

type MatchListPageData =
  OpenApiSchema<'org.springframework.data.domain.SliceOrg.example.knockin.dto.MatchListDto$Response'>;

export type MatchListData = Partial<MatchListPageData> & {
  matches?: MatchListItem[];
};

/** 매칭 상세. */
export type MatchDetailData = OpenApiSchema<'org.example.knockin.dto.MatchDetailDto$Response'> &
  Partial<{
    name: string;
    minDeposit: number;
    maxDeposit: number;
    deposit: number;
    minMounthRent: number;
    maxMounthRent: number;
    mounthRent: number;
    region: number | string;
    roomOption: number[];
    comeableAt: string;
    preferences: PreferenceItem[];
    isAuthStudent: boolean;
    isAuthEmployee: boolean;
  }>;

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
export async function getRoommateBoards(
  query: BoardListQuery = {},
): Promise<ApiResponse<BoardListData>> {
  if (USE_MOCK) return mockOk({ boards: MOCK_BOARDS });
  const res = await request<BoardListPageData>('GET', '/roommate/boards', {
    query: {
      page: 0,
      size: 20,
      ...query,
    },
  });
  if (res.status !== 200 || res.error || !res.data) return { ...res, data: { boards: [] } };
  return { ...res, data: pageToBoardListData(res.data) };
}

/** GET /roommate/boards/{boardId} — 게시글 상세 조회 */
export function getRoommateBoardDetail(boardId: string): Promise<ApiResponse<BoardDetailData>> {
  if (USE_MOCK) return mockOk({ ...MOCK_BOARD_DETAIL, boardId: Number(boardId) || 1 });
  return request('GET', `/roommate/boards/${boardId}`);
}

/** GET /roommate/boards/{boardId}/edit — 게시글 편집 form */
export function getRoommateBoardEdit(boardId: string): Promise<ApiResponse<BoardEditData>> {
  if (USE_MOCK) {
    return mockOk({
      images: [{ boardFileId: 1, url: 'https://picsum.photos/seed/p1/600/400' }],
      title: MOCK_BOARD_DETAIL.title ?? '',
      deposit: MOCK_BOARD_DETAIL.deposit ?? 0,
      monthlyRent: MOCK_BOARD_DETAIL.mounthRent ?? 0,
      managementCost: MOCK_BOARD_DETAIL.managementCost ?? 0,
      roomType: { roomTypeId: 2, name: '투룸' },
      region: { regionId: 4, fullName: '서울 마포구' },
      comeableDate: MOCK_BOARD_DETAIL.comeableDate,
      comeableDateNegotiable: false,
      roomExtraOptions: [{ extraOptionId: 1, name: '풀옵션' }],
      contents: MOCK_BOARD_DETAIL.contents ?? '',
      lifeStyles: MOCK_BOARD_DETAIL.lifeStyles,
      conditions: MOCK_BOARD_DETAIL.conditions,
    });
  }
  return request('GET', `/roommate/boards/${boardId}/edit`);
}

/** GET /roommate/matches — 매칭 리스트 탐색 */
export function getRoommateMatches(): Promise<ApiResponse<MatchListData>> {
  if (USE_MOCK) return mockOk({ matches: MOCK_MATCHES });
  return request<MatchListPageData>('GET', '/roommate/matches').then((res) => ({
    ...res,
    data: sliceToMatchListData(res.data),
  }));
}

/** GET /roommate/matches/{userId} — 매칭 상세 조회 */
export function getRoommateMatchDetail(userId: string): Promise<ApiResponse<MatchDetailData>> {
  if (USE_MOCK) return mockOk(MOCK_MATCH_DETAIL);
  return request('GET', `/roommate/matches/${userId}`);
}

/** POST /roommate/matches/{memberId}/likes — 매칭 사용자 관심(찜) 등록/취소 */
export function toggleMatchLike(memberId: string | number): Promise<ApiResponse<UpdatedAt>> {
  if (USE_MOCK) return mockUpdatedAt();
  return request('POST', `/roommate/matches/${memberId}/likes`);
}

/** POST /roommate/boards/{boardId}/likes — 게시글 관심(찜) 등록/취소 */
export function toggleBoardLike(boardId: string | number): Promise<ApiResponse<UpdatedAt>> {
  if (USE_MOCK) return mockUpdatedAt();
  return request('POST', `/roommate/boards/${boardId}/likes`);
}

/** POST /roommate/boards — 게시글 등록 */
export function createRoommateBoard(body: BoardWriteRequest): Promise<ApiResponse<UpdatedAt>> {
  if (USE_MOCK) return mockUpdatedAt();
  return request('POST', '/roommate/boards', {
    body: boardWriteRequestToFormData(body, 'create'),
  });
}

/** PUT /roommate/boards/{boardId} — 게시글 수정 */
export function updateRoommateBoard(
  boardId: string,
  body: BoardWriteRequest,
): Promise<ApiResponse<UpdatedAt>> {
  if (USE_MOCK) return mockUpdatedAt();
  return request('PUT', `/roommate/boards/${boardId}`, {
    body: boardWriteRequestToFormData(body, 'update'),
  });
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

/** POST /roommate/matches/{memberId}/reports — 매칭 사용자 신고 */
export function reportRoommateMatch(
  memberId: string,
  body: MatchReportRequest,
): Promise<ApiResponse<UpdatedAt>> {
  if (USE_MOCK) return mockUpdatedAt();
  return request('POST', `/roommate/matches/${memberId}/reports`, { body });
}

function pageToBoardListData(data: BoardListPageData): BoardListData {
  const boards = (data.content ?? []).map(normalizeBoardListItem);
  return { ...data, boards };
}

function normalizeBoardListItem(item: BoardListItemSwagger): BoardListItem {
  const boardId = item.id;
  const image = item.imageUrl;
  const mounthRent = item.monthlyRent;
  const roomType = firstValue(item.roomTypes);
  const region = item.regionFullName;
  const writer = item.memberName;
  const createAt = item.comeableDate;
  const viewer = item.hits;
  return {
    ...item,
    boardId,
    image,
    mounthRent,
    roomType,
    region,
    writer,
    createAt,
    viewer,
    isNew: hasValue(item.badges, 'NEW'),
    isPopular: hasValue(item.badges, 'HOT'),
  };
}

function sliceToMatchListData(data: MatchListPageData): MatchListData {
  const matches = (data.content ?? []).map(normalizeMatchListItem);
  return { ...data, matches };
}

function normalizeMatchListItem(
  item: OpenApiSchema<'org.example.knockin.dto.MatchListDto$Response'>,
): MatchListItem {
  const offer = item.offerProfile;
  const seeker = item.seekerProfile;
  return {
    ...item,
    userId: item.memberId,
    name: item.memberName,
    deposit: offer?.deposit,
    mounthRent: offer?.monthlyRent,
    minDeposit: seeker?.minDeposit,
    maxDeposit: seeker?.maxDeposit,
    minMounthRent: seeker?.minMonthlyRent,
    maxMounthRent: seeker?.maxMonthlyRent,
    roomType: offer?.roomTypeName ? [offer.roomTypeName] : seeker?.roomTypeNames,
    region: offer?.regionFullName ?? seeker?.regionFullNames?.[0],
  };
}

function boardWriteRequestToFormData(body: BoardWriteRequest, mode: 'create' | 'update'): FormData {
  const images = body.images ?? [];
  const files = images
    .map((image, index) => ({
      image,
      index,
      uri: image.uri ?? image.image,
      thumbnail: image.thumbnail ?? image.thumnail ?? index === 0,
    }))
    .filter((entry) => entry.uri && !entry.uri.startsWith('http'))
    .map((entry, fileIndex) => ({ ...entry, fileIndex }));
  const requestBody =
    mode === 'create'
      ? {
          title: body.title,
          contents: body.contents,
          deposit: body.deposit,
          mountlyRent: body.mountlyRent ?? body.monthlyRent ?? 0,
          managementCost: body.managementCost,
          roomTypeId: body.roomTypeId ?? body.roomType ?? 0,
          regionId: body.regionId ?? body.region ?? 0,
          comeableDateNegotiable: body.comeableDateNegotiable ?? false,
          comeableDate: body.comeableDate ?? body.comeableAt,
          images: files.map((entry) => ({
            fileIndex: entry.fileIndex,
            thumbnail: entry.thumbnail,
          })),
        }
      : {
          title: body.title,
          contents: body.contents,
          deposit: body.deposit,
          monthlyRent: body.monthlyRent ?? body.mountlyRent ?? 0,
          managementCost: body.managementCost,
          roomTypeId: body.roomTypeId ?? body.roomType ?? 0,
          regionId: body.regionId ?? body.region ?? 0,
          comeableDateNegotiable: body.comeableDateNegotiable ?? false,
          comeableDate: body.comeableDate ?? body.comeableAt,
          deleteExtraOptionIds: body.deleteExtraOptionIds ?? [],
          newExtraOptionIds: body.newExtraOptionIds ?? body.roomOption ?? [],
          existingImages: body.existingImages ?? [],
          newImages: files.map((entry) => ({
            fileIndex: entry.fileIndex,
            thumbnail: entry.thumbnail,
          })),
        };

  const formData = new FormData();
  const requestJson = JSON.stringify(requestBody);
  if (typeof (formData as FormData & { getParts?: () => unknown }).getParts === 'function') {
    // React Native FormData는 웹 Blob을 직렬화하지 않는다. string 파트에 타입을 붙이면
    // 네이티브 네트워크 계층이 @RequestPart JSON으로 전송한다.
    formData.append('request', { string: requestJson, type: 'application/json' } as any);
  } else {
    formData.append('request', new Blob([requestJson], { type: 'application/json' }));
  }
  for (const { uri, image, index } of files) {
    formData.append('files', {
      uri,
      name: image.name ?? `board-${index + 1}.jpg`,
      type: image.type ?? 'image/jpeg',
    } as any);
  }
  return formData;
}

function firstValue(value: string | string[] | undefined): string | undefined {
  return Array.isArray(value) ? value[0] : value;
}

function hasValue(value: string | string[] | undefined, expected: string): boolean {
  return Array.isArray(value) ? value.includes(expected) : value === expected;
}
