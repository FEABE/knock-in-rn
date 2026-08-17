import { useLocalSearchParams, useRouter } from 'expo-router';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useFocusEffect } from '@react-navigation/native';

import { useModerationSuccessToast } from '@/components/moderation/use-moderation-success-toast';
import type { GenderFilterValue } from '@/components/room/filters';
import { AnalyticsEvent, logEvent } from '@/lib/analytics';
import {
  type BoardListQuery,
  getPreferenceAll,
  regionBackendId,
  roomTypeBackendId,
  useRoommateBoardLikeActions,
  useRoommateBoardsInfinite,
  useRoommateMatchCardsInfinite,
  useRoommateMatchLikeActions,
  useAlarms,
  type RoommateMatchCardModel,
} from '@/lib/api';
import { useModeration, useMyProfileAuthor, useSession, type RoomPost } from '@/lib/domain';
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
  roomsLoadingMore: boolean;
  loadMoreRooms: () => void;
  matchesLoading: boolean;
  matchesRefreshing: boolean;
  matchesError: string | null;
  matchesLoadingMore: boolean;
  loadMoreMatches: () => void;
  hasUnreadAlarms: boolean;
  preferenceNudgeOpen: boolean;
  preferenceNudgeSnooze: boolean;
  toastMessage: string | null;
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
  const { applyToPosts: applyMyProfile } = useMyProfileAuthor();
  const setBoardLiked = useRoommateBoardLikeActions();
  const setMatchLiked = useRoommateMatchLikeActions();
  const [sort, setSort] = useState<ExploreSort>('latest');
  const [filter, setFilter] = useState<ExploreFilter>(INITIAL_EXPLORE_FILTER);
  const [activeTab, setActiveTab] = useState<ExploreRoomTab>('rooms');
  const [openSheet, setOpenSheet] = useState<ExploreFilterKey | null>(null);
  const [preferenceNudgeOpen, setPreferenceNudgeOpen] = useState(false);
  const [preferenceNudgeSnooze, setPreferenceNudgeSnooze] = useState(false);
  const moderationToast = useModerationSuccessToast('explore');
  const { data: alarms } = useAlarms(Boolean(session));

  // 다른 화면이 지정한 탭은 한 번만 적용한다. 쿼리를 남겨두면 상세에서 뒤로 올 때마다
  // 과거 탭이 다시 강제 선택되므로 적용 직후 제거한다.
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

  // 검색어는 서버 keyword 파라미터로 넘긴다(페이지 단위 클라이언트 필터링은
  // 무한 스크롤에서 페이지마다 구멍이 생기고, 검색 기록도 남지 않는다).
  const boardQuery = useMemo(
    () => mapFilterToQuery(filter, sort, searchQuery),
    [filter, sort, searchQuery],
  );
  const {
    data: posts,
    loading: roomsLoading,
    refreshing: roomsRefreshing,
    error: roomsError,
    refresh: reloadRooms,
    loadMore: loadMoreRooms,
    loadingMore: roomsLoadingMore,
  } = useRoommateBoardsInfinite(boardQuery);

  const visiblePosts = useMemo(() => {
    const safe = applyMyProfile(posts ?? []).filter(
      (post) => !isPostBlocked(post.id) && !isUserBlocked(post.author.id),
    );
    return sortPosts(safe, sort);
  }, [posts, applyMyProfile, isPostBlocked, isUserBlocked, sort]);

  const {
    data: matchList,
    loading: matchesLoading,
    refreshing: matchesRefreshing,
    error: matchesError,
    refresh: reloadMatches,
    loadMore: loadMoreMatches,
    loadingMore: matchesLoadingMore,
  } = useRoommateMatchCardsInfinite();
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
    hasUnreadAlarms: (alarms ?? []).some((alarm) => !alarm.isRead),
    preferenceNudgeOpen,
    preferenceNudgeSnooze,
    toastMessage: moderationToast?.message ?? null,
    reloadRooms,
    reloadMatches,
    setSort,
    setOpenSheet,
    handleFilterChange,
    onSearchPress: () => goRoomSearch(router, searchQuery),
    onSearchClear: () => router.replace('/explore' as never),
    onNotificationPress: () => requireLogin(() => goNotifications(router)),
    setPreferenceNudgeSnooze,
    onPreferenceNudgeClose: closePreferenceNudge,
    onPreferenceSetupPress: () => {
      setPreferenceNudgeOpen(false);
      goMypagePreferences(router);
    },
    onCreatePress: () => requireLogin(() => goNewRoom(router)),
    onRoomPress: (post) => {
      requireLogin(() => {
        logEvent(AnalyticsEvent.ROOM_CARD_TAP, { room_id: post.id });
        goRoomDetail(router, post.id, {
          screen: 'explore',
          href: searchQuery ? `/explore?q=${encodeURIComponent(searchQuery)}` : '/explore',
          tab: 'rooms',
        });
      });
    },
    onRoomLikeChange: (post, liked) =>
      requireLogin(() => {
        logEvent(liked ? AnalyticsEvent.ROOM_INTEREST_ADD : AnalyticsEvent.ROOM_INTEREST_REMOVE, {
          room_id: post.id,
        });
        setBoardLiked(post.id, liked);
      }),
    onRoommatePress: (match) => {
      requireLogin(() => {
        logEvent(AnalyticsEvent.ROOMMATE_CARD_TAP, { target_user_id: match.id });
        goRoommateDetail(router, match.id, {
          screen: 'explore',
          href: '/explore',
          tab: 'roommates',
        });
      });
    },
    onRoommateLikeChange: (match, liked) =>
      requireLogin(() => {
        if (liked) logEvent(AnalyticsEvent.ROOMMATE_INTEREST_ADD, { target_user_id: match.id });
        setMatchLiked(match.id, liked);
      }),
  };
}

function mapFilterToQuery(
  filter: ExploreFilter,
  sort: ExploreSort,
  keyword: string,
): BoardListQuery {
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
    keyword: keyword || undefined,
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
