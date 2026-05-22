import { useCallback, useMemo, useState } from 'react';

export type UseLoadMoreListProps<T> = {
  items: readonly T[];
  pageSize?: number;
  initialPages?: number;
};

export type UseLoadMoreListReturn<T> = {
  visible: T[];
  hasMore: boolean;
  page: number;
  total: number;
  loadMore: () => void;
  reset: () => void;
};

export function useLoadMoreList<T>({
  items,
  pageSize = 3,
  initialPages = 1,
}: UseLoadMoreListProps<T>): UseLoadMoreListReturn<T> {
  const [page, setPage] = useState(initialPages);

  const visible = useMemo(
    () => items.slice(0, page * pageSize),
    [items, page, pageSize],
  );

  const hasMore = visible.length < items.length;

  const loadMore = useCallback(() => {
    if (visible.length < items.length) {
      setPage((p) => p + 1);
    }
  }, [items.length, visible.length]);

  const reset = useCallback(() => setPage(initialPages), [initialPages]);

  return {
    visible,
    hasMore,
    page,
    total: items.length,
    loadMore,
    reset,
  };
}
