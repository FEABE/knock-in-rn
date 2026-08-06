import { useMemo } from 'react';

import type { RoomType } from '@/lib/onboarding';

import { getRoomTypes } from './meta';
import { useApi } from './use-async';

export type RoomTypeOption = {
  value: RoomType;
  label: string;
  /** 서버 메타 image (절대 URL 또는 이모지). 없으면 로컬 아트워크 폴백. */
  image?: string | null;
};

export function useRoomTypeOptions() {
  const state = useApi(['meta', 'room-types'], () => getRoomTypes(), { retry: false });
  // 서버 GET /meta/room-types는 정렬을 보증하지 않는다(실측 1,2,5,4,3 순).
  // 화면 순서가 응답 순서에 흔들리지 않도록 id 오름차순으로 고정한다.
  const options = useMemo<RoomTypeOption[]>(
    () =>
      (state.data?.roomType ?? [])
        .flatMap((item) =>
          item.id === undefined || !item.name
            ? []
            : [{ id: item.id, name: item.name, image: item.image ?? null }],
        )
        .sort((a, b) => a.id - b.id)
        .map((item) => ({ value: String(item.id), label: item.name, image: item.image })),
    [state.data?.roomType],
  );

  return {
    options,
    loading: state.loading,
    error: state.error,
    reload: state.reload,
  };
}
