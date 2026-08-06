import { useRouter } from 'expo-router';
import { useMemo } from 'react';

import { useSupportInquiries } from '@/lib/api';
import { useRequireLogin } from '@/lib/auth';
import { goSupportInquiryDetail } from '@/lib/navigation/routes';

export type InquiryListItem = {
  id: string;
  title: string;
  answer?: string;
  dateLabel: string;
  statusLabel: string;
  answered: boolean;
  categoryLabel: string;
};

export type UseInquiryListScreenReturn = {
  inquiries: InquiryListItem[];
  loading: boolean;
  error: string | null;
  retry: () => void;
  onItemPress: (id: string) => void;
};

export function useInquiryListScreen(): UseInquiryListScreenReturn {
  const router = useRouter();
  const { session } = useRequireLogin();
  const { data, loading, error, reload } = useSupportInquiries(Boolean(session));

  const inquiries = useMemo<InquiryListItem[]>(() => data ?? [], [data]);

  return {
    inquiries,
    loading,
    error: session ? error : '문의내역은 로그인 후 확인할 수 있어요.',
    retry: reload,
    onItemPress: (id) => goSupportInquiryDetail(router, id),
  };
}
