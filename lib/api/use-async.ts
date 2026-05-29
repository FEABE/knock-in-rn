/**
 * API 호출용 범용 데이터 패칭 훅.
 * `{ data, loading, error, reload }` 를 반환한다.
 */
import { useCallback, useEffect, useState } from 'react';

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
 * @param fetcher  ApiResponse 를 반환하는 비동기 함수
 * @param deps     재호출 트리거 의존성 배열
 */
export function useApi<T>(
  fetcher: () => Promise<ApiResponse<T>>,
  deps: unknown[] = [],
): AsyncState<T> {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // fetcher 는 매 렌더 새로 생성되므로 deps 로만 갱신을 제어한다.

  const run = useCallback(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);
    fetcher()
      .then((res) => {
        if (cancelled) return;
        if (res.status !== 200 || res.error) {
          setError(res.error?.message ?? `요청 실패 (status ${res.status})`);
          setData(null);
        } else {
          setData(res.data);
        }
      })
      .catch((e: unknown) => {
        if (cancelled) return;
        setError(e instanceof Error ? e.message : '알 수 없는 오류');
        setData(null);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);

  useEffect(() => {
    const cleanup = run();
    return cleanup;
  }, [run]);

  const reload = useCallback(() => {
    run();
  }, [run]);

  return { data, loading, error, reload };
}
