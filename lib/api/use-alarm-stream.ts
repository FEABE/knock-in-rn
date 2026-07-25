import { useEffect, useRef } from 'react';

import { API_BASE_URL, getAccessToken } from './client';

export type AlarmStreamPayload = {
  id?: number;
  title?: string;
  contents?: string;
  isRead?: boolean;
  createdAt?: string;
  expiredAt?: string;
};

type AlarmStreamEvent = {
  event: string;
  data: AlarmStreamPayload | string | number | null;
};

export function useAlarmStream({
  enabled,
  onEvent,
}: {
  enabled: boolean;
  onEvent: (event: AlarmStreamEvent) => void;
}) {
  const onEventRef = useRef(onEvent);

  useEffect(() => {
    onEventRef.current = onEvent;
  }, [onEvent]);

  useEffect(() => {
    const token = getAccessToken();
    if (!enabled || !token || !API_BASE_URL) return;

    let stopped = false;
    let reconnectTimer: ReturnType<typeof setTimeout> | null = null;
    let request: XMLHttpRequest | null = null;

    const scheduleReconnect = () => {
      if (stopped || reconnectTimer) return;
      reconnectTimer = setTimeout(() => {
        reconnectTimer = null;
        connect();
      }, 4_000);
    };

    const connect = () => {
      if (stopped) return;

      let consumedLength = 0;
      let pending = '';
      const xhr = new XMLHttpRequest();
      request = xhr;
      xhr.open('GET', `${API_BASE_URL}/alarms/subscribe`);
      xhr.setRequestHeader('Accept', 'text/event-stream');
      xhr.setRequestHeader('Cache-Control', 'no-cache');
      xhr.setRequestHeader('Authorization', `Bearer ${token}`);

      xhr.onprogress = () => {
        const responseText = xhr.responseText ?? '';
        pending += responseText.slice(consumedLength);
        consumedLength = responseText.length;
        pending = pending.replace(/\r\n/g, '\n');

        let boundary = pending.indexOf('\n\n');
        while (boundary >= 0) {
          const block = pending.slice(0, boundary);
          pending = pending.slice(boundary + 2);
          const parsed = parseSseBlock(block);
          if (parsed) onEventRef.current(parsed);
          boundary = pending.indexOf('\n\n');
        }
      };
      xhr.onerror = scheduleReconnect;
      xhr.ontimeout = scheduleReconnect;
      xhr.onloadend = scheduleReconnect;
      xhr.send();
    };

    connect();

    return () => {
      stopped = true;
      if (reconnectTimer) clearTimeout(reconnectTimer);
      request?.abort();
    };
  }, [enabled]);
}

function parseSseBlock(block: string): AlarmStreamEvent | null {
  let event = 'message';
  const dataLines: string[] = [];

  for (const line of block.split('\n')) {
    if (line.startsWith(':')) continue;
    if (line.startsWith('event:')) event = line.slice(6).trim();
    if (line.startsWith('data:')) dataLines.push(line.slice(5).trimStart());
  }

  if (dataLines.length === 0) return null;
  const rawData = dataLines.join('\n');
  try {
    return { event, data: JSON.parse(rawData) as AlarmStreamEvent['data'] };
  } catch {
    return { event, data: rawData };
  }
}
