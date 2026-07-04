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
};

export function useNoticeScreen(): UseNoticeScreenReturn {
  const { data, loading, error } = useSupportNotices();

  return {
    notices: data ?? [],
    loading,
    error,
  };
}
