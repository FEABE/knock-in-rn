import { Client, ReconnectionTimeMode, type IFrame } from '@stomp/stompjs';
import { useCallback, useEffect, useRef, useState } from 'react';
import { AppState, type AppStateStatus } from 'react-native';

import {
  type ChatSendPayload,
  type ChatSocketEnvelope,
  pubSendMessage,
  subChatRoom,
  wsChatUrl,
} from './chat';
import { API_BASE_URL, getAccessToken, isAccessTokenExpired, notifyAuthFailure } from './client';

export type ChatSocketStatus = 'idle' | 'connecting' | 'connected' | 'error';

export type UseChatSocketReturn = {
  status: ChatSocketStatus;
  error: string | null;
  send: (payload: Omit<ChatSendPayload, 'clientMessageId'>) => string | null;
  retry: () => void;
};

const CONNECTION_TIMEOUT_MS = 10_000;
const MAX_RECONNECT_ATTEMPTS = 5;
const RECONNECT_DELAY_MS = 1_000;
const MAX_RECONNECT_DELAY_MS = 10_000;
/** iOS는 권한 팝업·제어센터 등으로 잠깐 inactive가 되므로 유예 후에만 소켓을 내린다. */
const INACTIVE_GRACE_MS = 5_000;
/** 배너 버튼 연타로 클라이언트가 중복 생성되는 것을 막는 최소 간격. */
const RETRY_THROTTLE_MS = 500;
const RECONNECTING_MESSAGE = '채팅 서버에 다시 연결하고 있어요.';
const RECONNECT_FAILED_MESSAGE = '채팅 서버에 연결하지 못했어요.';
const SESSION_EXPIRED_MESSAGE = '로그인이 만료되었습니다. 다시 로그인해주세요.';

export function useChatSocket({
  chatRoomId,
  enabled,
  onEvent,
}: {
  chatRoomId: string;
  enabled: boolean;
  onEvent: (event: ChatSocketEnvelope) => void;
}): UseChatSocketReturn {
  const clientRef = useRef<Client | null>(null);
  const onEventRef = useRef(onEvent);
  const statusRef = useRef<ChatSocketStatus>('idle');
  const foregroundRef = useRef(AppState.currentState !== 'background');
  const lastRetryAtRef = useRef(0);
  const [status, setStatus] = useState<ChatSocketStatus>('idle');
  const [error, setError] = useState<string | null>(null);
  /** 값이 바뀔 때마다 새 STOMP 클라이언트로 갈아탄다. */
  const [activationId, setActivationId] = useState(0);
  const [foreground, setForeground] = useState(foregroundRef.current);

  useEffect(() => {
    onEventRef.current = onEvent;
  }, [onEvent]);

  useEffect(() => {
    statusRef.current = status;
  }, [status]);

  const retry = useCallback(() => {
    const now = Date.now();
    if (now - lastRetryAtRef.current < RETRY_THROTTLE_MS) return;
    lastRetryAtRef.current = now;
    setError(null);
    setStatus((current) => (current === 'connected' ? current : 'connecting'));
    setActivationId((current) => current + 1);
  }, []);

  useEffect(() => {
    let graceTimer: ReturnType<typeof setTimeout> | null = null;

    const clearGraceTimer = () => {
      if (!graceTimer) return;
      clearTimeout(graceTimer);
      graceTimer = null;
    };

    const suspend = () => {
      clearGraceTimer();
      if (!foregroundRef.current) return;
      foregroundRef.current = false;
      setForeground(false);
    };

    const resume = () => {
      clearGraceTimer();
      const wasSuspended = !foregroundRef.current;
      foregroundRef.current = true;
      if (wasSuspended) {
        setForeground(true);
        return;
      }
      // 소켓을 내리지 않은 채 복귀했는데 이미 죽어 있으면 직접 되살린다.
      if (statusRef.current === 'error') retry();
    };

    const handleAppStateChange = (next: AppStateStatus) => {
      if (next === 'active') {
        resume();
        return;
      }
      if (next === 'background') {
        suspend();
        return;
      }
      if (graceTimer || !foregroundRef.current) return;
      graceTimer = setTimeout(suspend, INACTIVE_GRACE_MS);
    };

    const subscription = AppState.addEventListener('change', handleAppStateChange);

    return () => {
      clearGraceTimer();
      subscription.remove();
    };
  }, [retry]);

  useEffect(() => {
    const token = getAccessToken();
    if (!enabled || !chatRoomId || !token || !API_BASE_URL) {
      setStatus('idle');
      return;
    }

    if (!foreground) {
      // 백그라운드에서는 하트비트가 멈춰 어차피 끊기므로 조용히 내려둔다.
      setStatus('idle');
      setError(null);
      return;
    }

    setStatus('connecting');
    setError(null);

    let stopped = false;
    let authFailureHandled = false;
    let reconnectLimitReached = false;
    let consecutiveConnectionFailures = 0;

    const client = new Client({
      webSocketFactory: () => new WebSocket(wsChatUrl()),
      connectHeaders: { Authorization: `Bearer ${token}` },
      connectionTimeout: CONNECTION_TIMEOUT_MS,
      reconnectDelay: RECONNECT_DELAY_MS,
      maxReconnectDelay: MAX_RECONNECT_DELAY_MS,
      reconnectTimeMode: ReconnectionTimeMode.EXPONENTIAL,
      discardWebsocketOnCommFailure: true,
      heartbeatIncoming: 10000,
      heartbeatOutgoing: 10000,
    });

    const stopForAuthFailure = () => {
      if (stopped || authFailureHandled) return;
      authFailureHandled = true;
      setStatus('error');
      setError(SESSION_EXPIRED_MESSAGE);
      notifyAuthFailure();
      void client.deactivate({ force: true });
    };

    // 영구 비활성화가 아니다. retry() 또는 포그라운드 복귀가 새 클라이언트로 되살린다.
    const stopForReconnectLimit = () => {
      if (stopped || reconnectLimitReached) return;
      reconnectLimitReached = true;
      setStatus('error');
      setError(RECONNECT_FAILED_MESSAGE);
      void client.deactivate({ force: true });
    };

    client.beforeConnect = (stompClient) => {
      const latestToken = getAccessToken();
      if (!latestToken || isAccessTokenExpired()) {
        stopForAuthFailure();
        return;
      }

      stompClient.connectHeaders = { Authorization: `Bearer ${latestToken}` };
      if (!stopped) {
        setStatus('connecting');
        setError(null);
      }
    };
    client.onConnect = () => {
      if (stopped) return;
      consecutiveConnectionFailures = 0;
      setStatus('connected');
      setError(null);
      client.subscribe(subChatRoom(chatRoomId), (frame) => {
        try {
          onEventRef.current(JSON.parse(frame.body) as ChatSocketEnvelope);
        } catch {
          setError('채팅 메시지를 해석하지 못했습니다.');
        }
      });
    };
    client.onStompError = (frame) => {
      if (isAuthenticationError(frame)) {
        stopForAuthFailure();
        return;
      }
      if (stopped || !foregroundRef.current) return;
      setStatus('connecting');
      setError(RECONNECTING_MESSAGE);
    };
    client.onWebSocketError = () => {
      if (stopped || authFailureHandled || reconnectLimitReached) return;
      if (!foregroundRef.current) return;
      setStatus('connecting');
      setError(RECONNECTING_MESSAGE);
    };
    client.onWebSocketClose = () => {
      if (stopped || authFailureHandled || reconnectLimitReached) return;
      if (!foregroundRef.current) {
        // 백그라운드 전환으로 끊긴 건 실패로 세지 않는다(cleanup이 곧 내린다).
        setStatus('idle');
        setError(null);
        return;
      }
      consecutiveConnectionFailures += 1;
      if (consecutiveConnectionFailures > MAX_RECONNECT_ATTEMPTS) {
        stopForReconnectLimit();
        return;
      }
      setStatus('connecting');
      setError(RECONNECTING_MESSAGE);
    };

    clientRef.current = client;
    client.activate();

    return () => {
      stopped = true;
      if (clientRef.current === client) clientRef.current = null;
      void client.deactivate({ force: true });
    };
  }, [activationId, chatRoomId, enabled, foreground]);

  const send = useCallback(
    (payload: Omit<ChatSendPayload, 'clientMessageId'>): string | null => {
      const client = clientRef.current;
      if (!client?.connected) return null;
      const clientMessageId = `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
      client.publish({
        destination: pubSendMessage(chatRoomId),
        body: JSON.stringify({ ...payload, clientMessageId }),
      });
      return clientMessageId;
    },
    [chatRoomId],
  );

  return { status, error, send, retry };
}

function isAuthenticationError(frame: IFrame): boolean {
  const message = `${frame.headers.message ?? ''} ${frame.body}`.toLowerCase();
  return (
    message.includes('"status":401') ||
    message.includes('token_expired') ||
    message.includes('token_invalid') ||
    message.includes('authentication_failed') ||
    message.includes('토큰이 만료') ||
    message.includes('토큰이 유효하지') ||
    message.includes('인증에 실패')
  );
}
