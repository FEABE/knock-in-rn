import { useCallback } from 'react';

import type { UserSummary } from '@/lib/domain';

export type UseProfileCardProps = {
  user: UserSummary;
  visibility?: 'public' | 'hidden' | 'matched';
  onEdit?: () => void;
};

export type UseProfileCardReturn = {
  user: UserSummary;
  visibility: 'public' | 'hidden' | 'matched';
  visibilityLabel: string;
  onEdit: () => void;
  hasBadges: boolean;
};

const VISIBILITY_LABEL = {
  public: '공개 중',
  hidden: '숨김',
  matched: '매칭 완료',
} as const;

export function useProfileCard({
  user,
  visibility = 'public',
  onEdit: onEditProp,
}: UseProfileCardProps): UseProfileCardReturn {
  const onEdit = useCallback(() => onEditProp?.(), [onEditProp]);
  return {
    user,
    visibility,
    visibilityLabel: VISIBILITY_LABEL[visibility],
    onEdit,
    hasBadges: user.badges.length > 0,
  };
}
