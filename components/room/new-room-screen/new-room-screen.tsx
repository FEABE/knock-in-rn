import { useRoomPostForm } from '@/components/room/use-room-post-form';

import { NewRoomScreenView } from './new-room-screen.view';
import { useNewRoomScreen } from './use-new-room-screen';

export function NewRoomScreen() {
  const asks = useNewRoomScreen();
  const form = useRoomPostForm({ onSubmit: asks.onSubmit, mode: 'create' });
  return <NewRoomScreenView {...asks} form={form} />;
}
