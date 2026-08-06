import { useLocalSearchParams } from 'expo-router';

import { useSupportInquiryDetail } from '@/lib/api';

export type UseInquiryDetailScreenReturn = {
  inquiry: {
    title: string;
    body: string;
    answer?: string;
    dateLabel: string;
    statusLabel: string;
    answered: boolean;
    categoryLabel: string;
  } | null;
  loading: boolean;
  error: string | null;
  retry: () => void;
};

export function useInquiryDetailScreen(): UseInquiryDetailScreenReturn {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { data, loading, error, reload } = useSupportInquiryDetail(id ?? '');

  return {
    inquiry: data,
    loading,
    error,
    retry: reload,
  };
}
