import { useCallback, useState } from 'react';

import type { RoommateCard } from '@/lib/domain';

export type UseRoommateCardProps = {
  card: RoommateCard;
  onPress?: (card: RoommateCard) => void;
  onLikeChange?: (card: RoommateCard, liked: boolean) => void;
};

export type UseRoommateCardReturn = {
  card: RoommateCard;
  liked: boolean;
  toggleLike: () => void;
  onPress: () => void;
  budgetLabel: string | null;
  scoreLabel: string | null;
};

export function useRoommateCard({
  card,
  onPress: onPressProp,
  onLikeChange,
}: UseRoommateCardProps): UseRoommateCardReturn {
  const [liked, setLiked] = useState(!!card.liked);

  const toggleLike = useCallback(() => {
    setLiked((prev) => {
      const next = !prev;
      onLikeChange?.(card, next);
      return next;
    });
  }, [card, onLikeChange]);

  const onPress = useCallback(
    () => onPressProp?.(card),
    [card, onPressProp],
  );

  const budgetLabel =
    card.budgetMin !== undefined && card.budgetMax !== undefined
      ? `예산 ${card.budgetMin}~${card.budgetMax}만원`
      : null;

  const scoreLabel =
    typeof card.compatibilityScore === 'number'
      ? `궁합 ${card.compatibilityScore}점`
      : null;

  return {
    card,
    liked,
    toggleLike,
    onPress,
    budgetLabel,
    scoreLabel,
  };
}
