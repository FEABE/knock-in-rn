import { useRouter } from 'expo-router';
import { useMemo, useState } from 'react';

import {
  type BoardListQuery,
  regionBackendId,
  roomTypeBackendId,
  useRoommateBoardLikeActions,
  useRoommateBoards,
  useRoommateMatchCards,
  useRoommateMatchLikeActions,
  type RoommateMatchCardModel,
} from '@/lib/api';
import { useModeration, type RoomPost } from '@/lib/domain';
import { useRequireLogin } from '@/lib/auth';
import { goExplore, goRoomDetail, goRoommateDetail, goRoomSearch } from '@/lib/navigation/routes';

import {
  EXPLORE_SORT_OPTIONS,
  INITIAL_EXPLORE_FILTER,
  type ExploreFilter,
  type ExploreFilterKey,
  type ExploreSort,
} from '../explore/use-explore-screen';

export type UseInterestsScreenReturn = {
  rooms: RoomPost[];
  likedMatches: RoommateMatchCardModel[];
  isLoggedIn: boolean;
  filter: ExploreFilter;
  sort: ExploreSort;
  openSheet: ExploreFilterKey | null;
  roomsLoading: boolean;
  roomsRefreshing: boolean;
  roomsError: string | null;
  matchesLoading: boolean;
  matchesRefreshing: boolean;
  matchesError: string | null;
  reloadRooms: () => void;
  reloadMatches: () => void;
  sortLabel: string;
  setSort: (next: ExploreSort) => void;
  setOpenSheet: (next: ExploreFilterKey | null) => void;
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
  const { isPostBlocked, isUserBlocked } = useModeration();
  const { requireLogin, isLoggedIn } = useRequireLogin();
  const [filter, setFilter] = useState<ExploreFilter>(INITIAL_EXPLORE_FILTER);
  const [sort, setSort] = useState<ExploreSort>('latest');
  const [openSheet, setOpenSheet] = useState<ExploreFilterKey | null>(null);
  const boardQuery = useMemo(() => toBoardQuery(filter, sort), [filter, sort]);
  const {
    data: posts,
    loading: roomsLoading,
    refreshing: roomsRefreshing,
    error: roomsError,
    reload: reloadRooms,
  } = useRoommateBoards(boardQuery, isLoggedIn);
  const {
    data: matchList,
    loading: matchesLoading,
    refreshing: matchesRefreshing,
    error: matchesError,
    reload: reloadMatches,
  } = useRoommateMatchCards(isLoggedIn);
  const setBoardLiked = useRoommateBoardLikeActions();
  const setMatchLiked = useRoommateMatchLikeActions();

  const rooms = sortPosts(
    (posts ?? []).filter(
      (post) => post.liked === true && !isPostBlocked(post.id) && !isUserBlocked(post.author.id),
    ),
    sort,
  );
  const likedMatches = (matchList ?? []).filter((match) => match.liked && !isUserBlocked(match.id));

  return {
    rooms,
    likedMatches,
    isLoggedIn,
    filter,
    sort,
    openSheet,
    roomsLoading,
    roomsRefreshing,
    roomsError,
    matchesLoading,
    matchesRefreshing,
    matchesError,
    reloadRooms,
    reloadMatches,
    sortLabel: EXPLORE_SORT_OPTIONS.find((option) => option.value === sort)?.label ?? '정렬',
    setSort,
    setOpenSheet,
    setFilter,
    onSearchPress: () => goRoomSearch(router),
    onLoginPress: () => requireLogin(() => undefined),
    onExplorePress: (tab) => goExplore(router, 'navigate', tab),
    onRoomPress: (post) => goRoomDetail(router, post.id),
    onRoomLikeChange: (post, liked) => requireLogin(() => setBoardLiked(post.id, liked)),
    onRoommatePress: (match) => goRoommateDetail(router, match.id),
    onRoommateLikeChange: (match, liked) => requireLogin(() => setMatchLiked(match.id, liked)),
  };
}

function toBoardQuery(filter: ExploreFilter, sort: ExploreSort): BoardListQuery {
  return {
    regionIds: filter.regions.map(regionBackendId).filter((id): id is number => id !== undefined),
    gender: filter.gender === 'male' ? 'MALE' : filter.gender === 'female' ? 'FEMALE' : undefined,
    minDeposit: filter.depositMin,
    maxDeposit: filter.depositMax,
    minMounthRent: filter.rentMin,
    maxMounthRent: filter.rentMax,
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
