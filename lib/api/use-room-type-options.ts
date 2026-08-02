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
  const options = useMemo<RoomTypeOption[]>(
    () =>
      (state.data?.roomType ?? []).flatMap((item) =>
        item.id === undefined || !item.name ? [] : [{ value: String(item.id), label: item.name }],
      ),
    [state.data?.roomType],
  );

  return {
    options,
    loading: state.loading,
    error: state.error,
    reload: state.reload,
  };
}
