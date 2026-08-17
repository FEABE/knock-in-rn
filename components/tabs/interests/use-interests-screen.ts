import { useFocusEffect } from '@react-navigation/native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useCallback, useEffect, useMemo, useState } from 'react';

import { useModerationSuccessToast } from '@/components/moderation/use-moderation-success-toast';
import {
  type BoardListQuery,
  type MatchListQuery,
  regionBackendId,
  roomTypeBackendId,
  useRoommateBoardLikeActions,
  useRoommateBoardsInfinite,
  useRoommateMatchCardsInfinite,
  useRoommateMatchLikeActions,
  type RoommateMatchCardModel,
} from '@/lib/api';
import { useModeration, useMyProfileAuthor, type RoomPost } from '@/lib/domain';
import { useRequireLogin } from '@/lib/auth';
import { goExplore, goRoomDetail, goRoommateDetail, goRoomSearch } from '@/lib/navigation/routes';

import {
  EXPLORE_SORT_OPTIONS,
  INITIAL_EXPLORE_FILTER,
  type ExploreFilter,
  type ExploreFilterKey,
  type ExploreSort,
} from '../explore/use-explore-screen';

/** 관심 룸메이트만 조회한다(서버 likedOnly 필터). 렌더마다 새 객체가 되지 않도록 모듈 상수. */
const MATCH_LIKED_QUERY: MatchListQuery = { likedOnly: true };

export type UseInterestsScreenReturn = {
  rooms: RoomPost[];
  likedMatches: RoommateMatchCardModel[];
  isLoggedIn: boolean;
  filter: ExploreFilter;
  sort: ExploreSort;
  openSheet: ExploreFilterKey | null;
  activeTab: 'rooms' | 'roommates';
  toastMessage: string | null;
  roomsLoading: boolean;
  roomsRefreshing: boolean;
  roomsError: string | null;
  roomsLoadingMore: boolean;
  loadMoreRooms: () => void;
  matchesLoading: boolean;
  matchesRefreshing: boolean;
  matchesError: string | null;
  matchesLoadingMore: boolean;
  loadMoreMatches: () => void;
  reloadRooms: () => void;
  reloadMatches: () => void;
  sortLabel: string;
  setSort: (next: ExploreSort) => void;
  setOpenSheet: (next: ExploreFilterKey | null) => void;
  setActiveTab: (next: 'rooms' | 'roommates') => void;
  setFilter: (next: ExploreFilter) => void;
  onSearchPress: () => void;
  onLoginPress: () => void;
  onExplorePress: (tab: 'rooms' | 'roommates') => void;
  onRoomPress: (post: RoomPost) => void;
  onRoomLikeChange: (post: RoomPost, liked: boolean) => void;
  onRoommatePress: (match: RoommateMatchCardModel) => void;
  onRoommateLikeChange: (match: RoommateMatchCardModel, liked: boolean) => void;
};

export function useInterestsScreen(): UseInterestsScreenReturn {
  const router = useRouter();
  const { tab } = useLocalSearchParams<{ tab?: string }>();
  const { isPostBlocked, isUserBlocked } = useModeration();
  const { applyToPosts: applyMyProfile } = useMyProfileAuthor();
  const { requireLogin, isLoggedIn } = useRequireLogin();
  const [filter, setFilter] = useState<ExploreFilter>(INITIAL_EXPLORE_FILTER);
  const [sort, setSort] = useState<ExploreSort>('latest');
  const [openSheet, setOpenSheet] = useState<ExploreFilterKey | null>(null);
  const [activeTab, setActiveTab] = useState<'rooms' | 'roommates'>('rooms');
  const moderationToast = useModerationSuccessToast('interests');

  useFocusEffect(
    useCallback(() => {
      if (tab === 'rooms' || tab === 'roommates') {
        setActiveTab(tab);
        router.setParams({ tab: undefined });
      }
    }, [router, tab]),
  );

  useEffect(() => {
    if (moderationToast?.tab) setActiveTab(moderationToast.tab);
  }, [moderationToast]);
  // 관심 목록은 서버의 likedOnly 필터로 받는다. 예전처럼 전체 목록 1페이지를 받아
  // 클라이언트에서 liked 만 걸러내면, 최신 20건 밖의 관심 글은 아예 보이지 않는다.
  const boardQuery = useMemo(() => toBoardQuery(filter, sort), [filter, sort]);
  const {
    data: posts,
    loading: roomsLoading,
    refreshing: roomsRefreshing,
    error: roomsError,
    refresh: reloadRooms,
    loadMore: loadMoreRooms,
    loadingMore: roomsLoadingMore,
  } = useRoommateBoardsInfinite(boardQuery, isLoggedIn);
  const {
    data: matchList,
    loading: matchesLoading,
    refreshing: matchesRefreshing,
    error: matchesError,
    refresh: reloadMatches,
    loadMore: loadMoreMatches,
    loadingMore: matchesLoadingMore,
  } = useRoommateMatchCardsInfinite(MATCH_LIKED_QUERY, isLoggedIn);
  const setBoardLiked = useRoommateBoardLikeActions();
  const setMatchLiked = useRoommateMatchLikeActions();

  // liked === false 는 방금 관심 해제한 항목이다(낙관적 업데이트). 재조회 전까지 즉시 감춘다.
  // 내 글의 작성자 프로필은 탐색 탭과 같이 세션 값으로 보정한다(응답 이미지가 비어 올 수 있다).
  const rooms = sortPosts(
    applyMyProfile(posts ?? []).filter(
      (post) => post.liked !== false && !isPostBlocked(post.id) && !isUserBlocked(post.author.id),
    ),
    sort,
  );
  const likedMatches = (matchList ?? []).filter(
    (match) => match.liked !== false && !isUserBlocked(match.id),
  );

  return {
    rooms,
    likedMatches,
    isLoggedIn,
    filter,
    sort,
    openSheet,
    activeTab,
    toastMessage: moderationToast?.message ?? null,
    roomsLoading,
    roomsRefreshing,
    roomsError,
    roomsLoadingMore,
    loadMoreRooms,
    matchesLoading,
    matchesRefreshing,
    matchesError,
    matchesLoadingMore,
    loadMoreMatches,
    reloadRooms,
    reloadMatches,
    sortLabel: EXPLORE_SORT_OPTIONS.find((option) => option.value === sort)?.label ?? '정렬',
    setSort,
    setOpenSheet,
    setActiveTab,
    setFilter,
    onSearchPress: () => goRoomSearch(router),
    onLoginPress: () => requireLogin(() => undefined),
    onExplorePress: (tab) => goExplore(router, 'navigate', tab),
    onRoomPress: (post) =>
      goRoomDetail(router, post.id, {
        screen: 'interests',
        href: '/interests',
        tab: 'rooms',
      }),
    onRoomLikeChange: (post, liked) => requireLogin(() => setBoardLiked(post.id, liked)),
    onRoommatePress: (match) =>
      goRoommateDetail(router, match.id, {
        screen: 'interests',
        href: '/interests',
        tab: 'roommates',
      }),
    onRoommateLikeChange: (match, liked) => requireLogin(() => setMatchLiked(match.id, liked)),
  };
}

function toBoardQuery(filter: ExploreFilter, sort: ExploreSort): BoardListQuery {
  // 예산 슬라이더를 건드리지 않았으면 범위 파라미터를 보내지 않는다. 기본값(보증금 0~2000,
  // 월세 0~500)을 그대로 보내면 그 범위를 벗어난 관심 게시글이 목록에서 빠진다.
  const defaultBudget =
    filter.depositMin === INITIAL_EXPLORE_FILTER.depositMin &&
    filter.depositMax === INITIAL_EXPLORE_FILTER.depositMax &&
    filter.rentMin === INITIAL_EXPLORE_FILTER.rentMin &&
    filter.rentMax === INITIAL_EXPLORE_FILTER.rentMax;

  return {
    likedOnly: true,
    regionIds: filter.regions.map(regionBackendId).filter((id): id is number => id !== undefined),
    gender: filter.gender === 'male' ? 'MALE' : filter.gender === 'female' ? 'FEMALE' : undefined,
    minDeposit: defaultBudget ? undefined : filter.depositMin,
    maxDeposit: defaultBudget ? undefined : filter.depositMax,
    minMounthRent: defaultBudget ? undefined : filter.rentMin,
    maxMounthRent: defaultBudget ? undefined : filter.rentMax,
    roomTypeIds: filter.roomTypes
      .map(roomTypeBackendId)
      .filter((id): id is number => id !== undefined),
    sort: sort === 'views' ? 'hits,DESC' : 'createdAt,DESC',
  };
}

function sortPosts(posts: RoomPost[], sort: ExploreSort): RoomPost[] {
  const next = [...posts];
  if (sort === 'views') return next.sort((a, b) => b.views - a.views);
  return next.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
}
