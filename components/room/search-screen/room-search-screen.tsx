import { RoomSearchScreenView } from './room-search-screen.view';
import { useRoomSearchScreen } from './use-room-search-screen';

export function RoomSearchScreen() {
  const asks = useRoomSearchScreen();
  return <RoomSearchScreenView {...asks} />;
}
