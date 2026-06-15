import { useLocalSearchParams, useRouter } from 'expo-router';
import { useCallback, useMemo, useRef, useState, type MutableRefObject } from 'react';
import type { ScrollView } from 'react-native';

import { AnalyticsEvent, logEvent } from '@/lib/analytics';
import {
  MOCK_CHAT_ROOMS,
  MOCK_USERS,
  useModeration,
  type ChatRoom as DomainChatRoom,
} from '@/lib/domain';

export type UseChatRoomScreenReturn = {
  room: DomainChatRoom;
  blocked: boolean;
  scrollRef: MutableRefObject<ScrollView | null>;
  requestSent: boolean;
  requestSheetVisible: boolean;
  onBack: () => void;
  openRequestSheet: () => void;
  closeRequestSheet: () => void;
  confirmRequest: () => void;
  acceptAsDemo: (requestMatch: () => void) => void;
  handleSend: (canSend: boolean, send: () => void) => void;
  onMessagesChanged: () => void;
};

export function useChatRoomScreen(): UseChatRoomScreenReturn {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const scrollRef = useRef<ScrollView | null>(null);
  const firstSent = useRef(false);
  const { isUserBlocked } = useModeration();
  const [requestSent, setRequestSent] = useState(false);
  const [requestSheetVisible, setRequestSheetVisible] = useState(false);

  const room = useMemo<DomainChatRoom>(() => {
    const existing = MOCK_CHAT_ROOMS.find((chatRoom) => chatRoom.id === id);
    if (existing) return existing;

    const peer = MOCK_USERS.find((user) => user.id === id) ?? MOCK_USERS[1];
    return {
      id: peer.id,
      peer,
      matched: false,
      acceptedRequest: false,
      messages: [
        {
          id: 'sys',
          authorId: 'system',
          body: '채팅이 시작되었어요.',
          sentAt: new Date(),
          kind: 'system',
        },
      ],
    };
  }, [id]);

  const handleSend = useCallback(
    (canSend: boolean, send: () => void) => {
      if (canSend && !firstSent.current) {
        firstSent.current = true;
        logEvent(AnalyticsEvent.CHAT_FIRST_MESSAGE_SENT, { room_id: room.id });
      }
      send();
    },
    [room.id],
  );

  const onMessagesChanged = useCallback(() => {
    setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 50);
  }, []);

  const confirmRequest = useCallback(() => {
    setRequestSent(true);
    setRequestSheetVisible(false);
  }, []);

  const acceptAsDemo = useCallback((requestMatch: () => void) => {
    requestMatch();
    setRequestSent(false);
  }, []);

  return {
    room,
    blocked: isUserBlocked(room.peer.id),
    scrollRef,
    requestSent,
    requestSheetVisible,
    onBack: () => router.back(),
    openRequestSheet: () => setRequestSheetVisible(true),
    closeRequestSheet: () => setRequestSheetVisible(false),
    confirmRequest,
    acceptAsDemo,
    handleSend,
    onMessagesChanged,
  };
}
