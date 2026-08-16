/**
 * 룸메이트 게시글/매칭 화면용 데이터 훅.
 * API 응답을 lib/domain UI 타입으로 매핑해 반환한다.
 */
import { useCallback, useMemo } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';

import type { RoomPost, RoommateCard } from '@/lib/domain';

import {
  boardDetailToRoomPost,
  boardListItemToRoomPost,
  matchListItemToRoommateCard,
} from './adapters';
import { toRoommateMatchCardModel, type RoommateMatchCardModel } from './mappers';
import { getMyBoards } from './profile';
import {
  type BoardListQuery,
  type BoardListData,
  type BoardListItem,
  type BoardDetailData,
  type BoardEditData,
  type BoardWriteRequest,
  type MatchDetailData,
  type MatchListItem,
  type MatchListData,
  type MatchListQuery,
  createRoommateBoard,
  deleteRoommateBoard,
  getRoommateBoardEdit,
  getRoommateBoardDetail,
  getRoommateBoards,
  getRoommateMatchDetail,
  getRoommateMatches,
  reportRoommateBoard,
  reportRoommateMatch,
  toggleBoardLike,
  toggleMatchLike,
  updateRoommateBoard,
} from './roommate-boards';
import { type AsyncState, type InfiniteAsyncState, useApi, useInfiniteApi } from './use-async';

/** 목록 한 페이지 크기. 백엔드 @PageableDefault 와 동일하게 맞춘다. */
const PAGE_SIZE = 20;

/** 무한 스크롤 목록 훅의 반환 형태(`AsyncState` 필드 + 더 불러오기). */
export type InfiniteListState<T> = Omit<InfiniteAsyncState<unknown>, 'pages'> & {
  data: T[] | null;
};

/** 페이지 경계에서 중복으로 내려오는 항목을 제거한다. */
function dedupeBy<T>(items: T[], key: (item: T) => string): T[] {
  const seen = new Set<string>();
  return items.filter((item) => {
    const id = key(item);
    if (seen.has(id)) return false;
    seen.add(id);
    return true;
  });
}

const roomPostId = (post: RoomPost) => post.id;
const roommateCardId = (card: RoommateMatchCardModel) => card.id;

/** 매칭 목록 첫 페이지의 제외 ID(빈 목록). 매 렌더 새 배열이 되지 않도록 모듈 상수. */
const NO_EXCLUDED_MEMBER_IDS: number[] = [];

/**
 * 낙관적 업데이트용. 캐시 엔트리가 단일 응답이든 useInfiniteQuery 의
 * `{ pages, pageParams }` 든 동일한 페이지 변환 함수를 적용한다.
 * (setQueriesData 는 prefix 매칭이라 상세/편집 엔트리도 함께 들어온다.)
 */
function mapCachedPages<TPage>(cached: unknown, mapPage: (page: TPage) => TPage): unknown {
  if (!cached || typeof cached !== 'object') return cached;
  const infinite = cached as { pages?: unknown[]; pageParams?: unknown[] };
  if (Array.isArray(infinite.pages)) {
    return { ...infinite, pages: infinite.pages.map((page) => mapPage(page as TPage)) };
  }
  return mapPage(cached as TPage);
}

/** 룸메이트 게시글 목록 (RoomPost[]). */
export function useRoommateBoards(
  query: BoardListQuery = {},
  enabled = true,
): AsyncState<RoomPost[]> {
  const key = JSON.stringify(query);
  const state = useApi(['roommate', 'boards', key], () => getRoommateBoards(query), {
    enabled,
    retry: false,
  });
  const posts = useMemo(
    () => state.data?.boards?.map(boardListItemToRoomPost) ?? null,
    [state.data],
  );
  return { ...state, data: posts };
}

/**
 * 룸메이트 게시글 목록 무한 스크롤 (RoomPost[]).
 * 서버가 Page 를 주므로 `last === true` 일 때 멈춘다.
 */
export function useRoommateBoardsInfinite(
  query: BoardListQuery = {},
  enabled = true,
): InfiniteListState<RoomPost> {
  const key = JSON.stringify(query);
  const state = useInfiniteApi<BoardListData>(
    ['roommate', 'boards', 'infinite', key],
    (page) => getRoommateBoards({ ...query, page, size: PAGE_SIZE }),
    {
      initialPageParam: 0,
      getNextPageParam: (lastPage, _allPages, lastPageParam) =>
        hasNextBoardPage(lastPage) ? lastPageParam + 1 : undefined,
    },
    { enabled, retry: false },
  );
  const { pages } = state;
  const data = useMemo(
    () =>
      pages
        ? dedupeBy(
            pages.flatMap((page) => page.boards ?? []).map(boardListItemToRoomPost),
            roomPostId,
          )
        : null,
    [pages],
  );
  return { ...state, data };
}

/** Page 응답의 `last` 로 다음 페이지 존재 여부를 판단한다. */
function hasNextBoardPage(page: BoardListData): boolean {
  if (typeof page.last === 'boolean') return !page.last;
  // last 가 없는 응답(mock 등)은 페이지가 꽉 찼는지로 추정한다.
  return (page.boards?.length ?? 0) >= PAGE_SIZE;
}

/** 내 룸메이트 게시글 목록 (RoomPost[]). */
export function useMyRoommateBoards(enabled = true): AsyncState<RoomPost[]> {
  const state = useApi(
    ['profile', 'my-boards'],
    async () => {
      const res = await getMyBoards();
      const boards = (res.data?.boards ?? []).map((board) => board as BoardListItem);
      if (res.status !== 200 || res.error || boards.length === 0) {
        return { ...res, data: { boards } satisfies BoardListData };
      }
      return { ...res, data: { boards } satisfies BoardListData };
    },
    { enabled, retry: false },
  );
  const posts = useMemo(
    () => state.data?.boards?.map((board) => boardListItemToRoomPost(board)) ?? null,
    [state.data],
  );
  return { ...state, data: posts };
}

/**
 * 내 룸메이트 게시글 목록 무한 스크롤 (RoomPost[]).
 *
 * GET /users/me/boards 는 Pageable(page/size/sort)은 받지만 응답이 `{ boards: [] }`
 * 평면 DTO 라 last/totalPages 를 노출하지 않는다(BE: MyBoardListDto$Response).
 * 그래서 "받아온 개수가 size 미만이면 마지막" 으로 추정한다.
 */
export function useMyRoommateBoardsInfinite(enabled = true): InfiniteListState<RoomPost> {
  const state = useInfiniteApi(
    ['profile', 'my-boards', 'infinite'],
    (page) => getMyBoards({ page, size: PAGE_SIZE }),
    {
      initialPageParam: 0,
      getNextPageParam: (lastPage, _allPages, lastPageParam) =>
        (lastPage?.boards?.length ?? 0) >= PAGE_SIZE ? lastPageParam + 1 : undefined,
    },
    { enabled, retry: false },
  );
  const { pages } = state;
  const data = useMemo(
    () =>
      pages
        ? dedupeBy(
            pages
              .flatMap((page) => page?.boards ?? [])
              .map((board) => boardListItemToRoomPost(board as BoardListItem)),
            roomPostId,
          )
        : null,
    [pages],
  );
  return { ...state, data };
}

/** 룸메이트 게시글 상세 (RoomPost). */
export function useRoommateBoardDetail(boardId: string): AsyncState<RoomPost> {
  const state = useApi(
    ['roommate', 'boards', 'detail', boardId],
    () => getRoommateBoardDetail(boardId),
    { enabled: boardId.length > 0, retry: false },
  );
  const post = useMemo(() => (state.data ? boardDetailToRoomPost(state.data) : null), [state.data]);
  return { ...state, data: post };
}

/** 룸메이트 게시글 편집 form. */
export function useRoommateBoardEdit(boardId: string): AsyncState<BoardEditData> {
  return useApi(['roommate', 'boards', 'edit', boardId], () => getRoommateBoardEdit(boardId), {
    enabled: boardId.length > 0,
    retry: false,
  });
}

/** 룸메이트 매칭 목록 (RoommateCard[]). */
export function useRoommateMatches(): AsyncState<RoommateCard[]> {
  const state = useApi(['roommate', 'matches'], () => getRoommateMatches(), { retry: false });
  const cards = useMemo(
    () => state.data?.matches?.map(matchListItemToRoommateCard) ?? null,
    [state.data],
  );
  return { ...state, data: cards };
}

/** 룸메이트 매칭 목록 (명세 원본 MatchListItem[]). 리치 카드 렌더용. */
export function useRoommateMatchList(): AsyncState<MatchListItem[]> {
  const state = useApi(['roommate', 'matches'], () => getRoommateMatches(), { retry: false });
  return { ...state, data: state.data?.matches ?? null };
}

/** 룸메이트 매칭 목록 (화면용 ViewModel[]). */
export function useRoommateMatchCards(enabled = true): AsyncState<RoommateMatchCardModel[]> {
  const state = useApi(['roommate', 'matches'], () => getRoommateMatches(), {
    enabled,
    retry: false,
  });
  const cards = useMemo(
    () => state.data?.matches?.map(toRoommateMatchCardModel) ?? null,
    [state.data],
  );
  return { ...state, data: cards };
}

/**
 * 룸메이트 매칭 목록 무한 스크롤 (화면용 ViewModel[]).
 *
 * GET /roommate/matches 는 page 파라미터가 없는 Slice 다. 이미 받은 memberId 를
 * `excludeMemberIds` 로 되돌려 보내 다음 묶음을 받는다(BE: MatchListDto$Request).
 */
export function useRoommateMatchCardsInfinite(
  query: MatchListQuery = {},
  enabled = true,
): InfiniteListState<RoommateMatchCardModel> {
  const key = JSON.stringify(query);
  const state = useInfiniteApi<MatchListData, number[]>(
    ['roommate', 'matches', 'infinite', key],
    (excludeMemberIds) => getRoommateMatches({ ...query, size: PAGE_SIZE, excludeMemberIds }),
    {
      initialPageParam: NO_EXCLUDED_MEMBER_IDS,
      getNextPageParam: (lastPage, _allPages, lastPageParam) => {
        const ids = (lastPage.matches ?? [])
          .map((match) => match.memberId ?? match.userId)
          .filter((id): id is number => typeof id === 'number');
        // last 가 false 여도 새로 받은 게 없으면 같은 요청이 반복되므로 멈춘다.
        if (lastPage.last !== false || ids.length === 0) return undefined;
        return [...lastPageParam, ...ids];
      },
    },
    { enabled, retry: false },
  );
  const { pages } = state;
  const data = useMemo(
    () =>
      pages
        ? dedupeBy(
            pages.flatMap((page) => page.matches ?? []).map(toRoommateMatchCardModel),
            roommateCardId,
          )
        : null,
    [pages],
  );
  return { ...state, data };
}

export function useRoommateBoardLikeActions() {
  const queryClient = useQueryClient();
  const mutation = useMutation({
    mutationFn: (boardId: string | number) => toggleBoardLike(boardId),
    onSettled: async (_data, _error, boardId) => {
      await queryClient.invalidateQueries({ queryKey: ['roommate', 'boards'] });
      await queryClient.invalidateQueries({
        queryKey: ['roommate', 'boards', 'detail', String(boardId)],
      });
    },
  });

  return useCallback(
    (boardId: string | number, liked: boolean) => {
      queryClient.setQueriesData({ queryKey: ['roommate', 'boards'] }, (old: unknown) =>
        mapCachedPages(old, (page: BoardListData) => {
          if (!page?.boards) return page;
          return {
            ...page,
            boards: page.boards.map((board) =>
              String(board.boardId ?? board.id ?? '') === String(boardId)
                ? // 어댑터가 interested ?? isLike 순으로 읽으므로 둘 다 갱신해야 반영된다.
                  { ...board, isLike: liked, interested: liked }
                : board,
            ),
          };
        }),
      );
      queryClient.setQueryData<BoardDetailData & { isLike?: boolean }>(
        ['roommate', 'boards', 'detail', String(boardId)],
        (old) => (old ? { ...old, isLike: liked, interested: liked } : old),
      );
      mutation.mutate(boardId);
    },
    [mutation, queryClient],
  );
}

export function useRoommateBoardWriteActions() {
  const queryClient = useQueryClient();

  const invalidateBoards = useCallback(async () => {
    await queryClient.invalidateQueries({
      predicate: ({ queryKey }) =>
        queryKey[0] === 'roommate' &&
        queryKey[1] === 'boards' &&
        queryKey[2] !== 'detail' &&
        queryKey[2] !== 'edit',
    });
    await queryClient.invalidateQueries({ queryKey: ['profile', 'my-boards'] });
  }, [queryClient]);

  const createMutation = useMutation({
    mutationFn: (body: BoardWriteRequest) => createRoommateBoard(body),
    onSuccess: invalidateBoards,
  });
  const updateMutation = useMutation({
    mutationFn: ({ boardId, body }: { boardId: string; body: BoardWriteRequest }) =>
      updateRoommateBoard(boardId, body),
    onSuccess: async (_, vars) => {
      await queryClient.invalidateQueries({
        queryKey: ['roommate', 'boards', 'detail', vars.boardId],
      });
      await invalidateBoards();
    },
  });
  const deleteMutation = useMutation({
    mutationFn: (boardId: string) => deleteRoommateBoard(boardId),
    onSuccess: () => {
      void invalidateBoards();
    },
  });
  const reportMutation = useMutation({
    mutationFn: ({ boardId, contents }: { boardId: string; contents: string }) =>
      reportRoommateBoard(boardId, { contents }),
    onSuccess: (response, { boardId }) => {
      if (response.status !== 200 || response.error) return;
      // 신고 직후 목록으로 돌아갔을 때 서버 재조회 전에도 대상 글이 다시 보이지 않게 한다.
      queryClient.setQueriesData({ queryKey: ['roommate', 'boards'] }, (old: unknown) =>
        mapCachedPages(old, (page: BoardListData) => {
          if (!page?.boards) return page;
          return {
            ...page,
            boards: page.boards.filter(
              (board) => String(board.boardId ?? board.id ?? '') !== String(boardId),
            ),
          };
        }),
      );
      void invalidateBoards();
    },
  });

  return {
    createBoard: async (body: BoardWriteRequest) => {
      const res = await createMutation.mutateAsync(body);
      if (res.error || res.status !== 200) {
        throw new Error(res.error?.message ?? '게시글 등록에 실패했습니다.');
      }
      return res.data;
    },
    updateBoard: async (boardId: string, body: BoardWriteRequest) => {
      const res = await updateMutation.mutateAsync({ boardId, body });
      if (res.error || res.status !== 200) {
        throw new Error(res.error?.message ?? '게시글 수정에 실패했습니다.');
      }
      return res.data;
    },
    deleteBoard: async (boardId: string) => {
      const res = await deleteMutation.mutateAsync(boardId);
      if (res.error || res.status !== 200) {
        throw new Error(res.error?.message ?? '게시글 삭제에 실패했습니다.');
      }
      return res.data;
    },
    reportBoard: async (boardId: string, contents: string) => {
      const res = await reportMutation.mutateAsync({ boardId, contents });
      if (res.error || res.status !== 200) {
        throw new Error(res.error?.message ?? '게시글 신고에 실패했습니다.');
      }
      return res.data;
    },
    creating: createMutation.isPending,
    updating: updateMutation.isPending,
    deleting: deleteMutation.isPending,
    reporting: reportMutation.isPending,
  };
}

export function useRoommateMatchLikeActions() {
  const queryClient = useQueryClient();
  const mutation = useMutation({
    mutationFn: (userId: string | number) => toggleMatchLike(userId),
    onSettled: async (_data, _error, userId) => {
      await queryClient.invalidateQueries({ queryKey: ['roommate', 'matches'] });
      await queryClient.invalidateQueries({ queryKey: ['roommate', 'matches', String(userId)] });
    },
  });

  return useCallback(
    (userId: string | number, liked: boolean) => {
      queryClient.setQueriesData({ queryKey: ['roommate', 'matches'] }, (old: unknown) =>
        mapCachedPages(old, (page: MatchListData) => {
          if (!page?.matches) return page;
          return {
            ...page,
            matches: page.matches.map((match) =>
              String(match.userId ?? match.memberId ?? '') === String(userId)
                ? { ...match, isLike: liked, interested: liked }
                : match,
            ),
          };
        }),
      );
      queryClient.setQueryData<MatchDetailData & { interested?: boolean }>(
        ['roommate', 'matches', String(userId)],
        (old) => (old ? { ...old, isLike: liked, interested: liked } : old),
      );
      mutation.mutate(userId);
    },
    [mutation, queryClient],
  );
}

export function useRoommateMatchReportActions() {
  const mutation = useMutation({
    mutationFn: ({ memberId, contents }: { memberId: string; contents: string }) =>
      reportRoommateMatch(memberId, { contents }),
  });

  return {
    reportMatch: async (memberId: string, contents: string) => {
      const res = await mutation.mutateAsync({ memberId, contents });
      if (res.status !== 200 || res.error) {
        throw new Error(res.error?.message ?? '사용자 신고에 실패했습니다.');
      }
      return res.data;
    },
    reportingMatch: mutation.isPending,
  };
}

/** 룸메이트 매칭 상세 (userId). */
export function useRoommateMatchDetail(userId: string): AsyncState<MatchDetailData> {
  return useApi(['roommate', 'matches', userId], () => getRoommateMatchDetail(userId), {
    enabled: userId.length > 0,
    retry: false,
  });
}
