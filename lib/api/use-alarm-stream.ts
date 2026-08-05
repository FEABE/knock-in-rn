import { useEffect, useRef, useState } from 'react';
import { AppState, type AppStateStatus } from 'react-native';

import { API_BASE_URL, getAccessToken, isAccessTokenExpired, notifyAuthFailure } from './client';

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

const RECONNECT_DELAY_MS = 1_000;
const MAX_RECONNECT_DELAY_MS = 30_000;
const MAX_RECONNECT_ATTEMPTS = 8;

export function useAlarmStream({
  enabled,
  onEvent,
}: {
  enabled: boolean;
  onEvent: (event: AlarmStreamEvent) => void;
}) {
  const onEventRef = useRef(onEvent);
  const foregroundRef = useRef(AppState.currentState !== 'background');
  /** 재시도 한도 도달·토큰 부재로 멈춘 상태. 포그라운드 복귀가 되살린다. */
  const haltedRef = useRef(false);
  /** 401/403으로 멈춘 상태. 재로그인(enabled 재진입) 전까지 재연결하지 않는다. */
  const authFailedRef = useRef(false);
  const [foreground, setForeground] = useState(foregroundRef.current);
  /** 값이 바뀔 때마다 새 스트림으로 갈아탄다. */
  const [activationId, setActivationId] = useState(0);

  useEffect(() => {
    onEventRef.current = onEvent;
  }, [onEvent]);

  useEffect(() => {
    const suspend = () => {
      if (!foregroundRef.current) return;
      foregroundRef.current = false;
      setForeground(false);
    };

    const resume = () => {
      const wasSuspended = !foregroundRef.current;
      foregroundRef.current = true;
      if (wasSuspended) {
        setForeground(true);
        return;
      }
      // 백그라운드를 거치지 않고 멈춰 있던 경우(재시도 한도 등)만 직접 되살린다.
      if (haltedRef.current && !authFailedRef.current) setActivationId((current) => current + 1);
    };

    const handleAppStateChange = (next: AppStateStatus) => {
      if (next === 'active') resume();
      else if (next === 'background') suspend();
    };

    const subscription = AppState.addEventListener('change', handleAppStateChange);
    return () => subscription.remove();
  }, []);

  useEffect(() => {
    if (!enabled || !API_BASE_URL) {
      // 로그아웃/비활성 구간에서 잠금을 풀어 다음 로그인 때 다시 붙을 수 있게 한다.
      authFailedRef.current = false;
      haltedRef.current = false;
      return;
    }
    // 인증 실패로 잠긴 동안에는 재연결하지 않는다(무한 로그아웃 루프 방지).
    if (!foreground || authFailedRef.current) return;

    haltedRef.current = false;

    let stopped = false;
    let reconnectTimer: ReturnType<typeof setTimeout> | null = null;
    let request: XMLHttpRequest | null = null;
    let consecutiveFailures = 0;

    /** 영구 중단이 아니다. 포그라운드 복귀 또는 enabled 재진입이 새 스트림을 만든다. */
    const halt = () => {
      if (stopped) return;
      stopped = true;
      haltedRef.current = true;
      if (reconnectTimer) {
        clearTimeout(reconnectTimer);
        reconnectTimer = null;
      }
      request?.abort();
      request = null;
    };

    const handleAuthFailure = () => {
      if (authFailedRef.current) return;
      authFailedRef.current = true;
      halt();
      notifyAuthFailure();
    };

    const scheduleReconnect = () => {
      if (stopped || reconnectTimer || !foregroundRef.current) return;
      consecutiveFailures += 1;
      if (consecutiveFailures > MAX_RECONNECT_ATTEMPTS) {
        halt();
        return;
      }
      const delay = Math.min(
        RECONNECT_DELAY_MS * 2 ** (consecutiveFailures - 1),
        MAX_RECONNECT_DELAY_MS,
      );
      reconnectTimer = setTimeout(() => {
        reconnectTimer = null;
        connect();
      }, delay);
    };

    const connect = () => {
      if (stopped) return;

      // 재로그인·토큰 교체를 반영하기 위해 매 시도마다 최신 토큰을 다시 읽는다.
      const token = getAccessToken();
      if (!token || isAccessTokenExpired()) {
        halt();
        return;
      }

      let consumedLength = 0;
      let pending = '';
      const xhr = new XMLHttpRequest();
      request = xhr;

      const handleClose = () => {
        if (stopped || request !== xhr) return;
        if (xhr.status === 401 || xhr.status === 403) {
          handleAuthFailure();
          return;
        }
        if (!foregroundRef.current) return;
        scheduleReconnect();
      };

      xhr.open('GET', `${API_BASE_URL}/alarms/subscribe`);
      xhr.setRequestHeader('Accept', 'text/event-stream');
      xhr.setRequestHeader('Cache-Control', 'no-cache');
      xhr.setRequestHeader('Authorization', `Bearer ${token}`);

      xhr.onreadystatechange = () => {
        if (stopped || request !== xhr) return;
        if (xhr.readyState < 2) return;
        if (xhr.status === 401 || xhr.status === 403) handleAuthFailure();
      };

      xhr.onprogress = () => {
        if (stopped || request !== xhr) return;
        const responseText = xhr.responseText ?? '';
        if (responseText.length > consumedLength) consecutiveFailures = 0;
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
      xhr.onerror = handleClose;
      xhr.ontimeout = handleClose;
      xhr.onloadend = handleClose;
      xhr.send();
    };

    connect();

    return () => {
      stopped = true;
      if (reconnectTimer) clearTimeout(reconnectTimer);
      request?.abort();
      request = null;
    };
  }, [activationId, enabled, foreground]);
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
