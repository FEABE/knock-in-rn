import { RoomDetailScreenView } from './room-detail-screen.view';
import { useRoomDetailScreen } from './use-room-detail-screen';

export function RoomDetailScreen() {
  const asks = useRoomDetailScreen();
  return <RoomDetailScreenView {...asks} />;
}
