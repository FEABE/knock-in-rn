/**
 * API 호출용 범용 데이터 패칭 훅.
 * `{ data, loading, error, reload }` 를 반환한다.
 */
import { useCallback } from 'react';
import { useQuery, type QueryKey } from '@tanstack/react-query';

import type { ApiResponse } from './client';

export type AsyncState<T> = {
  data: T | null;
  loading: boolean;
  error: string | null;
  reload: () => void;
};

/**
 * 컴포넌트 마운트 시(및 deps 변경 시) `fetcher` 를 호출해 ApiResponse 의
 * data 를 추출한다. status≠200 또는 error≠null 이면 error 상태로 둔다.
 *
 * React Query 를 내부 구현으로 사용하지만, 기존 화면 훅의 반환 형태를 유지한다.
 *
 * @param queryKey React Query 캐시 키
 * @param fetcher  ApiResponse 를 반환하는 비동기 함수
 */
export function useApi<T>(
  queryKey: QueryKey,
  fetcher: () => Promise<ApiResponse<T>>,
  options: { enabled?: boolean } = {},
): AsyncState<T> {
  const query = useQuery({
    queryKey,
    enabled: options.enabled ?? true,
    queryFn: async () => {
      const res = await fetcher();
      if (res.status !== 200 || res.error) {
        throw new Error(res.error?.message ?? `요청 실패 (status ${res.status})`);
      }
      return res.data;
    },
  });

  const reload = useCallback(() => {
    void query.refetch();
  }, [query]);

  return {
    data: query.data ?? null,
    loading: query.isLoading,
    error: query.error instanceof Error ? query.error.message : null,
    reload,
  };
}
