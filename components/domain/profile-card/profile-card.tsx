import {
  ProfileCardView,
  type ProfileCardViewProps,
} from './profile-card.view';
import { useProfileCard, type UseProfileCardProps } from './use-profile-card';

export type ProfileCardProps = UseProfileCardProps &
  Omit<ProfileCardViewProps, keyof ReturnType<typeof useProfileCard>>;

export function ProfileCard({
  user,
  visibility,
  onEdit,
  ...rest
}: ProfileCardProps) {
  const asks = useProfileCard({ user, visibility, onEdit });
  return <ProfileCardView {...asks} {...rest} />;
}
