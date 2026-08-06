import { useRouter } from 'expo-router';

import { useSupportNotices } from '@/lib/api';
import { goSupportNoticeDetail } from '@/lib/navigation/routes';

export type NoticeListItem = {
  id: string;
  title: string;
  dateLabel: string;
};

export type UseNoticeScreenReturn = {
  notices: NoticeListItem[];
  loading: boolean;
  refreshing: boolean;
  error: string | null;
  unavailable: boolean;
  retry: () => void;
  onNoticePress: (id: string) => void;
};

export function useNoticeScreen(): UseNoticeScreenReturn {
  const router = useRouter();
  const state = useSupportNotices();
  return {
    notices: state.data ?? [],
    loading: state.loading,
    refreshing: state.refreshing,
    error: state.error,
    unavailable: false,
    retry: state.reload,
    onNoticePress: (id) => goSupportNoticeDetail(router, id),
  };
}
