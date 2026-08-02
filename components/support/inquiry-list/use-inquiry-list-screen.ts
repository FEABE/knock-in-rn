import { useRouter } from 'expo-router';
import { useMemo } from 'react';

import { useSupportInquiries } from '@/lib/api';
import { useRequireLogin } from '@/lib/auth';
import { goSupportInquiryNew } from '@/lib/navigation/routes';

export type InquiryListItem = {
  id: string;
  title: string;
  body: string;
  answer?: string;
  authorName: string;
  dateLabel: string;
  statusLabel: string;
  answered: boolean;
  categoryLabel: string;
};

export type UseInquiryListScreenReturn = {
  inquiries: InquiryListItem[];
  totalCount: number;
  loading: boolean;
  error: string | null;
  retry: () => void;
  onCreatePress: () => void;
};

export function useInquiryListScreen(): UseInquiryListScreenReturn {
  const router = useRouter();
  const { session, requireLogin } = useRequireLogin();
  const { data, loading, error, reload } = useSupportInquiries(Boolean(session));

  const inquiries = useMemo<InquiryListItem[]>(() => data ?? [], [data]);

  return {
    inquiries,
    totalCount: inquiries.length,
    loading,
    error: session ? error : '문의내역은 로그인 후 확인할 수 있어요.',
    retry: reload,
    onCreatePress: () =>
      requireLogin(() => goSupportInquiryNew(router), {
        title: '로그인 필요',
        message: '문의 접수는 로그인 후 이용할 수 있어요.',
      }),
  };
}
