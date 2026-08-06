import { useLocalSearchParams, useRouter } from 'expo-router';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useFocusEffect } from '@react-navigation/native';

import type { GenderFilterValue } from '@/components/room/filters';
import { AnalyticsEvent, logEvent } from '@/lib/analytics';
import {
  type BoardListQuery,
  regionBackendId,
  roomTypeBackendId,
  useMyRoommateBoards,
  useRoommateBoardLikeActions,
  useRoommateBoards,
  useRoommateMatchCards,
  useRoommateMatchLikeActions,
  useAlarms,
  type RoommateMatchCardModel,
  getPreferenceAll,
} from '@/lib/api';
import { useModeration, useSession, type RoomPost } from '@/lib/domain';
import { useRequireLogin } from '@/lib/auth';
import {
  goNotifications,
  goNewRoom,
  goRoomDetail,
  goRoommateDetail,
  goRoomSearch,
  goMypagePreferences,
} from '@/lib/navigation/routes';
import type { Region, RoomType } from '@/lib/onboarding';
import {
  isPreferenceNudgeSnoozed,
  snoozePreferenceNudgeForWeek,
} from '@/lib/preferences/nudge-storage';

export type ExploreSort = 'latest' | 'views';
export type ExploreFilterKey = 'sort' | 'region' | 'gender' | 'budget' | 'roomType';

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

export type ExploreRoomTab = 'rooms' | 'roommates';

export type UseExploreScreenReturn = {
  sort: ExploreSort;
  filter: ExploreFilter;
  searchQuery: string;
  activeTab: ExploreRoomTab;
  setActiveTab: (next: ExploreRoomTab) => void;
  openSheet: ExploreFilterKey | null;
  visiblePosts: RoomPost[];
  visibleMatches: RoommateMatchCardModel[];
  roomsLoading: boolean;
  roomsRefreshing: boolean;
  roomsError: string | null;
  matchesLoading: boolean;
  matchesRefreshing: boolean;
  matchesError: string | null;
  hasUnreadAlarms: boolean;
  preferenceNudgeOpen: boolean;
  preferenceNudgeSnooze: boolean;
  reloadRooms: () => void;
  reloadMatches: () => void;
  setSort: (next: ExploreSort) => void;
  setOpenSheet: (next: ExploreFilterKey | null) => void;
  handleFilterChange: (next: ExploreFilter) => void;
  onSearchPress: () => void;
  onSearchClear: () => void;
  onNotificationPress: () => void;
  setPreferenceNudgeSnooze: (next: boolean) => void;
  onPreferenceNudgeClose: () => void;
  onPreferenceSetupPress: () => void;
  onCreatePress: () => void;
  onRoomPress: (post: RoomPost) => void;
  onRoomLikeChange: (post: RoomPost, liked: boolean) => void;
  onRoommatePress: (match: RoommateMatchCardModel) => void;
  onRoommateLikeChange: (match: RoommateMatchCardModel, liked: boolean) => void;
};

export function useExploreScreen(): UseExploreScreenReturn {
  const router = useRouter();
  const { q, tab } = useLocalSearchParams<{ q?: string; tab?: string }>();
  const searchQuery = typeof q === 'string' ? q.trim() : '';
  const { session } = useSession();
  const { requireLogin } = useRequireLogin();
  const { isPostBlocked, isUserBlocked } = useModeration();
  const setBoardLiked = useRoommateBoardLikeActions();
  const setMatchLiked = useRoommateMatchLikeActions();
  const [sort, setSort] = useState<ExploreSort>('latest');
  const [filter, setFilter] = useState<ExploreFilter>(INITIAL_EXPLORE_FILTER);
  const [activeTab, setActiveTab] = useState<ExploreRoomTab>('rooms');
  const [openSheet, setOpenSheet] = useState<ExploreFilterKey | null>(null);
  const [preferenceNudgeOpen, setPreferenceNudgeOpen] = useState(false);
  const [preferenceNudgeSnooze, setPreferenceNudgeSnooze] = useState(false);
  const { data: alarms } = useAlarms(Boolean(session));

  // 탐색 탭바가 화면 스택에 남아있는 상태에서 다시 진입해도(관심 등 다른 화면에서 특정
  // 탭을 지정해 들어온 경우) 이전에 보던 탭이 아니라 요청받은 탭으로 강제 전환한다.
  useEffect(() => {
    if (tab === 'rooms' || tab === 'roommates') setActiveTab(tab);
  }, [tab]);

  const boardQuery = useMemo(() => mapFilterToQuery(filter, sort), [filter, sort]);
  const {
    data: posts,
    loading: roomsLoading,
    error: roomsError,
    reload: reloadPublicRooms,
  } = useRoommateBoards(boardQuery);
  const {
    data: myPosts,
    loading: myRoomsLoading,
    reload: reloadMyRooms,
  } = useMyRoommateBoards(Boolean(session));
  const [roomsPullRefreshing, setRoomsPullRefreshing] = useState(false);

  const reloadRoomLists = useCallback(
    () =>
      Promise.all([Promise.resolve(reloadPublicRooms()), Promise.resolve(reloadMyRooms())]).then(
        () => undefined,
      ),
    [reloadPublicRooms, reloadMyRooms],
  );

  const refreshRoomLists = useCallback(() => {
    setRoomsPullRefreshing(true);
    void reloadRoomLists().finally(() => setRoomsPullRefreshing(false));
  }, [reloadRoomLists]);

  useFocusEffect(
    useCallback(() => {
      void reloadRoomLists();
    }, [reloadRoomLists]),
  );

  const visiblePosts = useMemo(() => {
    const merged = mergeRoomPosts(posts ?? [], myPosts ?? []);
    const safe = merged.filter((post) => !isPostBlocked(post.id) && !isUserBlocked(post.author.id));
    return sortPosts(filterRoomsBySearch(filterRoomsByFilter(safe, filter), searchQuery), sort);
  }, [posts, myPosts, isPostBlocked, isUserBlocked, filter, searchQuery, sort]);

  const {
    data: matchList,
    loading: matchesLoading,
    refreshing: matchesRefreshing,
    error: matchesError,
    reload: reloadMatches,
  } = useRoommateMatchCards();
  const visibleMatches = useMemo(
    () => (matchList ?? []).filter((match) => !isUserBlocked(match.id)),
    [matchList, isUserBlocked],
  );

  const handleFilterChange = (next: ExploreFilter) => {
    logChangedFilters(filter, next);
    setFilter(next);
  };

  useEffect(() => {
    if (!session) {
      setPreferenceNudgeOpen(false);
      return;
    }

    let mounted = true;
    Promise.all([getPreferenceAll(), isPreferenceNudgeSnoozed()]).then(
      ([preferenceResponse, snoozed]) => {
        if (!mounted || snoozed || preferenceResponse.status !== 200 || preferenceResponse.error) {
          return;
        }

        const data = preferenceResponse.data;
        const completed =
          (data?.lifestyles?.length ?? 0) > 0 || (data?.conditions?.length ?? 0) > 0;
        setPreferenceNudgeOpen(!completed);
      },
    );

    return () => {
      mounted = false;
    };
  }, [session]);

  const closePreferenceNudge = () => {
    setPreferenceNudgeOpen(false);
    if (preferenceNudgeSnooze) void snoozePreferenceNudgeForWeek();
  };

  return {
    sort,
    filter,
    searchQuery,
    activeTab,
    setActiveTab,
    openSheet,
    visiblePosts,
    visibleMatches,
    roomsLoading: roomsLoading || myRoomsLoading,
    roomsRefreshing: roomsPullRefreshing,
    roomsError,
    matchesLoading,
    matchesRefreshing,
    matchesError,
    hasUnreadAlarms: (alarms ?? []).some((alarm) => !alarm.isRead),
    preferenceNudgeOpen,
    preferenceNudgeSnooze,
    reloadRooms: refreshRoomLists,
    reloadMatches,
    setSort,
    setOpenSheet,
    handleFilterChange,
    onSearchPress: () => goRoomSearch(router, searchQuery),
    onSearchClear: () => router.replace('/explore' as never),
    onNotificationPress: () => goNotifications(router),
    setPreferenceNudgeSnooze,
    onPreferenceNudgeClose: closePreferenceNudge,
    onPreferenceSetupPress: () => {
      setPreferenceNudgeOpen(false);
      goMypagePreferences(router);
    },
    onCreatePress: () => requireLogin(() => goNewRoom(router)),
    onRoomPress: (post) => {
      logEvent(AnalyticsEvent.ROOM_CARD_TAP, { room_id: post.id });
      goRoomDetail(router, post.id);
    },
    onRoomLikeChange: (post, liked) =>
      requireLogin(() => {
        logEvent(liked ? AnalyticsEvent.ROOM_INTEREST_ADD : AnalyticsEvent.ROOM_INTEREST_REMOVE, {
          room_id: post.id,
        });
        setBoardLiked(post.id, liked);
      }),
    onRoommatePress: (match) => {
      logEvent(AnalyticsEvent.ROOMMATE_CARD_TAP, { target_user_id: match.id });
      goRoommateDetail(router, match.id);
    },
    onRoommateLikeChange: (match, liked) =>
      requireLogin(() => {
        if (liked) logEvent(AnalyticsEvent.ROOMMATE_INTEREST_ADD, { target_user_id: match.id });
        setMatchLiked(match.id, liked);
      }),
  };
}

function normalizeSearchValue(value: string): string {
  return value.toLocaleLowerCase().replace(/\s+/g, '');
}

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

function filterRoomsByFilter(posts: RoomPost[], filter: ExploreFilter): RoomPost[] {
  return posts.filter((post) => {
    const matchesRegion =
      filter.regions.length === 0 ||
      filter.regions.some(
        (region) =>
          region.id === post.region.id ||
          (region.city === post.region.city && region.district === post.region.district),
      );
    const matchesRoomType =
      filter.roomTypes.length === 0 || filter.roomTypes.includes(post.roomType);
    const matchesBudget =
      post.deposit >= filter.depositMin &&
      post.deposit <= filter.depositMax &&
      post.monthlyRent >= filter.rentMin &&
      post.monthlyRent <= filter.rentMax;
    return matchesRegion && matchesRoomType && matchesBudget;
  });
}

function mergeRoomPosts(posts: RoomPost[], myPosts: RoomPost[]): RoomPost[] {
  const byId = new Map<string, RoomPost>();
  for (const post of posts) byId.set(post.id, post);
  for (const post of myPosts) byId.set(post.id, post);
  return [...byId.values()];
}

function mapFilterToQuery(filter: ExploreFilter, sort: ExploreSort): BoardListQuery {
  const defaultBudget =
    filter.depositMin === INITIAL_EXPLORE_FILTER.depositMin &&
    filter.depositMax === INITIAL_EXPLORE_FILTER.depositMax &&
    filter.rentMin === INITIAL_EXPLORE_FILTER.rentMin &&
    filter.rentMax === INITIAL_EXPLORE_FILTER.rentMax;

  return {
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
