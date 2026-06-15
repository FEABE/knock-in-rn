import { useRouter } from 'expo-router';
import { useEffect, useMemo, useState, type Dispatch, type SetStateAction } from 'react';

import { AnalyticsEvent, logEvent } from '@/lib/analytics';
import {
  type BoardListQuery,
  type MatchListItem,
  useRoommateBoards,
  useRoommateMatchList,
} from '@/lib/api';
import { useModeration, type ListFilter, type RoomPost, type SortKey } from '@/lib/domain';

export type UseRoommateTabScreenReturn = {
  filter: ListFilter;
  filterOpen: boolean;
  filteredPosts: RoomPost[];
  visibleMatches: MatchListItem[];
  postsLoading: boolean;
  postsError: string | null;
  matchesLoading: boolean;
  reloadPosts: () => void;
  setFilter: Dispatch<SetStateAction<ListFilter>>;
  setFilterOpen: (next: boolean) => void;
  onRoomPress: (post: RoomPost) => void;
  onRoommatePress: (match: MatchListItem) => void;
  onCreatePress: () => void;
};

export function useRoommateTabScreen(): UseRoommateTabScreenReturn {
  const router = useRouter();
  const [filter, setFilter] = useState<ListFilter>({ sort: 'latest' });
  const [filterOpen, setFilterOpen] = useState(false);
  const { isPostBlocked, isUserBlocked } = useModeration();

  const boardQuery = useMemo(() => mapFilterToQuery(filter), [filter]);
  const {
    data: apiPosts,
    loading: postsLoading,
    error: postsError,
    reload: reloadPosts,
  } = useRoommateBoards(boardQuery);
  const { data: matchList, loading: matchesLoading } = useRoommateMatchList();

  const filteredPosts = useMemo(
    () =>
      sortPosts(
        (apiPosts ?? []).filter(
          (post) => !isPostBlocked(post.id) && !isUserBlocked(post.author.id),
        ),
        filter.sort,
      ),
    [apiPosts, filter.sort, isPostBlocked, isUserBlocked],
  );

  const visibleMatches = useMemo(
    () => (matchList ?? []).filter((match) => !isUserBlocked(match.userId)),
    [matchList, isUserBlocked],
  );

  useEffect(() => {
    if (postsError) {
      logEvent(AnalyticsEvent.UI_ERROR_SHOWN, {
        screen_name: 'roommate',
        error_code: postsError,
      });
    }
  }, [postsError]);

  return {
    filter,
    filterOpen,
    filteredPosts,
    visibleMatches,
    postsLoading,
    postsError,
    matchesLoading,
    reloadPosts,
    setFilter,
    setFilterOpen,
    onRoomPress: (post) => {
      logEvent(AnalyticsEvent.ROOM_CARD_TAP, { room_id: post.id });
      router.push(`/room/${post.id}` as never);
    },
    onRoommatePress: (match) => {
      logEvent(AnalyticsEvent.ROOMMATE_CARD_TAP, { target_user_id: match.userId });
      router.push(`/roommate/${match.userId}` as never);
    },
    onCreatePress: () => router.push('/room/new' as never),
  };
}

function sortPosts(posts: RoomPost[], sort: SortKey): RoomPost[] {
  return [...posts].sort((a, b) => {
    if (sort === 'likes') return b.likes - a.likes;
    if (sort === 'views') return b.views - a.views;
    return b.createdAt.getTime() - a.createdAt.getTime();
  });
}

function mapFilterToQuery(filter: ListFilter): BoardListQuery {
  return {
    minMounthRent: filter.rentMin,
    maxMounthRent: filter.rentMax,
    gender: filter.gender && filter.gender !== 'any' ? filter.gender : undefined,
    region: filter.regionIds?.length ? filter.regionIds[0] : undefined,
    sort: filter.sort === 'latest' ? 'createdAt,desc' : undefined,
  };
}
