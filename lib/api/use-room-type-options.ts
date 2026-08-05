import { useMemo } from 'react';

import type { RoomType } from '@/lib/onboarding';

import { getRoomTypes } from './meta';
import { useApi } from './use-async';

export type RoomTypeOption = {
  value: RoomType;
  label: string;
};

export function useRoomTypeOptions() {
  const state = useApi(['meta', 'room-types'], () => getRoomTypes(), { retry: false });
  // 서버 GET /meta/room-types는 정렬을 보증하지 않는다(실측 1,2,5,4,3 순).
  // 화면 순서가 응답 순서에 흔들리지 않도록 id 오름차순으로 고정한다.
  const options = useMemo<RoomTypeOption[]>(
    () =>
      (state.data?.roomType ?? [])
        .flatMap((item) =>
          item.id === undefined || !item.name ? [] : [{ id: item.id, name: item.name }],
        )
        .sort((a, b) => a.id - b.id)
        .map((item) => ({ value: String(item.id), label: item.name })),
    [state.data?.roomType],
  );

  return {
    options,
    loading: state.loading,
    error: state.error,
    reload: state.reload,
  };
}
