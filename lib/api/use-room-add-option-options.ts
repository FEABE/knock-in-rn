import { useMemo } from 'react';

import { getRoomAddOptions } from './meta';
import { useApi } from './use-async';

export type RoomAddOptionSelectOption = {
  value: number;
  label: string;
};

export function useRoomAddOptionOptions(enabled = true) {
  const state = useApi(['meta', 'room-add-options'], () => getRoomAddOptions(), {
    enabled,
    retry: false,
  });
  const options = useMemo<RoomAddOptionSelectOption[]>(
    () =>
      (state.data?.roomAddOption ?? []).flatMap((item) =>
        item.id === undefined || !item.name ? [] : [{ value: item.id, label: item.name }],
      ),
    [state.data?.roomAddOption],
  );

  return {
    options,
    loading: state.loading,
    error: state.error,
    reload: state.reload,
  };
}
