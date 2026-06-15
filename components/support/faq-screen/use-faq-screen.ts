import { useState } from 'react';

import { FAQ_ITEMS, type FaqItem } from '@/lib/domain';

export type UseFaqScreenReturn = {
  items: FaqItem[];
  openId: string | null;
  toggle: (id: string) => void;
};

export function useFaqScreen(): UseFaqScreenReturn {
  const [openId, setOpenId] = useState<string | null>(null);

  return {
    items: FAQ_ITEMS,
    openId,
    toggle: (id) => setOpenId((prev) => (prev === id ? null : id)),
  };
}
