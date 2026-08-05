import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useMemo, useState } from 'react';
import { Keyboard } from 'react-native';

import { AnalyticsEvent, logEvent } from '@/lib/analytics';
import {
  type BoardListQuery,
  getPopularSearch,
  useApi,
  useRoommateBoardLikeActions,
  useRoommateBoards,
} from '@/lib/api';
import { useRequireLogin } from '@/lib/auth';
import { useModeration, type RoomPost } from '@/lib/domain';
import { goRoomDetail } from '@/lib/navigation/routes';
import { readRecentSearches, writeRecentSearches } from '@/lib/search/recent-searches';

export type RoomSearchPhase = 'idle' | 'loading' | 'error' | 'empty' | 'results';

export type UseRoomSearchScreenReturn = {
  query: string;
  submittedQuery: string | null;
  phase: RoomSearchPhase;
  results: RoomPost[];
  resultsError: string | null;
  retryResults: () => void;
  recent: string[];
  popular: string[];
  popularLoading: boolean;
  popularError: string | null;
  retryPopular: () => void;
  setQuery: (next: string) => void;
  clearQuery: () => void;
  clearRecent: () => void;
  removeRecent: (term: string) => void;
  submit: (term: string) => void;
  onCancel: () => void;
  onResultPress: (post: RoomPost) => void;
  onResultLikeChange: (post: RoomPost, liked: boolean) => void;
};

// 탐색 탭과 별개 캐시 키를 갖는 기본 목록 쿼리 (최신순 전체 목록).
const SEARCH_BOARD_QUERY: BoardListQuery = { sort: 'createdAt,DESC' };

export function useRoomSearchScreen(): UseRoomSearchScreenReturn {
  const router = useRouter();
  const { q } = useLocalSearchParams<{ q?: string }>();
  const initialQuery = typeof q === 'string' ? q.trim() : '';
  const [state, setState] = useState({
    query: initialQuery,
    submitted: initialQuery ? initialQuery : (null as string | null),
    recent: [] as string[],
  });
  const { query, submitted, recent } = state;
  const { requireLogin } = useRequireLogin();
  const { isPostBlocked, isUserBlocked } = useModeration();
  const setBoardLiked = useRoommateBoardLikeActions();

  const {
    data: popularData,
    loading: popularLoading,
    error: popularError,
    reload: retryPopular,
  } = useApi(['search', 'popular'], () => getPopularSearch(), { retry: false });
  const popular = useMemo(
    () =>
      popularData?.rank
        ?.map((item) => item.keyword)
        .filter((keyword): keyword is string => Boolean(keyword)) ?? [],
    [popularData],
  );

  const {
    data: posts,
    loading: resultsLoading,
    error: resultsError,
    reload: retryResults,
  } = useRoommateBoards(SEARCH_BOARD_QUERY, submitted !== null);

  const results = useMemo(() => {
    if (submitted === null) return [];
    const safe = (posts ?? []).filter(
      (post) => !isPostBlocked(post.id) && !isUserBlocked(post.author.id),
    );
    return filterRoomsBySearch(safe, submitted);
  }, [posts, isPostBlocked, isUserBlocked, submitted]);

  const phase: RoomSearchPhase =
    submitted === null
      ? 'idle'
      : resultsLoading
        ? 'loading'
        : resultsError
          ? 'error'
          : results.length === 0
            ? 'empty'
            : 'results';

  useEffect(() => {
    let active = true;
    readRecentSearches().then((stored) => {
      if (active) setState((current) => ({ ...current, recent: stored }));
    });
    return () => {
      active = false;
    };
  }, []);

  const submit = (term: string) => {
    const trimmed = term.trim();
    if (!trimmed) return;
    Keyboard.dismiss();
    setState((current) => {
      const next = [trimmed, ...current.recent.filter((item) => item !== trimmed)].slice(0, 20);
      void writeRecentSearches(next);
      return { ...current, query: trimmed, submitted: trimmed, recent: next };
    });
  };

  return {
    query,
    submittedQuery: submitted,
    phase,
    results,
    resultsError,
    retryResults,
    recent,
    popular,
    popularLoading,
    popularError,
    retryPopular,
    setQuery: (next) => setState((current) => ({ ...current, query: next })),
    clearQuery: () => setState((current) => ({ ...current, query: '', submitted: null })),
    clearRecent: () => {
      setState((current) => ({ ...current, recent: [] }));
      void writeRecentSearches([]);
    },
    removeRecent: (term) =>
      setState((current) => {
        const next = current.recent.filter((item) => item !== term);
        void writeRecentSearches(next);
        return { ...current, recent: next };
      }),
    submit,
    onCancel: () => router.back(),
    onResultPress: (post) => {
      logEvent(AnalyticsEvent.ROOM_CARD_TAP, { room_id: post.id });
      goRoomDetail(router, post.id);
    },
    onResultLikeChange: (post, liked) =>
      requireLogin(() => {
        logEvent(liked ? AnalyticsEvent.ROOM_INTEREST_ADD : AnalyticsEvent.ROOM_INTEREST_REMOVE, {
          room_id: post.id,
        });
        setBoardLiked(post.id, liked);
      }),
  };
}

function normalizeSearchValue(value: string): string {
  return value.toLocaleLowerCase().replace(/\s+/g, '');
}

// 탐색 화면(use-explore-screen)의 검색 필터와 동일한 매칭 기준.
function filterRoomsBySearch(posts: RoomPost[], query: string): RoomPost[] {
  const normalized = normalizeSearchValue(query);
  if (!normalized) return posts;
  return posts.filter((post) =>
    normalizeSearchValue(
      [
        post.title,
        post.description,
        post.region.city,
        post.region.district,
        post.author.name,
        post.roomType,
      ].join(' '),
    ).includes(normalized),
  );
}
