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

  const handleEvent = useCallback(
    ({ event, data }: { event: string; data: AlarmStreamPayload | string | number | null }) => {
      if (event === 'connected') return;
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
