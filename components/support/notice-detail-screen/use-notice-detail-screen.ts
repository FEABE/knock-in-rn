import { useLocalSearchParams } from 'expo-router';

import { useSupportNoticeDetail } from '@/lib/api';

export type UseNoticeDetailScreenReturn = {
  title: string;
  dateLabel: string;
  body: string;
  /** 본문만 못 가져온 경우. 제목/날짜는 그대로 보여주고 안내만 노출한다. */
  bodyUnavailable: boolean;
  loading: boolean;
  error: string | null;
  retry: () => void;
};

export function useNoticeDetailScreen(): UseNoticeDetailScreenReturn {
  const { id } = useLocalSearchParams<{ id: string }>();
  const noticeId = id ?? '';
  const { data, loading, error, reload } = useSupportNoticeDetail(noticeId);

  return {
    title: data?.title ?? '',
    dateLabel: data?.dateLabel ?? '',
    body: data?.body ?? '',
    bodyUnavailable: data?.bodyUnavailable ?? false,
    loading,
    error: noticeId ? error : '잘못된 공지 주소예요',
    retry: reload,
  };
}
