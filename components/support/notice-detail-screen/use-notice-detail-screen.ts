import { useLocalSearchParams } from 'expo-router';

import { formatDateLabel, getBoNoticeDetail, useApi } from '@/lib/api';

export type UseNoticeDetailScreenReturn = {
  title: string;
  dateLabel: string;
  body: string;
  loading: boolean;
  error: string | null;
  retry: () => void;
};

export function useNoticeDetailScreen(): UseNoticeDetailScreenReturn {
  const { id } = useLocalSearchParams<{ id: string }>();
  const noticeId = id ?? '';
  const { data, loading, error, reload } = useApi(
    ['support', 'notices', noticeId],
    () => getBoNoticeDetail(noticeId),
    { enabled: Boolean(noticeId), retry: false },
  );

  const notice = data?.notice;

  return {
    title: notice?.title ?? '공지사항',
    dateLabel: formatDateLabel(notice?.createAt),
    body: notice?.contents ?? '',
    loading,
    error,
    retry: reload,
  };
}
