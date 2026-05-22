import {
  RoommateCardView,
  type RoommateCardViewProps,
} from './roommate-card.view';
import {
  useRoommateCard,
  type UseRoommateCardProps,
} from './use-roommate-card';

export type RoommateCardProps = UseRoommateCardProps &
  Omit<
    RoommateCardViewProps,
    keyof ReturnType<typeof useRoommateCard>
  >;

export function RoommateCard({
  card,
  onPress,
  onLikeChange,
  ...rest
}: RoommateCardProps) {
  const asks = useRoommateCard({ card, onPress, onLikeChange });
  return <RoommateCardView {...asks} {...rest} />;
}
