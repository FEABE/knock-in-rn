import * as ImagePicker from 'expo-image-picker';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useCallback, useEffect, useMemo, useRef, useState, type MutableRefObject } from 'react';
import { Alert, type ScrollView } from 'react-native';

import { useSafeBottomPadding } from '@/hooks/use-safe-bottom-padding';
import { AnalyticsEvent, logEvent } from '@/lib/analytics';
import {
  type ChatSocketEnvelope,
  type ChatSocketStatus,
  parseServerDate,
  USE_MOCK,
  useChatRoomActions,
  useChatRoomDetail,
  useChatSocket,
  useRoommateRequestAction,
} from '@/lib/api';
import {
  useModeration,
  useSession,
  type ChatMessage,
  type ChatRoom as DomainChatRoom,
} from '@/lib/domain';

export type ChatRoomBubble = ChatMessage & { mine: boolean };

export type UseChatRoomScreenReturn = {
  room: DomainChatRoom | null;
  messages: ChatRoomBubble[];
  draft: string;
  setDraft: (next: string) => void;
  canSend: boolean;
  loading: boolean;
  error: string | null;
  currentUserId: string;
  blocked: boolean;
  socketStatus: ChatSocketStatus;
  socketError: string | null;
  retrySocket: () => void;
  uploadingImage: boolean;
  processingRequest: boolean;
  inputBottomPadding: number;
  modalBottomPadding: number;
  scrollRef: MutableRefObject<ScrollView | null>;
  requestSheetVisible: boolean;
  onBack: () => void;
  openRequestSheet: () => void;
  closeRequestSheet: () => void;
  confirmRequest: () => Promise<void>;
  acceptRequest: () => Promise<void>;
  rejectRequest: () => void;
  cancelRequest: () => void;
  sendMessage: () => void;
  pickAndSendImage: () => Promise<void>;
  onLeave: () => void;
};

export function useChatRoomScreen(): UseChatRoomScreenReturn {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const chatRoomId = typeof id === 'string' ? id : '';
  const scrollRef = useRef<ScrollView | null>(null);
  const inputBottomPadding = useSafeBottomPadding(8, 8);
  const modalBottomPadding = useSafeBottomPadding(16, 20);
  const hydratedRoomIdRef = useRef('');
  const firstSent = useRef(false);
  const { isUserBlocked } = useModeration();
  const { session } = useSession();
  const currentUserId = session?.user.id ?? 'me';
  const { data: room, loading, error, reload } = useChatRoomDetail(chatRoomId, currentUserId);
  const { leaveChat, uploadImage, uploadingImage } = useChatRoomActions();
  const {
    requestRoommate,
    acceptRequest: acceptRoommateRequest,
    rejectRequest: rejectRoommateRequest,
    cancelRequest: cancelRoommateRequest,
    processingRequest,
  } = useRoommateRequestAction();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [draft, setDraft] = useState('');
  const [requestSheetVisible, setRequestSheetVisible] = useState(false);

  useEffect(() => {
    if (!room) return;
    setMessages((current) => {
      if (hydratedRoomIdRef.current !== room.id) {
        hydratedRoomIdRef.current = room.id;
        return room.messages;
      }
      return mergeMessages(current, room.messages);
    });
  }, [room]);

  const onSocketEvent = useCallback(
    (event: ChatSocketEnvelope) => {
      if (event.eventType === 'ROOMMATE_REQUEST') {
        reload();
        return;
      }
      const message = socketEventToMessage(event);
      if (message) setMessages((current) => mergeMessages(current, [message]));
    },
    [reload],
  );

  const socket = useChatSocket({
    chatRoomId,
    enabled: Boolean(session && room && !USE_MOCK),
    onEvent: onSocketEvent,
  });

  const blocked = useMemo(
    () => (room ? isUserBlocked(room.peer.id) : false),
    [isUserBlocked, room],
  );
  const bubbles = useMemo<ChatRoomBubble[]>(
    () => messages.map((message) => ({ ...message, mine: message.authorId === currentUserId })),
    [currentUserId, messages],
  );

  const appendOptimisticMessage = useCallback(
    (id: string, body: string, kind: ChatMessage['kind'], imageUrl?: string) => {
      setMessages((current) =>
        mergeMessages(current, [
          { id, authorId: currentUserId, body, kind, imageUrl, sentAt: new Date() },
        ]),
      );
    },
    [currentUserId],
  );

  const sendMessage = useCallback(() => {
    const body = draft.trim();
    if (!body) return;
    const clientMessageId = USE_MOCK
      ? `mock-${Date.now()}`
      : socket.send({ type: 'TEXT', message: body });
    if (!clientMessageId) {
      Alert.alert('연결 확인', '채팅 서버에 연결 중이에요. 잠시 후 다시 시도해주세요.');
      return;
    }
    appendOptimisticMessage(clientMessageId, body, 'text');
    setDraft('');
    if (!firstSent.current) {
      firstSent.current = true;
      logEvent(AnalyticsEvent.CHAT_FIRST_MESSAGE_SENT, { room_id: room?.id ?? chatRoomId });
    }
  }, [appendOptimisticMessage, chatRoomId, draft, room?.id, socket]);

  const pickAndSendImage = useCallback(async () => {
    if (!USE_MOCK && socket.status !== 'connected') {
      Alert.alert('연결 확인', '채팅 서버 연결 후 이미지를 보낼 수 있어요.');
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsMultipleSelection: false,
      quality: 0.85,
    });
    const asset = result.assets?.[0];
    if (result.canceled || !asset || !room) return;

    try {
      const uploaded = await uploadImage(room.id, {
        uri: asset.uri,
        name: asset.fileName ?? `chat-${Date.now()}.jpg`,
        type: asset.mimeType ?? 'image/jpeg',
      });
      const imageUrl = uploaded?.imageUrl;
      if (!imageUrl) throw new Error('업로드된 이미지 주소를 받지 못했습니다.');
      const clientMessageId = USE_MOCK
        ? `mock-image-${Date.now()}`
        : socket.send({ type: 'IMAGE', message: '', imageUrl });
      if (!clientMessageId) throw new Error('채팅 서버에 연결되지 않았습니다.');
      appendOptimisticMessage(clientMessageId, '', 'image', imageUrl);
    } catch (uploadError) {
      Alert.alert(
        '이미지 전송 실패',
        uploadError instanceof Error ? uploadError.message : '잠시 후 다시 시도해주세요.',
      );
    }
  }, [appendOptimisticMessage, room, socket, uploadImage]);

  const confirmRequest = useCallback(async () => {
    if (!room) return;
    try {
      await requestRoommate(room.id);
      setRequestSheetVisible(false);
    } catch (requestError) {
      showRequestError(requestError);
    }
  }, [requestRoommate, room]);

  const acceptRequest = useCallback(async () => {
    if (!room?.roommateRequest) return;
    try {
      await acceptRoommateRequest(room.roommateRequest.id);
    } catch (requestError) {
      showRequestError(requestError);
    }
  }, [acceptRoommateRequest, room?.roommateRequest]);

  const confirmRequestAction = useCallback(
    (kind: 'reject' | 'cancel') => {
      const request = room?.roommateRequest;
      if (!request) return;
      const reject = kind === 'reject';
      Alert.alert(
        reject ? '룸메이트 요청 거절' : '룸메이트 요청 취소',
        reject ? '이 요청을 거절할까요?' : '보낸 요청을 취소할까요?',
        [
          { text: '아니요', style: 'cancel' },
          {
            text: reject ? '거절' : '취소하기',
            style: 'destructive',
            onPress: async () => {
              try {
                if (reject) await rejectRoommateRequest(request.id);
                else await cancelRoommateRequest(request.id);
              } catch (requestError) {
                showRequestError(requestError);
              }
            },
          },
        ],
      );
    },
    [cancelRoommateRequest, rejectRoommateRequest, room?.roommateRequest],
  );

  useEffect(() => {
    const timer = setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 50);
    return () => clearTimeout(timer);
  }, [messages.length]);

  return {
    room,
    messages: bubbles,
    draft,
    setDraft,
    canSend: draft.trim().length > 0 && (USE_MOCK || socket.status === 'connected'),
    loading,
    error,
    currentUserId,
    blocked,
    socketStatus: USE_MOCK ? 'connected' : socket.status,
    socketError: socket.error,
    retrySocket: socket.retry,
    uploadingImage,
    processingRequest,
    inputBottomPadding,
    modalBottomPadding,
    scrollRef,
    requestSheetVisible,
    onBack: () => router.back(),
    openRequestSheet: () => setRequestSheetVisible(true),
    closeRequestSheet: () => setRequestSheetVisible(false),
    confirmRequest,
    acceptRequest,
    rejectRequest: () => confirmRequestAction('reject'),
    cancelRequest: () => confirmRequestAction('cancel'),
    sendMessage,
    pickAndSendImage,
    onLeave: () => {
      if (!room) return;
      Alert.alert('채팅방 나가기', '이 채팅방을 나갈까요?', [
        { text: '취소', style: 'cancel' },
        {
          text: '나가기',
          style: 'destructive',
          onPress: async () => {
            try {
              await leaveChat(room.id);
              router.back();
            } catch (leaveError) {
              Alert.alert(
                '나가기 실패',
                leaveError instanceof Error ? leaveError.message : '잠시 후 다시 시도해주세요.',
              );
            }
          },
        },
      ]);
    },
  };
}

function socketEventToMessage(event: ChatSocketEnvelope): ChatMessage | null {
  const payload = event.payload as {
    clientMessageId?: string;
    senderId?: number;
    type?: 'TEXT' | 'IMAGE' | 'LEFT_ROOM';
    contents?: string;
    imageUrl?: string;
  };
  const body = payload.contents ?? '';
  const sentAt = parseServerDate(event.createdAt) ?? new Date();
  const id =
    payload.clientMessageId ??
    `${event.chatRoomId}-${payload.senderId ?? 'system'}-${sentAt.getTime()}-${payload.type ?? 'TEXT'}`;
  if (payload.type === 'LEFT_ROOM' || event.eventType === 'SYSTEM_MESSAGE') {
    return { id, authorId: 'system', body, sentAt, kind: 'system' };
  }
  if (payload.type === 'IMAGE') {
    return {
      id,
      authorId: String(payload.senderId ?? 'unknown'),
      body,
      imageUrl: payload.imageUrl,
      sentAt,
      kind: 'image',
    };
  }
  return {
    id,
    authorId: String(payload.senderId ?? 'unknown'),
    body,
    sentAt,
    kind: 'text',
  };
}

function mergeMessages(current: ChatMessage[], incoming: ChatMessage[]): ChatMessage[] {
  const byId = new Map(current.map((message) => [message.id, message]));
  incoming.forEach((message) => byId.set(message.id, { ...byId.get(message.id), ...message }));
  return [...byId.values()].sort((a, b) => a.sentAt.getTime() - b.sentAt.getTime());
}

function showRequestError(error: unknown) {
  Alert.alert(
    '요청 처리 실패',
    error instanceof Error ? error.message : '잠시 후 다시 시도해주세요.',
  );
}
