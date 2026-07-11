import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client';
import { useCallback, useEffect, useRef, useState } from 'react';

import { type ChatSendPayload, type ChatSocketEnvelope, pubSendMessage, subChatRoom } from './chat';
import { API_BASE_URL, getAccessToken } from './client';

export type ChatSocketStatus = 'idle' | 'connecting' | 'connected' | 'error';

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

    const client = new Client({
      webSocketFactory: () =>
        new SockJS(`${API_BASE_URL}/ws-chat`, undefined, {
          transports: ['websocket'],
        }) as WebSocket,
      connectHeaders: { Authorization: `Bearer ${token}` },
      reconnectDelay: 4000,
      heartbeatIncoming: 10000,
      heartbeatOutgoing: 10000,
    });

    client.onConnect = () => {
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
      setStatus('error');
      setError(frame.headers.message ?? '채팅 서버 연결에 실패했습니다.');
    };
    client.onWebSocketError = () => {
      setStatus('error');
      setError('채팅 서버 연결에 실패했습니다.');
    };
    client.onWebSocketClose = () => {
      setStatus((current) => (current === 'error' ? current : 'connecting'));
    };

    clientRef.current = client;
    client.activate();

    return () => {
      clientRef.current = null;
      void client.deactivate();
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
