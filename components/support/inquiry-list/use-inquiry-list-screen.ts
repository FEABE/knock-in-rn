import { useRouter } from 'expo-router';
import { useMemo } from 'react';

import { useSupportInquiries } from '@/lib/api';
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
  isPublic: boolean;
};

export type UseInquiryListScreenReturn = {
  inquiries: InquiryListItem[];
  publicCount: number;
  loading: boolean;
  error: string | null;
  onCreatePress: () => void;
};

export function useInquiryListScreen(): UseInquiryListScreenReturn {
  const router = useRouter();
  const { data, loading, error } = useSupportInquiries();

  const inquiries = useMemo<InquiryListItem[]>(() => data ?? [], [data]);

  return {
    inquiries,
    publicCount: inquiries.filter((inquiry) => inquiry.isPublic).length,
    loading,
    error,
    onCreatePress: () => goSupportInquiryNew(router),
  };
}
