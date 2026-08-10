import * as ImagePicker from 'expo-image-picker';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useCallback, useEffect, useMemo, useRef, useState, type MutableRefObject } from 'react';
import { Alert, Linking, type ScrollView } from 'react-native';

import { useSafeBottomPadding } from '@/hooks/use-safe-bottom-padding';
import { AnalyticsEvent, logEvent } from '@/lib/analytics';
import {
  apiErrorCode,
  type ChatSocketEnvelope,
  type ChatSocketStatus,
  getMyRoommate,
  toChatSocketMessage,
  USE_MOCK,
  useAccountActions,
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

import type { ChatPhotoPickerAsset } from './chat-photo-picker';
import { mergeMessages, reconcileWithServerMessages } from './chat-message-state';

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
  /** 상대방이 채팅방을 나가 더 이상 전송할 수 없는 상태. */
  opponentLeft: boolean;
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
  scrollRef: MutableRefObject<ScrollView | null>;
  requestSheetVisible: boolean;
  /** 헤더 더보기(⋯) 바텀시트: 사용자 차단하기 / 사용자 신고하기 / 채팅방 나가기. */
  menuSheetVisible: boolean;
  openMenuSheet: () => void;
  closeMenuSheet: () => void;
  blockPeer: () => void;
  reportPeer: () => void;
  leaveFromMenu: () => void;
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
  /** 인앱 사진 선택 모달(Figma "최근 항목")의 열림 상태. */
  photoPickerVisible: boolean;
  openPhotoPicker: () => void;
  closePhotoPicker: () => void;
  /** 선택/촬영한 사진을 업로드하고 IMAGE 메시지로 보낸다. */
  sendImageFile: (file: ChatPhotoPickerAsset) => Promise<void>;
  /** 사진 선택 모달의 카메라 타일 — 촬영 후 바로 전송한다. */
  launchCamera: () => Promise<void>;
  /** 룸메이트 요청 거절 확인 다이얼로그(Figma 커스텀 팝업). */
  rejectConfirmOpen: boolean;
  confirmReject: () => Promise<void>;
  cancelReject: () => void;
  /** 입력이 500자를 넘겨 잘렸을 때 띄우는 안내 토스트. */
  limitToastVisible: boolean;
  onLeave: () => void;
};

/** 채팅 입력 최대 길이. 초과분은 자르고 토스트로 안내한다. */
const MAX_MESSAGE_LENGTH = 500;
const LIMIT_TOAST_DURATION_MS = 2000;

/** 양쪽 중 한 명이라도 이미 룸메이트가 있을 때 서버가 409로 내려주는 코드. */
const ROOMMATE_ALREADY_EXISTS = 'ROOMMATE_ALREADY_EXISTS';

/** 현재 내 룸메이트 memberId. 조회 실패나 룸메이트 없음은 null로 처리한다. */
async function fetchMyRoommateMemberId(): Promise<string | null> {
  if (USE_MOCK) return null;
  try {
    const res = await getMyRoommate();
    const memberId = res.data?.myRoommateInfo?.memberId;
    return !res.error && memberId != null ? String(memberId) : null;
  } catch {
    return null;
  }
}

export function useChatRoomScreen(): UseChatRoomScreenReturn {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const chatRoomId = typeof id === 'string' ? id : '';
  const scrollRef = useRef<ScrollView | null>(null);
  const inputBottomPadding = useSafeBottomPadding(8, 8);
  const hydratedRoomIdRef = useRef('');
  const firstSent = useRef(false);
  const { isUserBlocked, blockUser } = useModeration();
  const { requestBlock } = useAccountActions();
  const { session } = useSession();
  const currentUserId = session?.user.id ?? 'me';
  const { data: roomDetail, loading, error, reload } = useChatRoomDetail(chatRoomId, currentUserId);
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
  const [limitToastVisible, setLimitToastVisible] = useState(false);
  const limitToastTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // TextInput의 maxLength는 초과 입력을 조용히 무시해 안내할 방법이 없다.
  // 대신 여기서 자르고, 잘린 순간 토스트로 알린다.
  const setDraftClamped = useCallback((next: string) => {
    if (next.length > MAX_MESSAGE_LENGTH) {
      setDraft(next.slice(0, MAX_MESSAGE_LENGTH));
      setLimitToastVisible(true);
      if (limitToastTimerRef.current) clearTimeout(limitToastTimerRef.current);
      limitToastTimerRef.current = setTimeout(
        () => setLimitToastVisible(false),
        LIMIT_TOAST_DURATION_MS,
      );
      return;
    }
    setDraft(next);
  }, []);

  useEffect(
    () => () => {
      if (limitToastTimerRef.current) clearTimeout(limitToastTimerRef.current);
    },
    [],
  );

  const [requestSheetVisible, setRequestSheetVisible] = useState(false);
  const [myRoommateMemberId, setMyRoommateMemberId] = useState<string | null>(null);
  const [imageViewer, setImageViewer] = useState<{ imageUrl: string; title: string } | null>(null);

  // opponentHasRoommate는 상대에게 룸메이트가 있는지만 뜻한다. 현재 상대가 실제 내
  // 룸메이트인지는 /roommates/me의 memberId와 상대 id를 직접 대조해야 한다.
  const roomId = roomDetail?.id;
  const peerId = roomDetail?.peer.id;
  useEffect(() => {
    setMyRoommateMemberId(null);
    if (!roomId || !peerId || USE_MOCK) return;
    let cancelled = false;
    fetchMyRoommateMemberId().then((memberId) => {
      if (!cancelled) setMyRoommateMemberId(memberId);
    });
    return () => {
      cancelled = true;
    };
  }, [peerId, roomId]);

  const roomMatched = USE_MOCK
    ? roomDetail?.matched === true
    : myRoommateMemberId != null && myRoommateMemberId === peerId;
  const selfHasRoommate = myRoommateMemberId != null && !roomMatched;
  const room = useMemo(
    () =>
      roomDetail ? { ...roomDetail, matched: roomMatched, acceptedRequest: roomMatched } : null,
    [roomDetail, roomMatched],
  );

  useEffect(() => {
    if (!room) return;
    setMessages((current) => {
      if (hydratedRoomIdRef.current !== room.id) {
        hydratedRoomIdRef.current = room.id;
        return room.messages;
      }
      return reconcileWithServerMessages(current, room.messages);
    });
  }, [room]);

  const onSocketEvent = useCallback(
    (event: ChatSocketEnvelope) => {
      if (event.eventType === 'ROOMMATE_REQUEST') {
        reload();
        return;
      }
      const message = toChatSocketMessage(event);
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

  // 상대가 나간 방에서는 서버가 전송을 예외로 막는다. FE도 무조건 입력을 잠근다.
  // LEFT_ROOM 행은 히스토리에 저장되므로, 소켓 이벤트를 놓치고 재진입해도 판정된다.
  const opponentLeft = useMemo(() => messages.some((message) => message.leftRoom), [messages]);

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

  // OS 피커 대신 인앱 사진 선택 모달을 띄운다. 카메라 촬영은 이 모달의 첫 타일에서 시작된다.
  const [photoPickerVisible, setPhotoPickerVisible] = useState(false);

  // 카메라는 OS 화면이 뜨는 동안 `uploadingImage` 로 잠기지 않는다(아직 업로드 전).
  // 연타로 카메라가 두 번 열려 같은 사진이 두 번 전송되는 것을 동기 ref 로 막는다.
  const pickingImageRef = useRef(false);

  const openPhotoPicker = useCallback(() => {
    if (opponentLeft) return;
    if (!USE_MOCK && socket.status !== 'connected') {
      Alert.alert('연결 확인', '채팅 서버 연결 후 이미지를 보낼 수 있어요.');
      return;
    }
    setPhotoPickerVisible(true);
  }, [opponentLeft, socket.status]);

  const closePhotoPicker = useCallback(() => {
    if (uploadingImage) return;
    setPhotoPickerVisible(false);
  }, [uploadingImage]);

  const sendImageFile = useCallback(
    async (file: ChatPhotoPickerAsset) => {
      if (!room || uploadingImage) return;
      try {
        const uploaded = await uploadImage(room.id, file);
        const imageUrl = uploaded?.imageUrl;
        if (!imageUrl) throw new Error('업로드된 이미지 주소를 받지 못했습니다.');
        const clientMessageId = USE_MOCK
          ? `mock-image-${Date.now()}`
          : socket.send({ type: 'IMAGE', message: '', imageUrl });
        if (!clientMessageId) throw new Error('채팅 서버에 연결되지 않았습니다.');
        appendOptimisticMessage(clientMessageId, '', 'image', imageUrl);
        setPhotoPickerVisible(false);
      } catch (uploadError) {
        Alert.alert(
          '이미지 전송 실패',
          uploadError instanceof Error ? uploadError.message : '잠시 후 다시 시도해주세요.',
        );
      }
    },
    [appendOptimisticMessage, room, socket, uploadImage, uploadingImage],
  );

  // iOS 카메라 화면에는 "사진 사용" 확인이 이미 있으므로, 촬영 성공 시 미리보기 없이 바로 보낸다.
  const launchCamera = useCallback(async () => {
    if (pickingImageRef.current) return;
    pickingImageRef.current = true;
    try {
      const permission = await ImagePicker.requestCameraPermissionsAsync();
      if (!permission.granted) {
        Alert.alert(
          '카메라 권한 필요',
          '설정에서 카메라 접근을 허용하면 사진을 찍어 보낼 수 있어요.',
          [
            { text: '취소', style: 'cancel' },
            { text: '설정 열기', onPress: () => void Linking.openSettings() },
          ],
        );
        return;
      }
      const result = await ImagePicker.launchCameraAsync({ quality: 0.85 });
      const asset = result.assets?.[0];
      if (result.canceled || !asset) return;
      await sendImageFile({
        uri: asset.uri,
        name: asset.fileName ?? `chat-${Date.now()}.jpg`,
        type: asset.mimeType ?? 'image/jpeg',
      });
    } finally {
      pickingImageRef.current = false;
    }
  }, [sendImageFile]);

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
      setMyRoommateMemberId(await fetchMyRoommateMemberId());
    } catch (requestError) {
      // 이미 한쪽이 매칭된 뒤의 수락은 서버가 409로 막는다. 알럿 대신 최신 상태를 다시 받아와
      // 배너/카드가 "이미 매칭됨"을 그대로 보여주게 한다.
      if (apiErrorCode(requestError) === ROOMMATE_ALREADY_EXISTS) {
        reload();
        const memberId = await fetchMyRoommateMemberId();
        setMyRoommateMemberId(memberId);
        const self = memberId != null && memberId !== room.peer.id;
        // 두 플래그 모두 상태를 못 잡으면 배너/카드가 안 바뀌어 무반응이 된다.
        // 그 경우에만 기존 알럿으로 폴백해 최소한의 피드백을 준다.
        if (!self && !room.opponentHasRoommate) showRequestError(requestError);
        return;
      }
      showRequestError(requestError);
    }
  }, [acceptRoommateRequest, reload, room]);

  // 거절은 시스템 Alert가 아니라 Figma 커스텀 팝업(ReadyConfirmDialog)으로 확인받는다.
  const [rejectConfirmOpen, setRejectConfirmOpen] = useState(false);

  const confirmReject = useCallback(async () => {
    const request = room?.roommateRequest;
    if (!request) return;
    setRejectConfirmOpen(false);
    try {
      await rejectRoommateRequest(request.id);
    } catch (requestError) {
      showRequestError(requestError);
    }
  }, [rejectRoommateRequest, room?.roommateRequest]);

  const confirmCancelRequest = useCallback(() => {
    const request = room?.roommateRequest;
    if (!request) return;
    Alert.alert('룸메이트 요청 취소', '보낸 요청을 취소할까요?', [
      { text: '아니요', style: 'cancel' },
      {
        text: '취소하기',
        style: 'destructive',
        onPress: async () => {
          try {
            await cancelRoommateRequest(request.id);
          } catch (requestError) {
            showRequestError(requestError);
          }
        },
      },
    ]);
  }, [cancelRoommateRequest, room?.roommateRequest]);

  const peerName = room?.peer.name;
  const currentUserName = session?.user.name;
  const openImageViewer = useCallback(
    (message: ChatRoomBubble) => {
      if (!message.imageUrl) return;
      setImageViewer({
        imageUrl: message.imageUrl,
        title: message.mine ? (currentUserName ?? '나') : (peerName ?? '상대방'),
      });
    },
    [currentUserName, peerName],
  );
  const closeImageViewer = useCallback(() => setImageViewer(null), []);

  const [menuSheetVisible, setMenuSheetVisible] = useState(false);

  // 시트(Modal)가 닫히는 도중 Alert/네비게이션을 띄우면 iOS에서 dismiss 중인 모달에
  // 붙어 묻힐 수 있어, 닫힘 애니메이션이 끝난 뒤 실행한다.
  const closeMenuSheetThen = useCallback((action: () => void) => {
    setMenuSheetVisible(false);
    setTimeout(action, 350);
  }, []);

  const blockPeer = useCallback(() => {
    if (!room) return;
    const memberId = Number(room.peer.id);
    closeMenuSheetThen(() => {
      if (!Number.isFinite(memberId)) {
        Alert.alert('차단 실패', '상대 사용자 정보를 확인하지 못했습니다.');
        return;
      }
      Alert.alert('사용자 차단', `${room.peer.name}님을 차단할까요?`, [
        { text: '취소', style: 'cancel' },
        {
          text: '차단',
          style: 'destructive',
          onPress: () => {
            // 서버에 차단을 등록해야 마이페이지 차단목록에 생기고 해제도 가능하다.
            // (requestBlock이 차단목록 캐시 무효화까지 수행)
            void (async () => {
              try {
                await requestBlock(memberId);
                blockUser(room.peer.id);
              } catch (blockError) {
                Alert.alert(
                  '차단 실패',
                  blockError instanceof Error ? blockError.message : '잠시 후 다시 시도해주세요.',
                );
              }
            })();
          },
        },
      ]);
    });
  }, [blockUser, closeMenuSheetThen, requestBlock, room]);

  const reportPeer = useCallback(() => {
    if (!room) return;
    closeMenuSheetThen(() => {
      router.push({
        pathname: '/moderation/report',
        params: { target: 'match', id: room.peer.id },
      } as never);
    });
  }, [closeMenuSheetThen, room, router]);

  const confirmLeave = useCallback(() => {
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
  }, [leaveChat, room, router]);

  useEffect(() => {
    const timer = setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 50);
    return () => clearTimeout(timer);
  }, [messages.length]);

  return {
    room,
    messages: bubbles,
    timeline,
    draft,
    setDraft: setDraftClamped,
    limitToastVisible,
    canSend:
      !opponentLeft && draft.trim().length > 0 && (USE_MOCK || socket.status === 'connected'),
    opponentLeft,
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
    scrollRef,
    requestSheetVisible,
    menuSheetVisible,
    openMenuSheet: () => setMenuSheetVisible(true),
    closeMenuSheet: () => setMenuSheetVisible(false),
    blockPeer,
    reportPeer,
    leaveFromMenu: () => closeMenuSheetThen(confirmLeave),
    imageViewer,
    openImageViewer,
    closeImageViewer,
    onBack: () => router.back(),
    openRequestSheet: () => setRequestSheetVisible(true),
    closeRequestSheet: () => setRequestSheetVisible(false),
    confirmRequest,
    acceptRequest,
    rejectRequest: () => setRejectConfirmOpen(true),
    cancelRequest: confirmCancelRequest,
    rejectConfirmOpen,
    confirmReject,
    cancelReject: () => setRejectConfirmOpen(false),
    sendMessage,
    photoPickerVisible,
    openPhotoPicker,
    closePhotoPicker,
    sendImageFile,
    launchCamera,
    onLeave: confirmLeave,
  };
}

function showRequestError(error: unknown) {
  Alert.alert(
    '요청 처리 실패',
    error instanceof Error ? error.message : '잠시 후 다시 시도해주세요.',
  );
}
