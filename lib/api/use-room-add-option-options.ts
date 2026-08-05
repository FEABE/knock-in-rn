import { useMemo } from 'react';

import { getRoomAddOptions } from './meta';
import { useApi } from './use-async';

export type RoomAddOptionSelectOption = {
  /** 서버 room_add_option.id. 게시글 작성/수정 시 그대로 전송한다. */
  value: number;
  label: string;
  /** 서버 image 필드(이모지 문자열 또는 URL). 렌더 불가한 값이면 화면에서 로컬 아이콘으로 폴백. */
  image: string | null;
};

export function useRoomAddOptionOptions(enabled = true) {
  const state = useApi(['meta', 'room-add-options'], () => getRoomAddOptions(), {
    enabled,
    retry: false,
  });
  // 서버 GET /meta/room-add-options는 정렬을 보증하지 않는다(실측 1,2,5,6,4,3 순).
  // 화면 순서가 응답 순서에 흔들리지 않도록 id 오름차순으로 고정한다.
  const options = useMemo<RoomAddOptionSelectOption[]>(
    () =>
      (state.data?.roomAddOption ?? [])
        .flatMap((item) =>
          item.id === undefined || !item.name
            ? []
            : [{ value: item.id, label: item.name, image: item.image?.trim() || null }],
        )
        .sort((a, b) => a.value - b.value),
    [state.data?.roomAddOption],
  );

  return {
    options,
    loading: state.loading,
    error: state.error,
    reload: state.reload,
  };
}
