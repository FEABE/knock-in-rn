import { useSupportNotices } from '@/lib/api';

export type NoticeListItem = {
  id: string;
  title: string;
  body: string;
  dateLabel: string;
};

export type UseNoticeScreenReturn = {
  notices: NoticeListItem[];
  loading: boolean;
  error: string | null;
  unavailable: boolean;
};

export function useNoticeScreen(): UseNoticeScreenReturn {
  const state = useSupportNotices();
  return {
    notices: state.data ?? [],
    loading: state.loading,
    error: state.error,
    unavailable: false,
  };
}
