import { NoticeDetailScreenView } from './notice-detail-screen.view';
import { useNoticeDetailScreen } from './use-notice-detail-screen';

export function NoticeDetailScreen() {
  const asks = useNoticeDetailScreen();
  return <NoticeDetailScreenView {...asks} />;
}
