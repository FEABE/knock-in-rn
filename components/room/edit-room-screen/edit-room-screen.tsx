import { EditRoomScreenView } from './edit-room-screen.view';
import { useEditRoomScreen } from './use-edit-room-screen';

export function EditRoomScreen() {
  const asks = useEditRoomScreen();
  return <EditRoomScreenView {...asks} />;
}
