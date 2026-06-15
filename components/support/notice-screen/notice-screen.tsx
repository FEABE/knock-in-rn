import { NoticeScreenView } from './notice-screen.view';
import { useNoticeScreen } from './use-notice-screen';

export function NoticeScreen() {
  const asks = useNoticeScreen();
  return <NoticeScreenView {...asks} />;
}
