import { useRouter } from 'expo-router';
import { useMemo, useState } from 'react';

import { getPopularSearch, useApi } from '@/lib/api';

export type UseRoomSearchScreenReturn = {
  query: string;
  recent: string[];
  popular: string[];
  setQuery: (next: string) => void;
  clearQuery: () => void;
  clearRecent: () => void;
  removeRecent: (term: string) => void;
  submit: (term: string) => void;
  onCancel: () => void;
};

export function useRoomSearchScreen(): UseRoomSearchScreenReturn {
  const router = useRouter();
  const [query, setQuery] = useState('');
  const [recent, setRecent] = useState<string[]>([]);
  const { data: popularData } = useApi(['search', 'popular'], () => getPopularSearch());
  const popular = useMemo(
    () =>
      popularData?.rank
        ?.map((item) => item.keyword)
        .filter((keyword): keyword is string => Boolean(keyword)) ?? [],
    [popularData],
  );

  const submit = (term: string) => {
    const trimmed = term.trim();
    if (!trimmed) return;
    setRecent((prev) => [trimmed, ...prev.filter((item) => item !== trimmed)].slice(0, 20));
    router.back();
  };

  return {
    query,
    recent,
    popular,
    setQuery,
    clearQuery: () => setQuery(''),
    clearRecent: () => setRecent([]),
    removeRecent: (term) => setRecent((prev) => prev.filter((item) => item !== term)),
    submit,
    onCancel: () => router.back(),
  };
}
