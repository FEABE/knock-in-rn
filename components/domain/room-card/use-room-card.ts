import { useCallback, useMemo } from 'react';

import type { RoomPost } from '@/lib/domain';

export type RoomCardBadge = 'hot' | null;

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
  authorMetaLabel: string | null;
  authorMetaTone: 'male' | 'female' | 'neutral';
  badge: RoomCardBadge;
  timeAgoLabel: string;
};

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
  return post.listBadge ?? null;
}

const GENDER_META: Record<string, { symbol: string; label: string }> = {
  female: { symbol: '♀', label: '여성' },
  male: { symbol: '♂', label: '남성' },
};

function buildAuthorMetaLabel(age: number, gender: string): string | null {
  const meta = GENDER_META[gender];
  const ageLabel = age > 0 ? `${age}세` : null;
  if (!meta) return ageLabel;
  if (!ageLabel) return `${meta.symbol} ${meta.label}`;
  return `${meta.symbol} ${ageLabel} · ${meta.label}`;
}

function authorMetaTone(gender: string): UseRoomCardReturn['authorMetaTone'] {
  if (gender === 'male') return 'male';
  if (gender === 'female') return 'female';
  return 'neutral';
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

  // 디자인 표기: "월세 1,000/55/5" (보증금/월세/관리비, 만 단위)
  const priceLabel = useMemo(
    () =>
      [post.deposit, post.monthlyRent, post.maintenanceFee ?? 0]
        .map((amount) => amount.toLocaleString())
        .join('/'),
    [post.deposit, post.monthlyRent, post.maintenanceFee],
  );

  const roomTypeLabel = useMemo(
    () => ROOM_TYPE_LABEL[post.roomType] ?? post.roomType,
    [post.roomType],
  );

  const regionLabel = useMemo(() => `${post.region.city} ${post.region.district}`, [post.region]);

  const authorMetaLabel = useMemo(
    () => buildAuthorMetaLabel(post.author.age, post.author.gender),
    [post.author.age, post.author.gender],
  );
  const authorMetaToneValue = useMemo(
    () => authorMetaTone(post.author.gender),
    [post.author.gender],
  );

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
    authorMetaLabel,
    authorMetaTone: authorMetaToneValue,
    badge,
    timeAgoLabel,
  };
}
