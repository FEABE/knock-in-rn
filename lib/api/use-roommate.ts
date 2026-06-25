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
  type BoardDetailData,
  type BoardWriteRequest,
  type MatchDetailData,
  type MatchListItem,
  type MatchListData,
  createRoommateBoard,
  deleteRoommateBoard,
  getRoommateBoardDetail,
  getRoommateBoards,
  getRoommateMatchDetail,
  getRoommateMatches,
  hydrateBoardListData,
  reportRoommateBoard,
  toggleBoardLike,
  updateRoommateBoard,
} from './roommate-boards';
import { type AsyncState, useApi } from './use-async';

/** 룸메이트 게시글 목록 (RoomPost[]). */
export function useRoommateBoards(query: BoardListQuery = {}): AsyncState<RoomPost[]> {
  const key = JSON.stringify(query);
  const state = useApi(['roommate', 'boards', key], () => getRoommateBoards(query));
  const posts = useMemo(
    () => state.data?.boards?.map(boardListItemToRoomPost) ?? null,
    [state.data],
  );
  return { ...state, data: posts };
}

/** 내 룸메이트 게시글 목록 (RoomPost[]). */
export function useMyRoommateBoards(enabled = true): AsyncState<RoomPost[]> {
  const state = useApi(
    ['profile', 'my-boards'],
    async () => {
      const res = await getMyBoards();
      if (res.status !== 200 || res.error || !res.data?.boards?.length) return res;
      const hydrated = await hydrateBoardListData({ boards: res.data.boards });
      return { ...res, data: { ...res.data, boards: hydrated.boards } };
    },
    { enabled },
  );
  const posts = useMemo(
    () =>
      state.data?.boards?.map((board) =>
        boardListItemToRoomPost({
          ...board,
          writer: '나',
        }),
      ) ?? null,
    [state.data],
  );
  return { ...state, data: posts };
}

/** 룸메이트 게시글 상세 (RoomPost). */
export function useRoommateBoardDetail(boardId: string): AsyncState<RoomPost> {
  const state = useApi(
    ['roommate', 'boards', 'detail', boardId],
    () => getRoommateBoardDetail(boardId),
    { enabled: boardId.length > 0 },
  );
  const post = useMemo(() => (state.data ? boardDetailToRoomPost(state.data) : null), [state.data]);
  return { ...state, data: post };
}

/** 룸메이트 매칭 목록 (RoommateCard[]). */
export function useRoommateMatches(): AsyncState<RoommateCard[]> {
  const state = useApi(['roommate', 'matches'], () => getRoommateMatches());
  const cards = useMemo(
    () => state.data?.matches?.map(matchListItemToRoommateCard) ?? null,
    [state.data],
  );
  return { ...state, data: cards };
}

/** 룸메이트 매칭 목록 (명세 원본 MatchListItem[]). 리치 카드 렌더용. */
export function useRoommateMatchList(): AsyncState<MatchListItem[]> {
  const state = useApi(['roommate', 'matches'], () => getRoommateMatches());
  return { ...state, data: state.data?.matches ?? null };
}

/** 룸메이트 매칭 목록 (화면용 ViewModel[]). */
export function useRoommateMatchCards(): AsyncState<RoommateMatchCardModel[]> {
  const state = useApi(['roommate', 'matches'], () => getRoommateMatches());
  const cards = useMemo(
    () => state.data?.matches?.map(toRoommateMatchCardModel) ?? null,
    [state.data],
  );
  return { ...state, data: cards };
}

export function useRoommateBoardLikeActions() {
  const queryClient = useQueryClient();
  const mutation = useMutation({
    mutationFn: (boardId: string | number) => toggleBoardLike({ boardId: Number(boardId) }),
    onSettled: async (_data, _error, boardId) => {
      await queryClient.invalidateQueries({ queryKey: ['roommate', 'boards'] });
      await queryClient.invalidateQueries({
        queryKey: ['roommate', 'boards', 'detail', String(boardId)],
      });
    },
  });

  return useCallback(
    (boardId: string | number, liked: boolean) => {
      queryClient.setQueriesData<BoardListData>({ queryKey: ['roommate', 'boards'] }, (old) => {
        if (!old?.boards) return old;
        return {
          ...old,
          boards: old.boards.map((board) =>
            String(board.boardId ?? '') === String(boardId) ? { ...board, isLike: liked } : board,
          ),
        };
      });
      queryClient.setQueryData<BoardDetailData & { isLike?: boolean }>(
        ['roommate', 'boards', 'detail', String(boardId)],
        (old) => (old ? { ...old, isLike: liked } : old),
      );
      mutation.mutate(boardId);
    },
    [mutation, queryClient],
  );
}

export function useRoommateBoardWriteActions() {
  const queryClient = useQueryClient();

  const invalidateBoards = useCallback(async () => {
    await queryClient.invalidateQueries({ queryKey: ['roommate', 'boards'] });
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
    onSuccess: invalidateBoards,
  });
  const reportMutation = useMutation({
    mutationFn: ({ boardId, contents }: { boardId: string; contents: string }) =>
      reportRoommateBoard(boardId, { contents }),
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

  return useCallback(
    (userId: string | number, liked: boolean) => {
      queryClient.setQueriesData<MatchListData>({ queryKey: ['roommate', 'matches'] }, (old) => {
        if (!old?.matches) return old;
        return {
          ...old,
          matches: old.matches.map((match) =>
            String(match.userId ?? '') === String(userId) ? { ...match, isLike: liked } : match,
          ),
        };
      });
    },
    [queryClient],
  );
}

/** 룸메이트 매칭 상세 (userId). */
export function useRoommateMatchDetail(userId: string): AsyncState<MatchDetailData> {
  return useApi(['roommate', 'matches', userId], () => getRoommateMatchDetail(userId), {
    enabled: userId.length > 0,
  });
}
