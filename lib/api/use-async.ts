/**
 * API 호출용 범용 데이터 패칭 훅.
 * `{ data, loading, error, reload }` 를 반환한다.
 */
import { useCallback, useRef, useState } from 'react';
import {
  useInfiniteQuery,
  useQuery,
  useQueryClient,
  type InfiniteData,
  type QueryKey,
} from '@tanstack/react-query';

import type { ApiResponse } from './client';

export type AsyncState<T> = {
  data: T | null;
  loading: boolean;
  /** 데이터가 이미 있는 상태에서 재조회 중인지(당겨서 새로고침 스피너 제어용). */
  refreshing: boolean;
  error: string | null;
  reload: () => void | Promise<void>;
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
  options: {
    enabled?: boolean;
    refetchInterval?: number | false;
    retry?: boolean | number;
  } = {},
): AsyncState<T> {
  const enabled = options.enabled ?? true;
  const query = useQuery({
    queryKey,
    enabled,
    refetchInterval: options.refetchInterval,
    retry: options.retry,
    queryFn: async () => {
      const res = await fetcher();
      if (res.status !== 200 || res.error) {
        throw new Error(res.error?.message ?? `요청 실패 (status ${res.status})`);
      }
      return res.data;
    },
  });
  const { refetch } = query;

  const reload = useCallback(() => {
    if (!enabled) return Promise.resolve();
    return refetch().then(() => undefined);
  }, [enabled, refetch]);

  return {
    data: query.data ?? null,
    loading: enabled && query.isLoading,
    refreshing: enabled && query.isFetching && !query.isLoading,
    // 캐시 데이터가 있으면 백그라운드 재조회 실패로 전체 화면을 에러 상태로 바꾸지 않는다.
    error:
      enabled && query.data == null && query.error instanceof Error ? query.error.message : null,
    reload,
  };
}

/**
 * 무한 스크롤 목록 상태. `useApi` 의 `{ loading, refreshing, error, reload }` 계약을
 * 유지하면서 다음 페이지 로딩용 필드를 덧붙인다.
 *
 * `data` 대신 페이지 원본 배열(`pages`)을 그대로 넘겨, 도메인 훅이 각자
 * flatten/dedupe/매핑을 수행하도록 한다(안정적인 useMemo deps 유지 목적).
 */
export type InfiniteAsyncState<TPage> = {
  /** 지금까지 로드된 페이지 응답들. 아직 한 번도 성공하지 않았으면 null. */
  pages: TPage[] | null;
  loading: boolean;
  /** 당겨서 새로고침 중인지(다음 페이지 로딩은 제외). */
  refreshing: boolean;
  error: string | null;
  /** 로드된 페이지들을 그대로 다시 조회한다(화면 포커스 복귀 등). */
  reload: () => Promise<void>;
  /** 첫 페이지만 남기고 다시 조회한다(당겨서 새로고침). */
  refresh: () => Promise<void>;
  /** 다음 페이지를 이어서 불러온다. 더 없거나 이미 로딩 중이면 무시된다. */
  loadMore: () => void;
  loadingMore: boolean;
  hasMore: boolean;
};

/**
 * 페이지네이션 목록용 데이터 패칭 훅. React Query 의 `useInfiniteQuery` 를
 * `useApi` 와 동일한 ApiResponse 규약(status≠200 또는 error≠null → 에러)으로 감싼다.
 *
 * @param queryKey  React Query 캐시 키
 * @param fetcher   페이지 파라미터를 받아 ApiResponse 를 반환하는 비동기 함수
 * @param paging    초기 페이지 파라미터와 다음 페이지 계산 함수
 */
export function useInfiniteApi<TPage, TPageParam = number>(
  queryKey: QueryKey,
  fetcher: (pageParam: TPageParam) => Promise<ApiResponse<TPage>>,
  paging: {
    initialPageParam: TPageParam;
    /** 다음 페이지 파라미터. 더 이상 없으면 undefined 를 반환한다. */
    getNextPageParam: (
      lastPage: TPage,
      allPages: TPage[],
      lastPageParam: TPageParam,
    ) => TPageParam | undefined;
  },
  options: {
    enabled?: boolean;
    retry?: boolean | number;
  } = {},
): InfiniteAsyncState<TPage> {
  const enabled = options.enabled ?? true;
  const queryClient = useQueryClient();
  const [manualRefreshing, setManualRefreshing] = useState(false);
  // queryKey 는 매 렌더 새 배열이라 useCallback deps 로 쓸 수 없다(포커스 effect 무한 루프).
  const queryKeyRef = useRef(queryKey);
  queryKeyRef.current = queryKey;

  const query = useInfiniteQuery({
    queryKey,
    enabled,
    retry: options.retry,
    initialPageParam: paging.initialPageParam,
    getNextPageParam: paging.getNextPageParam,
    queryFn: async ({ pageParam }) => {
      // queryFn 컨텍스트의 pageParam 은 unknown 으로 추론된다(initialPageParam 제네릭 순환).
      const res = await fetcher(pageParam as TPageParam);
      if (res.status !== 200 || res.error) {
        throw new Error(res.error?.message ?? `요청 실패 (status ${res.status})`);
      }
      return res.data;
    },
  });

  const { refetch, fetchNextPage, hasNextPage, isFetchingNextPage } = query;

  const reload = useCallback(() => {
    if (!enabled) return Promise.resolve();
    return refetch().then(() => undefined);
  }, [enabled, refetch]);

  const refresh = useCallback(async () => {
    if (!enabled) return Promise.resolve();
    queryClient.setQueryData<InfiniteData<TPage, TPageParam>>(queryKeyRef.current, (old) =>
      old && old.pages.length > 1
        ? { pages: old.pages.slice(0, 1), pageParams: old.pageParams.slice(0, 1) }
        : old,
    );
    setManualRefreshing(true);
    try {
      await refetch();
    } finally {
      setManualRefreshing(false);
    }
  }, [enabled, queryClient, refetch]);

  const loadMore = useCallback(() => {
    if (!enabled || !hasNextPage || isFetchingNextPage) return;
    void fetchNextPage();
  }, [enabled, fetchNextPage, hasNextPage, isFetchingNextPage]);

  return {
    pages: query.data?.pages ?? null,
    loading: enabled && query.isLoading,
    refreshing: enabled && manualRefreshing,
    error:
      enabled && query.data == null && query.error instanceof Error ? query.error.message : null,
    reload,
    refresh,
    loadMore,
    loadingMore: enabled && isFetchingNextPage,
    hasMore: enabled && hasNextPage,
  };
}
