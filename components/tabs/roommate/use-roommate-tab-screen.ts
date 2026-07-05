import { useRouter } from 'expo-router';
import { useEffect, useMemo, useState, type Dispatch, type SetStateAction } from 'react';

import { AnalyticsEvent, logEvent } from '@/lib/analytics';
import {
  type BoardListQuery,
  type RoommateMatchCardModel,
  useRoommateBoardLikeActions,
  useRoommateBoards,
  useRoommateMatchCards,
  useRoommateMatchLikeActions,
  regionKeyBackendId,
} from '@/lib/api';
import { useModeration, type ListFilter, type RoomPost, type SortKey } from '@/lib/domain';
import { goNewRoom, goRoomDetail, goRoommateDetail } from '@/lib/navigation/routes';

export type UseRoommateTabScreenReturn = {
  filter: ListFilter;
  filterOpen: boolean;
  filteredPosts: RoomPost[];
  visibleMatches: RoommateMatchCardModel[];
  postsLoading: boolean;
  postsError: string | null;
  matchesLoading: boolean;
  reloadPosts: () => void;
  setFilter: Dispatch<SetStateAction<ListFilter>>;
  setFilterOpen: (next: boolean) => void;
  onRoomPress: (post: RoomPost) => void;
  onRoomLikeChange: (post: RoomPost, liked: boolean) => void;
  onRoommatePress: (match: RoommateMatchCardModel) => void;
  onRoommateLikeChange: (match: RoommateMatchCardModel, liked: boolean) => void;
  onCreatePress: () => void;
};

export function useRoommateTabScreen(): UseRoommateTabScreenReturn {
  const router = useRouter();
  const [filter, setFilter] = useState<ListFilter>({ sort: 'latest' });
  const [filterOpen, setFilterOpen] = useState(false);
  const { isPostBlocked, isUserBlocked } = useModeration();
  const setBoardLiked = useRoommateBoardLikeActions();
  const setMatchLiked = useRoommateMatchLikeActions();

  const boardQuery = useMemo(() => mapFilterToQuery(filter), [filter]);
  const {
    data: apiPosts,
    loading: postsLoading,
    error: postsError,
    reload: reloadPosts,
  } = useRoommateBoards(boardQuery);
  const { data: matchList, loading: matchesLoading } = useRoommateMatchCards();

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
    () => (matchList ?? []).filter((match) => !isUserBlocked(match.id)),
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
    onCreatePress: () => goNewRoom(router),
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
  const region = filter.regionIds?.length ? regionKeyBackendId(filter.regionIds[0]) : undefined;
  return {
    minMounthRent: filter.rentMin,
    maxMounthRent: filter.rentMax,
    gender: filter.gender === 'male' ? 'MALE' : filter.gender === 'female' ? 'FEMALE' : undefined,
    region,
  };
}
