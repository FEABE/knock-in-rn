import { useRouter } from 'expo-router';
import { useMemo, useState } from 'react';

import type { GenderFilterValue } from '@/components/room/filters';
import { AnalyticsEvent, logEvent } from '@/lib/analytics';
import { useRoommateMatchList, type MatchListItem } from '@/lib/api';
import { useModeration, useRoomStore, type RoomPost } from '@/lib/domain';
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
  visibleMatches: MatchListItem[];
  matchesLoading: boolean;
  setSort: (next: ExploreSort) => void;
  setOpenSheet: (next: ExploreFilterKey | null) => void;
  handleFilterChange: (next: ExploreFilter) => void;
  onSearchPress: () => void;
  onOnboardingPress: () => void;
  onRoomPress: (post: RoomPost) => void;
  onRoommatePress: (match: MatchListItem) => void;
};

export function useExploreScreen(): UseExploreScreenReturn {
  const router = useRouter();
  const { posts } = useRoomStore();
  const { isPostBlocked, isUserBlocked } = useModeration();
  const [sort, setSort] = useState<ExploreSort>('latest');
  const [filter, setFilter] = useState<ExploreFilter>(INITIAL_EXPLORE_FILTER);
  const [openSheet, setOpenSheet] = useState<ExploreFilterKey | null>(null);

  const visiblePosts = useMemo(() => {
    const safe = posts.filter((post) => !isPostBlocked(post.id) && !isUserBlocked(post.author.id));
    return sortPosts(applyFilter(safe, filter), sort);
  }, [posts, isPostBlocked, isUserBlocked, filter, sort]);

  const { data: matchList, loading: matchesLoading } = useRoommateMatchList();
  const visibleMatches = useMemo(
    () => (matchList ?? []).filter((match) => !isUserBlocked(String(match.userId))),
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
    matchesLoading,
    setSort,
    setOpenSheet,
    handleFilterChange,
    onSearchPress: () => router.push('/room/search' as never),
    onOnboardingPress: () => router.push('/onboarding' as never),
    onRoomPress: (post) => {
      logEvent(AnalyticsEvent.ROOM_CARD_TAP, { room_id: post.id });
      router.push(`/room/${post.id}` as never);
    },
    onRoommatePress: (match) => {
      logEvent(AnalyticsEvent.ROOMMATE_CARD_TAP, { target_user_id: match.userId });
      router.push(`/roommate/${String(match.userId)}` as never);
    },
  };
}

function applyFilter(posts: RoomPost[], filter: ExploreFilter): RoomPost[] {
  return posts.filter((post) => {
    if (post.monthlyRent < filter.rentMin || post.monthlyRent > filter.rentMax) return false;
    if (post.deposit < filter.depositMin || post.deposit > filter.depositMax) return false;
    if (filter.gender !== 'any' && post.author.gender !== filter.gender) return false;
    if (
      filter.regions.length > 0 &&
      !filter.regions.some((region) => region.id === post.region.id)
    ) {
      return false;
    }
    if (filter.roomTypes.length > 0 && !filter.roomTypes.includes(post.roomType)) return false;
    return true;
  });
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
