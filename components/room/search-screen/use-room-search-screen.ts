import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useMemo, useState } from 'react';

import { getPopularSearch, useApi } from '@/lib/api';
import { goExploreSearch } from '@/lib/navigation/routes';
import { readRecentSearches, writeRecentSearches } from '@/lib/search/recent-searches';

export type UseRoomSearchScreenReturn = {
  query: string;
  recent: string[];
  popular: string[];
  popularLoading: boolean;
  popularError: string | null;
  retryPopular: () => void;
  setQuery: (next: string) => void;
  clearQuery: () => void;
  clearRecent: () => void;
  removeRecent: (term: string) => void;
  submit: (term: string) => void;
  onCancel: () => void;
};

export function useRoomSearchScreen(): UseRoomSearchScreenReturn {
  const router = useRouter();
  const { q } = useLocalSearchParams<{ q?: string }>();
  const [state, setState] = useState({
    query: typeof q === 'string' ? q : '',
    recent: [] as string[],
  });
  const { query, recent } = state;
  const {
    data: popularData,
    loading: popularLoading,
    error: popularError,
    reload: retryPopular,
  } = useApi(
    ['search', 'popular'],
    () => getPopularSearch(),
    { retry: false },
  );
  const popular = useMemo(
    () =>
      popularData?.rank
        ?.map((item) => item.keyword)
        .filter((keyword): keyword is string => Boolean(keyword)) ?? [],
    [popularData],
  );

  useEffect(() => {
    let active = true;
    readRecentSearches().then((stored) => {
      if (active) setState((current) => ({ ...current, recent: stored }));
    });
    return () => {
      active = false;
    };
  }, []);

  const submit = (term: string) => {
    const trimmed = term.trim();
    if (!trimmed) return;
    setState((current) => {
      const next = [trimmed, ...current.recent.filter((item) => item !== trimmed)].slice(0, 20);
      void writeRecentSearches(next);
      return { ...current, recent: next };
    });
    goExploreSearch(router, trimmed);
  };

  return {
    query,
    recent,
    popular,
    popularLoading,
    popularError,
    retryPopular,
    setQuery: (next) => setState((current) => ({ ...current, query: next })),
    clearQuery: () => setState((current) => ({ ...current, query: '' })),
    clearRecent: () => {
      setState((current) => ({ ...current, recent: [] }));
      void writeRecentSearches([]);
    },
    removeRecent: (term) =>
      setState((current) => {
        const next = current.recent.filter((item) => item !== term);
        void writeRecentSearches(next);
        return { ...current, recent: next };
      }),
    submit,
    onCancel: () => router.back(),
  };
}
