import { useRouter } from 'expo-router';

import {
  useRoommateMatchCards,
  useRoommateMatchLikeActions,
  type RoommateMatchCardModel,
} from '@/lib/api';
import { useModeration, useRoomStore, type RoomPost } from '@/lib/domain';
import { goExplore, goRoomDetail, goRoommateDetail } from '@/lib/navigation/routes';

export type UseInterestsScreenReturn = {
  rooms: RoomPost[];
  likedMatches: RoommateMatchCardModel[];
  onExplorePress: () => void;
  onRoomPress: (post: RoomPost) => void;
  onRoomLikeChange: (post: RoomPost, liked: boolean) => void;
  onRoommatePress: (match: RoommateMatchCardModel) => void;
  onRoommateLikeChange: (match: RoommateMatchCardModel, liked: boolean) => void;
};

export function useInterestsScreen(): UseInterestsScreenReturn {
  const router = useRouter();
  const { posts, update } = useRoomStore();
  const { isPostBlocked, isUserBlocked } = useModeration();
  const { data: matchList } = useRoommateMatchCards();
  const setMatchLiked = useRoommateMatchLikeActions();

  const rooms = posts.filter(
    (post) => post.liked === true && !isPostBlocked(post.id) && !isUserBlocked(post.author.id),
  );
  const likedMatches = (matchList ?? []).filter((match) => match.liked && !isUserBlocked(match.id));

  return {
    rooms,
    likedMatches,
    onExplorePress: () => goExplore(router),
    onRoomPress: (post) => goRoomDetail(router, post.id),
    onRoomLikeChange: (post, liked) => update(post.id, { liked }),
    onRoommatePress: (match) => goRoommateDetail(router, match.id),
    onRoommateLikeChange: (match, liked) => setMatchLiked(match.id, liked),
  };
}
