import { Client, ReconnectionTimeMode, type IFrame } from '@stomp/stompjs';
import { useCallback, useEffect, useRef, useState } from 'react';

import {
  type ChatSendPayload,
  type ChatSocketEnvelope,
  pubSendMessage,
  subChatRoom,
  wsChatUrl,
} from './chat';
import { API_BASE_URL, getAccessToken, isAccessTokenExpired, notifyAuthFailure } from './client';

export type ChatSocketStatus = 'idle' | 'connecting' | 'connected' | 'error';

const CONNECTION_TIMEOUT_MS = 10_000;
const MAX_RECONNECT_ATTEMPTS = 5;
const RECONNECT_DELAY_MS = 1_000;
const MAX_RECONNECT_DELAY_MS = 10_000;
const RECONNECTING_MESSAGE = '채팅 서버에 다시 연결하고 있어요.';
const RECONNECT_FAILED_MESSAGE = '채팅 서버 연결에 실패했습니다. 채팅방을 다시 열어주세요.';
const SESSION_EXPIRED_MESSAGE = '로그인이 만료되었습니다. 다시 로그인해주세요.';

export function useChatSocket({
  chatRoomId,
  enabled,
  onEvent,
}: {
  chatRoomId: string;
  enabled: boolean;
  onEvent: (event: ChatSocketEnvelope) => void;
}) {
  const clientRef = useRef<Client | null>(null);
  const onEventRef = useRef(onEvent);
  const [status, setStatus] = useState<ChatSocketStatus>('idle');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    onEventRef.current = onEvent;
  }, [onEvent]);

  useEffect(() => {
    const token = getAccessToken();
    if (!enabled || !chatRoomId || !token || !API_BASE_URL) {
      setStatus('idle');
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
      if (stopped) return;
      setStatus('connecting');
      setError(RECONNECTING_MESSAGE);
    };
    client.onWebSocketError = () => {
      if (stopped || authFailureHandled || reconnectLimitReached) return;
      setStatus('connecting');
      setError(RECONNECTING_MESSAGE);
    };
    client.onWebSocketClose = () => {
      if (stopped || authFailureHandled || reconnectLimitReached) return;
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
  }, [chatRoomId, enabled]);

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

  return { status, error, send };
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
