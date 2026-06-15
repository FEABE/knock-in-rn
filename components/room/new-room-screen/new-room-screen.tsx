import { NewRoomScreenView } from './new-room-screen.view';
import { useNewRoomScreen } from './use-new-room-screen';

export function NewRoomScreen() {
  const asks = useNewRoomScreen();
  return <NewRoomScreenView {...asks} />;
}
