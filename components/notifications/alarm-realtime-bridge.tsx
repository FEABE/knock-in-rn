import { useQueryClient } from '@tanstack/react-query';
import { useCallback } from 'react';

import {
  type AlarmItem,
  type AlarmListData,
  type AlarmStreamPayload,
  useAlarmStream,
} from '@/lib/api';
import { useSession } from '@/lib/domain';

const ALARM_QUERY_KEY = ['alarms'] as const;

export function AlarmRealtimeBridge() {
  const queryClient = useQueryClient();
  const { session } = useSession();

  /**
   * 서버가 보내는 이벤트 이름은 ROOM_MATCHING / CHATTING_REQUIRED / DELETE_BOARD /
   * RECOVER_BOARD / MEMBER_ACTIVE / INQUIRIE_REPLY / SAVE_VERIFICATION /
   * DELETE_VERIFICATION 뿐이고, 모두 동일한 알림 페이로드를 싣는다. 연결 확인용
   * 핸드셰이크 이벤트는 존재하지 않으므로 이름별 분기 없이 페이로드 모양만 보고 처리한다.
   */
  const handleEvent = useCallback(
    ({ data }: { data: AlarmStreamPayload | string | number | null }) => {
      // 알림 객체가 아니면(형식 변경·부분 페이로드 등) 목록을 다시 받아 정합성을 맞춘다.
      if (!data || typeof data !== 'object' || data.id == null) {
        void queryClient.invalidateQueries({ queryKey: ALARM_QUERY_KEY });
        return;
      }

      const alarm: AlarmItem = {
        id: data.id,
        title: data.title,
        contents: data.contents,
        isRead: data.isRead,
        expiredAt: data.expiredAt,
        createAt: data.createdAt,
      };
      queryClient.setQueryData<AlarmListData>(ALARM_QUERY_KEY, (current) => ({
        ...current,
        alarms: [alarm, ...(current?.alarms ?? []).filter((item) => item.id !== alarm.id)],
      }));
    },
    [queryClient],
  );

  useAlarmStream({ enabled: Boolean(session), onEvent: handleEvent });
  return null;
}
