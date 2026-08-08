import * as ImagePicker from 'expo-image-picker';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useCallback, useEffect, useMemo, useRef, useState, type MutableRefObject } from 'react';
import { Alert, type ScrollView } from 'react-native';

import { useSafeBottomPadding } from '@/hooks/use-safe-bottom-padding';
import { AnalyticsEvent, logEvent } from '@/lib/analytics';
import {
  apiErrorCode,
  type ChatSocketEnvelope,
  type ChatSocketStatus,
  getMyRoommate,
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

/**
 * 대화 흐름에 섞여 들어가는 아이템. 룸메이트 요청 카드는 항상 맨 아래가 아니라
 * 요청이 생성된 시각에 앵커링되어, 이후 주고받은 메시지가 카드 아래에 오도록 한다.
 */
export type ChatTimelineItem =
  | { kind: 'message'; message: ChatRoomBubble; at: Date }
  | { kind: 'request-card'; at: Date }
  | { kind: 'matched-pill'; at: Date };

/** 같은 시각일 때의 렌더 순서: 메시지 → 요청 카드 → 매칭 칩. */
const TIMELINE_KIND_ORDER: Record<ChatTimelineItem['kind'], number> = {
  message: 0,
  'request-card': 1,
  'matched-pill': 2,
};

export type UseChatRoomScreenReturn = {
  room: DomainChatRoom | null;
  messages: ChatRoomBubble[];
  timeline: ChatTimelineItem[];
  draft: string;
  setDraft: (next: string) => void;
  canSend: boolean;
  loading: boolean;
  error: string | null;
  currentUserId: string;
  blocked: boolean;
  /** 내가 이미 다른 룸메이트와 매칭되어 있는지. 이 방이 매칭된 방이면 항상 false. */
  selfHasRoommate: boolean;
  socketStatus: ChatSocketStatus;
  socketError: string | null;
  retrySocket: () => void;
  uploadingImage: boolean;
  processingRequest: boolean;
  inputBottomPadding: number;
  modalBottomPadding: number;
  scrollRef: MutableRefObject<ScrollView | null>;
  requestSheetVisible: boolean;
  /** 전체화면으로 펼쳐 볼 이미지. null이면 뷰어가 닫힌 상태. */
  imageViewer: { imageUrl: string; title: string } | null;
  openImageViewer: (message: ChatRoomBubble) => void;
  closeImageViewer: () => void;
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

/** 양쪽 중 한 명이라도 이미 룸메이트가 있을 때 서버가 409로 내려주는 코드. */
const ROOMMATE_ALREADY_EXISTS = 'ROOMMATE_ALREADY_EXISTS';

/** 내가 이미 다른 룸메이트와 매칭되어 있는지. 실패는 조용히 false(화면 흐름을 막지 않는다). */
async function fetchSelfHasRoommate(): Promise<boolean> {
  if (USE_MOCK) return false;
  try {
    const res = await getMyRoommate();
    return !res.error && Boolean(res.data?.myRoommateInfo);
  } catch {
    return false;
  }
}

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
  const [selfHasRoommate, setSelfHasRoommate] = useState(false);
  const [imageViewer, setImageViewer] = useState<{ imageUrl: string; title: string } | null>(null);

  // 룸메이트 요청 가능 여부 판정에는 "내가 이미 매칭됐는지"가 필요하다.
  // 방이 바뀔 때마다 1회만 조회하고, 실패는 조용히 false로 둔다(화면 흐름을 막지 않는다).
  const roomId = room?.id;
  const roomMatched = room?.matched === true;
  useEffect(() => {
    setSelfHasRoommate(false);
    if (!roomId || roomMatched || USE_MOCK) return;
    let cancelled = false;
    fetchSelfHasRoommate().then((has) => {
      if (!cancelled) setSelfHasRoommate(has);
    });
    return () => {
      cancelled = true;
    };
  }, [roomId, roomMatched]);

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

  // room 객체는 소켓 reload마다 새 참조가 되므로 원시값으로 좁혀서 의존한다.
  const requestStatus = room?.roommateRequest?.status;
  const requestCreatedMs = room?.roommateRequest?.createdAt?.getTime();
  const requestUpdatedMs = room?.roommateRequest?.updatedAt?.getTime();

  const timeline = useMemo<ChatTimelineItem[]>(() => {
    const items: ChatTimelineItem[] = bubbles.map((message) => ({
      kind: 'message',
      message,
      at: message.sentAt,
    }));

    if (requestStatus) {
      // createdAt이 없으면 기존 동작대로 맨 아래에 둔다.
      const lastMessageAt = bubbles.length > 0 ? bubbles[bubbles.length - 1].sentAt : undefined;
      const cardAt =
        requestCreatedMs != null ? new Date(requestCreatedMs) : (lastMessageAt ?? new Date());
      items.push({ kind: 'request-card', at: cardAt });

      if (roomMatched && requestStatus === 'ACCEPTED') {
        // 칩은 어떤 경우에도 카드보다 앞설 수 없다.
        const pillMs = requestUpdatedMs ?? requestCreatedMs;
        const pillAt =
          pillMs != null && pillMs > cardAt.getTime() ? new Date(pillMs) : new Date(cardAt);
        items.push({ kind: 'matched-pill', at: pillAt });
      }
    }

    // Array.prototype.sort는 안정 정렬이므로 같은 시각의 메시지 순서는 그대로 유지된다.
    return items.sort(
      (a, b) =>
        a.at.getTime() - b.at.getTime() ||
        TIMELINE_KIND_ORDER[a.kind] - TIMELINE_KIND_ORDER[b.kind],
    );
  }, [bubbles, requestCreatedMs, requestStatus, requestUpdatedMs, roomMatched]);

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

  // 시트의 '요청하기' 버튼은 전송 중에도 눌리므로, 연타 시 두 번째 호출이 서버의
  // ROOMMATE_DUPLICATE("이미 대기중인 룸메이트 요청이 존재합니다.")로 떨어져
  // 요청이 실제로는 성공했는데도 실패 알럿이 뜬다. 동기 ref로 중복 전송을 막는다.
  const requestingRef = useRef(false);
  const [requesting, setRequesting] = useState(false);

  const confirmRequest = useCallback(async () => {
    if (!room || requestingRef.current) return;
    requestingRef.current = true;
    setRequesting(true);
    try {
      await requestRoommate(room.id);
      setRequestSheetVisible(false);
    } catch (requestError) {
      showRequestError(requestError);
    } finally {
      requestingRef.current = false;
      setRequesting(false);
    }
  }, [requestRoommate, room]);

  const acceptRequest = useCallback(async () => {
    if (!room?.roommateRequest) return;
    try {
      await acceptRoommateRequest(room.roommateRequest.id);
    } catch (requestError) {
      // 이미 한쪽이 매칭된 뒤의 수락은 서버가 409로 막는다. 알럿 대신 최신 상태를 다시 받아와
      // 배너/카드가 "이미 매칭됨"을 그대로 보여주게 한다.
      if (apiErrorCode(requestError) === ROOMMATE_ALREADY_EXISTS) {
        reload();
        fetchSelfHasRoommate().then(setSelfHasRoommate);
        return;
      }
      showRequestError(requestError);
    }
  }, [acceptRoommateRequest, reload, room?.roommateRequest]);

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

  const peerName = room?.peer.name;
  const myName = session?.user.name;
  const openImageViewer = useCallback(
    (message: ChatRoomBubble) => {
      if (!message.imageUrl) return;
      setImageViewer({
        imageUrl: message.imageUrl,
        title: message.mine ? (myName ?? '나') : (peerName ?? '상대방'),
      });
    },
    [myName, peerName],
  );
  const closeImageViewer = useCallback(() => setImageViewer(null), []);

  useEffect(() => {
    const timer = setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 50);
    return () => clearTimeout(timer);
  }, [messages.length]);

  return {
    room,
    messages: bubbles,
    timeline,
    draft,
    setDraft,
    canSend: draft.trim().length > 0 && (USE_MOCK || socket.status === 'connected'),
    loading,
    error,
    currentUserId,
    blocked,
    selfHasRoommate,
    socketStatus: USE_MOCK ? 'connected' : socket.status,
    socketError: socket.error,
    retrySocket: socket.retry,
    uploadingImage,
    processingRequest: processingRequest || requesting,
    inputBottomPadding,
    modalBottomPadding,
    scrollRef,
    requestSheetVisible,
    imageViewer,
    openImageViewer,
    closeImageViewer,
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
