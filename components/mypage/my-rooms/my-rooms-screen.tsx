import { MyRoomsScreenView } from './my-rooms-screen.view';
import { useMyRoomsScreen } from './use-my-rooms-screen';

export function MyRoomsScreen() {
  const asks = useMyRoomsScreen();
  return <MyRoomsScreenView {...asks} />;
}
