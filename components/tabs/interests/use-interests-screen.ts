import { useRouter } from 'expo-router';

import {
  useRoommateBoardLikeActions,
  useRoommateBoards,
  useRoommateMatchCards,
  useRoommateMatchLikeActions,
  type RoommateMatchCardModel,
} from '@/lib/api';
import { useModeration, type RoomPost } from '@/lib/domain';
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
  const { isPostBlocked, isUserBlocked } = useModeration();
  const { data: posts } = useRoommateBoards();
  const { data: matchList } = useRoommateMatchCards();
  const setBoardLiked = useRoommateBoardLikeActions();
  const setMatchLiked = useRoommateMatchLikeActions();

  const rooms = (posts ?? []).filter(
    (post) => post.liked === true && !isPostBlocked(post.id) && !isUserBlocked(post.author.id),
  );
  const likedMatches = (matchList ?? []).filter((match) => match.liked && !isUserBlocked(match.id));

  return {
    rooms,
    likedMatches,
    onExplorePress: () => goExplore(router),
    onRoomPress: (post) => goRoomDetail(router, post.id),
    onRoomLikeChange: (post, liked) => setBoardLiked(post.id, liked),
    onRoommatePress: (match) => goRoommateDetail(router, match.id),
    onRoommateLikeChange: (match, liked) => setMatchLiked(match.id, liked),
  };
}
