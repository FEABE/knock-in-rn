import { useCallback, useMemo, useState } from 'react';

import type { RoomPost } from '@/lib/domain';

export type UseRoomCardProps = {
  post: RoomPost;
  onPress?: (post: RoomPost) => void;
  onLikeChange?: (post: RoomPost, liked: boolean) => void;
};

export type UseRoomCardReturn = {
  post: RoomPost;
  liked: boolean;
  toggleLike: () => void;
  onPress: () => void;
  priceLabel: string;
  metaLabel: string;
};

function fmt(n: number): string {
  if (n >= 10000) return `${(n / 10000).toFixed(1)}억`;
  return `${n.toLocaleString()}만원`;
}

export function useRoomCard({
  post,
  onPress: onPressProp,
  onLikeChange,
}: UseRoomCardProps): UseRoomCardReturn {
  const [liked, setLiked] = useState(!!post.liked);

  const toggleLike = useCallback(() => {
    setLiked((prev) => {
      const next = !prev;
      onLikeChange?.(post, next);
      return next;
    });
  }, [onLikeChange, post]);

  const onPress = useCallback(
    () => onPressProp?.(post),
    [onPressProp, post],
  );

  const priceLabel = useMemo(
    () => `보증금 ${fmt(post.deposit)} / 월세 ${fmt(post.monthlyRent)}`,
    [post.deposit, post.monthlyRent],
  );

  const metaLabel = useMemo(
    () =>
      `조회 ${post.views.toLocaleString()} · 관심 ${post.likes.toLocaleString()}`,
    [post.views, post.likes],
  );

  return {
    post,
    liked,
    toggleLike,
    onPress,
    priceLabel,
    metaLabel,
  };
}
