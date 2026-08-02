import { useState } from 'react';

import { type SupportFaqItem, useSupportFaqs } from '@/lib/api';

export type UseFaqScreenReturn = {
  items: SupportFaqItem[];
  loading: boolean;
  error: string | null;
  retry: () => void;
  openId: string | null;
  toggle: (id: string) => void;
};

export function useFaqScreen(): UseFaqScreenReturn {
  const [openId, setOpenId] = useState<string | null>(null);
  const { data, loading, error, reload } = useSupportFaqs();

  return {
    items: data ?? [],
    loading,
    error,
    retry: reload,
    openId,
    toggle: (id) => setOpenId((prev) => (prev === id ? null : id)),
  };
}
