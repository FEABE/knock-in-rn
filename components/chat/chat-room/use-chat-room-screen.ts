import { useLocalSearchParams, useRouter } from 'expo-router';
import { useCallback, useMemo, useRef, useState, type MutableRefObject } from 'react';
import { Alert, type ScrollView } from 'react-native';

import { AnalyticsEvent, logEvent } from '@/lib/analytics';
import { useChatRoomDetail, useRoommateRequestAction } from '@/lib/api';
import { useModeration, useSession, type ChatRoom as DomainChatRoom } from '@/lib/domain';

export type UseChatRoomScreenReturn = {
  room: DomainChatRoom | null;
  loading: boolean;
  error: string | null;
  currentUserId: string;
  blocked: boolean;
  scrollRef: MutableRefObject<ScrollView | null>;
  requestSent: boolean;
  requestSheetVisible: boolean;
  onBack: () => void;
  openRequestSheet: () => void;
  closeRequestSheet: () => void;
  confirmRequest: () => Promise<void>;
  handleSend: (canSend: boolean, send: () => void) => void;
  onMessagesChanged: () => void;
};

export function useChatRoomScreen(): UseChatRoomScreenReturn {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const chatRoomId = typeof id === 'string' ? id : '';
  const scrollRef = useRef<ScrollView | null>(null);
  const firstSent = useRef(false);
  const { isUserBlocked } = useModeration();
  const { session } = useSession();
  const { data: room, loading, error } = useChatRoomDetail(chatRoomId);
  const { requestRoommate } = useRoommateRequestAction();
  const [requestSent, setRequestSent] = useState(false);
  const [requestSheetVisible, setRequestSheetVisible] = useState(false);

  const currentUserId = session?.user.id ?? 'me';
  const blocked = useMemo(
    () => (room ? isUserBlocked(room.peer.id) : false),
    [isUserBlocked, room],
  );

  const handleSend = useCallback(
    (canSend: boolean, send: () => void) => {
      if (canSend && !firstSent.current) {
        firstSent.current = true;
        logEvent(AnalyticsEvent.CHAT_FIRST_MESSAGE_SENT, { room_id: room?.id ?? chatRoomId });
      }
      send();
    },
    [chatRoomId, room?.id],
  );

  const onMessagesChanged = useCallback(() => {
    setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 50);
  }, []);

  const confirmRequest = useCallback(async () => {
    if (!room) return;
    try {
      await requestRoommate(room.id);
      setRequestSent(true);
      setRequestSheetVisible(false);
    } catch (requestError) {
      Alert.alert(
        '요청 실패',
        requestError instanceof Error ? requestError.message : '잠시 후 다시 시도해주세요.',
      );
    }
  }, [requestRoommate, room]);

  return {
    room,
    loading,
    error,
    currentUserId,
    blocked,
    scrollRef,
    requestSent,
    requestSheetVisible,
    onBack: () => router.back(),
    openRequestSheet: () => setRequestSheetVisible(true),
    closeRequestSheet: () => setRequestSheetVisible(false),
    confirmRequest,
    handleSend,
    onMessagesChanged,
  };
}
