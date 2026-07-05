import { useRouter } from 'expo-router';
import { useMemo, useState } from 'react';

import type { GenderFilterValue } from '@/components/room/filters';
import { AnalyticsEvent, logEvent } from '@/lib/analytics';
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
import {
  goOnboarding,
  goRoomDetail,
  goRoommateDetail,
  goRoomSearch,
} from '@/lib/navigation/routes';
import type { Region, RoomType } from '@/lib/onboarding';

export type ExploreSort = 'latest' | 'views';
export type ExploreFilterKey = 'region' | 'gender' | 'budget' | 'roomType';

export type ExploreFilter = {
  regions: Region[];
  gender: GenderFilterValue;
  rentMin: number;
  rentMax: number;
  depositMin: number;
  depositMax: number;
  roomTypes: RoomType[];
};

export const INITIAL_EXPLORE_FILTER: ExploreFilter = {
  regions: [],
  gender: 'any',
  rentMin: 0,
  rentMax: 500,
  depositMin: 0,
  depositMax: 2000,
  roomTypes: [],
};

export const EXPLORE_SORT_OPTIONS: { value: ExploreSort; label: string }[] = [
  { value: 'latest', label: '최신순' },
  { value: 'views', label: '조회순' },
];

export type UseExploreScreenReturn = {
  sort: ExploreSort;
  filter: ExploreFilter;
  openSheet: ExploreFilterKey | null;
  visiblePosts: RoomPost[];
  visibleMatches: RoommateMatchCardModel[];
  roomsLoading: boolean;
  matchesLoading: boolean;
  setSort: (next: ExploreSort) => void;
  setOpenSheet: (next: ExploreFilterKey | null) => void;
  handleFilterChange: (next: ExploreFilter) => void;
  onSearchPress: () => void;
  onOnboardingPress: () => void;
  onRoomPress: (post: RoomPost) => void;
  onRoomLikeChange: (post: RoomPost, liked: boolean) => void;
  onRoommatePress: (match: RoommateMatchCardModel) => void;
  onRoommateLikeChange: (match: RoommateMatchCardModel, liked: boolean) => void;
};

export function useExploreScreen(): UseExploreScreenReturn {
  const router = useRouter();
  const { isPostBlocked, isUserBlocked } = useModeration();
  const setBoardLiked = useRoommateBoardLikeActions();
  const setMatchLiked = useRoommateMatchLikeActions();
  const [sort, setSort] = useState<ExploreSort>('latest');
  const [filter, setFilter] = useState<ExploreFilter>(INITIAL_EXPLORE_FILTER);
  const [openSheet, setOpenSheet] = useState<ExploreFilterKey | null>(null);
  const boardQuery = useMemo(() => mapFilterToQuery(filter, sort), [filter, sort]);
  const { data: posts, loading: roomsLoading } = useRoommateBoards(boardQuery);

  const visiblePosts = useMemo(() => {
    const safe = (posts ?? []).filter(
      (post) => !isPostBlocked(post.id) && !isUserBlocked(post.author.id),
    );
    return sortPosts(safe, sort);
  }, [posts, isPostBlocked, isUserBlocked, sort]);

  const { data: matchList, loading: matchesLoading } = useRoommateMatchCards();
  const visibleMatches = useMemo(
    () => (matchList ?? []).filter((match) => !isUserBlocked(match.id)),
    [matchList, isUserBlocked],
  );

  const handleFilterChange = (next: ExploreFilter) => {
    logChangedFilters(filter, next);
    setFilter(next);
  };

  return {
    sort,
    filter,
    openSheet,
    visiblePosts,
    visibleMatches,
    roomsLoading,
    matchesLoading,
    setSort,
    setOpenSheet,
    handleFilterChange,
    onSearchPress: () => goRoomSearch(router),
    onOnboardingPress: () => goOnboarding(router),
    onRoomPress: (post) => {
      logEvent(AnalyticsEvent.ROOM_CARD_TAP, { room_id: post.id });
      goRoomDetail(router, post.id);
    },
    onRoomLikeChange: (post, liked) => {
      logEvent(liked ? AnalyticsEvent.ROOM_INTEREST_ADD : AnalyticsEvent.ROOM_INTEREST_REMOVE, {
        room_id: post.id,
      });
      setBoardLiked(post.id, liked);
    },
    onRoommatePress: (match) => {
      logEvent(AnalyticsEvent.ROOMMATE_CARD_TAP, { target_user_id: match.id });
      goRoommateDetail(router, match.id);
    },
    onRoommateLikeChange: (match, liked) => {
      if (liked) logEvent(AnalyticsEvent.ROOMMATE_INTEREST_ADD, { target_user_id: match.id });
      setMatchLiked(match.id, liked);
    },
  };
}

function mapFilterToQuery(filter: ExploreFilter, sort: ExploreSort): BoardListQuery {
  void sort;
  return {
    region: filter.regions.length ? regionBackendId(filter.regions[0]) : undefined,
    gender: filter.gender === 'male' ? 'MALE' : filter.gender === 'female' ? 'FEMALE' : undefined,
    minDeposit: filter.depositMin,
    maxDeposit: filter.depositMax,
    minMounthRent: filter.rentMin,
    maxMounthRent: filter.rentMax,
    type: filter.roomTypes.length ? roomTypeBackendId(filter.roomTypes[0]) : undefined,
  };
}

function sortPosts(posts: RoomPost[], sort: ExploreSort): RoomPost[] {
  const next = [...posts];
  if (sort === 'views') return next.sort((a, b) => b.views - a.views);
  return next.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
}

function logChangedFilters(prev: ExploreFilter, next: ExploreFilter) {
  if (
    next.regions.length !== prev.regions.length ||
    next.regions.some((region, index) => region.id !== prev.regions[index]?.id)
  ) {
    logEvent(AnalyticsEvent.FILTER_APPLY, {
      filter_type: 'region',
      filter_value: next.regions.map((region) => region.id).join(',') || 'none',
    });
  }
  if (next.gender !== prev.gender) {
    logEvent(AnalyticsEvent.FILTER_APPLY, { filter_type: 'gender', filter_value: next.gender });
  }
  if (
    next.rentMin !== prev.rentMin ||
    next.rentMax !== prev.rentMax ||
    next.depositMin !== prev.depositMin ||
    next.depositMax !== prev.depositMax
  ) {
    logEvent(AnalyticsEvent.FILTER_APPLY, {
      filter_type: 'budget',
      filter_value: `rent ${next.rentMin}-${next.rentMax} / deposit ${next.depositMin}-${next.depositMax}`,
    });
  }
  if (
    next.roomTypes.length !== prev.roomTypes.length ||
    next.roomTypes.some((roomType) => !prev.roomTypes.includes(roomType))
  ) {
    logEvent(AnalyticsEvent.FILTER_APPLY, {
      filter_type: 'roomType',
      filter_value: next.roomTypes.join(',') || 'none',
    });
  }
}
