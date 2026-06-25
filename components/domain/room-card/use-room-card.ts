import { useCallback, useMemo } from 'react';

import type { RoomPost } from '@/lib/domain';

export type RoomCardBadge = 'new' | 'hot' | null;

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
  roomTypeLabel: string;
  regionLabel: string;
  badge: RoomCardBadge;
  timeAgoLabel: string;
};

function fmt(n: number): string {
  if (n >= 10000) return `${(n / 10000).toFixed(1)}억`;
  return `${n.toLocaleString()}만`;
}

const ROOM_TYPE_LABEL: Record<string, string> = {
  'one-room': '원룸',
  'two-room': '투룸',
  'three-room+': '쓰리룸+',
  officetel: '오피스텔',
  'share-house': '쉐어하우스',
  apt: '아파트',
  villa: '빌라',
};

function timeAgo(date: Date): string {
  const diffMs = Date.now() - date.getTime();
  const day = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  if (day <= 0) {
    const hour = Math.floor(diffMs / (1000 * 60 * 60));
    if (hour <= 0) return '방금 전';
    return `${hour}시간 전`;
  }
  if (day < 30) return `${day}일 전`;
  const month = Math.floor(day / 30);
  if (month < 12) return `${month}달 전`;
  return `${Math.floor(month / 12)}년 전`;
}

function pickBadge(post: RoomPost): RoomCardBadge {
  const diffDay = Math.floor((Date.now() - post.createdAt.getTime()) / (1000 * 60 * 60 * 24));
  if (diffDay <= 3) return 'new';
  if (post.likes >= 25 || post.views >= 300) return 'hot';
  return null;
}

export function useRoomCard({
  post,
  onPress: onPressProp,
  onLikeChange,
}: UseRoomCardProps): UseRoomCardReturn {
  const liked = !!post.liked;

  const toggleLike = useCallback(() => {
    onLikeChange?.(post, !liked);
  }, [liked, onLikeChange, post]);

  const onPress = useCallback(() => onPressProp?.(post), [onPressProp, post]);

  const priceLabel = useMemo(
    () => `보증금 ${fmt(post.deposit)} / 월세 ${fmt(post.monthlyRent)}`,
    [post.deposit, post.monthlyRent],
  );

  const roomTypeLabel = useMemo(
    () => ROOM_TYPE_LABEL[post.roomType] ?? post.roomType,
    [post.roomType],
  );

  const regionLabel = useMemo(() => `${post.region.city} ${post.region.district}`, [post.region]);

  const badge = useMemo(() => pickBadge(post), [post]);
  const timeAgoLabel = useMemo(() => timeAgo(post.createdAt), [post.createdAt]);

  return {
    post,
    liked,
    toggleLike,
    onPress,
    priceLabel,
    roomTypeLabel,
    regionLabel,
    badge,
    timeAgoLabel,
  };
}
