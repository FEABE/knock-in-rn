import { useState } from 'react';

import { type SupportFaqItem, useSupportFaqs } from '@/lib/api';

export type UseFaqScreenReturn = {
  items: SupportFaqItem[];
  loading: boolean;
  error: string | null;
  openId: string | null;
  toggle: (id: string) => void;
};

export function useFaqScreen(): UseFaqScreenReturn {
  const [openId, setOpenId] = useState<string | null>(null);
  const { data, loading, error } = useSupportFaqs();

  return {
    items: data ?? [],
    loading,
    error,
    openId,
    toggle: (id) => setOpenId((prev) => (prev === id ? null : id)),
  };
}
