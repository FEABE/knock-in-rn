/**
 * 룸메이트 게시글/매칭 화면용 데이터 훅.
 * API 응답을 lib/domain UI 타입으로 매핑해 반환한다.
 */
import { useMemo } from 'react';

import type { RoomPost, RoommateCard } from '@/lib/domain';

import { boardListItemToRoomPost, matchListItemToRoommateCard } from './adapters';
import {
  type BoardListQuery,
  type MatchDetailData,
  type MatchListItem,
  getRoommateBoards,
  getRoommateMatchDetail,
  getRoommateMatches,
} from './roommate-boards';
import { type AsyncState, useApi } from './use-async';

/** 룸메이트 게시글 목록 (RoomPost[]). */
export function useRoommateBoards(query: BoardListQuery = {}): AsyncState<RoomPost[]> {
  const key = JSON.stringify(query);
  const state = useApi(() => getRoommateBoards(query), [key]);
  const posts = useMemo(
    () => state.data?.boards?.map(boardListItemToRoomPost) ?? null,
    [state.data],
  );
  return { ...state, data: posts };
}

/** 룸메이트 매칭 목록 (RoommateCard[]). */
export function useRoommateMatches(): AsyncState<RoommateCard[]> {
  const state = useApi(() => getRoommateMatches(), []);
  const cards = useMemo(
    () => state.data?.matches?.map(matchListItemToRoommateCard) ?? null,
    [state.data],
  );
  return { ...state, data: cards };
}

/** 룸메이트 매칭 목록 (명세 원본 MatchListItem[]). 리치 카드 렌더용. */
export function useRoommateMatchList(): AsyncState<MatchListItem[]> {
  const state = useApi(() => getRoommateMatches(), []);
  return { ...state, data: state.data?.matches ?? null };
}

/** 룸메이트 매칭 상세 (userId). */
export function useRoommateMatchDetail(userId: string): AsyncState<MatchDetailData> {
  return useApi(() => getRoommateMatchDetail(userId), [userId]);
}
