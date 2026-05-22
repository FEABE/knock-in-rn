import { RoomCardView, type RoomCardViewProps } from './room-card.view';
import { useRoomCard, type UseRoomCardProps } from './use-room-card';

export type RoomCardProps = UseRoomCardProps &
  Omit<RoomCardViewProps, keyof ReturnType<typeof useRoomCard>>;

export function RoomCard({ post, onPress, onLikeChange, ...rest }: RoomCardProps) {
  const asks = useRoomCard({ post, onPress, onLikeChange });
  return <RoomCardView {...asks} {...rest} />;
}
