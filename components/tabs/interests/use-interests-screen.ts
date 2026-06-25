import { useRouter } from 'expo-router';
import { useState } from 'react';

import { useRoommateMatchList, type MatchListItem } from '@/lib/api';
import { useModeration, useRoomStore, type RoomPost } from '@/lib/domain';

export type UseInterestsScreenReturn = {
  rooms: RoomPost[];
  likedMatches: MatchListItem[];
  onExplorePress: () => void;
  onRoomPress: (post: RoomPost) => void;
  onRoomLikeChange: (post: RoomPost, liked: boolean) => void;
  onRoommatePress: (match: MatchListItem) => void;
};

export function useInterestsScreen(): UseInterestsScreenReturn {
  const router = useRouter();
  const { posts } = useRoomStore();
  const { isPostBlocked, isUserBlocked } = useModeration();
  const { data: matchList } = useRoommateMatchList();

  const [likedRooms, setLikedRooms] = useState<string[]>(
    [posts[0]?.id, posts[2]?.id].filter(Boolean) as string[],
  );

  const rooms = posts.filter(
    (post) =>
      likedRooms.includes(post.id) && !isPostBlocked(post.id) && !isUserBlocked(post.author.id),
  );
  const likedMatches = (matchList ?? []).filter(
    (match) => match.isLike === true && !isUserBlocked(String(match.userId)),
  );

  return {
    rooms,
    likedMatches,
    onExplorePress: () => router.push('/explore' as never),
    onRoomPress: (post) => router.push(`/room/${post.id}` as never),
    onRoomLikeChange: (post, liked) =>
      setLikedRooms((prev) =>
        liked ? Array.from(new Set([...prev, post.id])) : prev.filter((id) => id !== post.id),
      ),
    onRoommatePress: (match) => router.push(`/roommate/${String(match.userId)}` as never),
  };
}
