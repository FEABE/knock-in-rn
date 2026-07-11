import { NotificationScreenView } from './notification-screen.view';
import { useNotificationScreen } from './use-notification-screen';

export function NotificationScreen() {
  const asks = useNotificationScreen();
  return <NotificationScreenView {...asks} />;
}
