/**
 * 채팅 화면용 데이터 훅.
 */
import { useMemo } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';

import type { ChatMessage, ChatRoom, UserSummary } from '@/lib/domain';

import {
  createChatRoom,
  type ChatRoomCreateRequest,
  type ChatRoomDetailData,
  type ChatRoomItem,
  getChatRoomDetail,
  getChatRooms,
  leaveChatRoom,
  uploadChatImage,
  type ChatImageUpload,
} from './chat';
import {
  acceptChatRequest,
  cancelChatRequest,
  createChatRequest,
  getChatRequestDetail,
  getChatRequests,
  rejectChatRequest,
  type ChatRequestCreate,
  type ChatRequestDetailData,
  type ChatRequestItem,
} from './chat-requests';
import { parseServerDate } from './date-time';
import { createRoommateRequest } from './roommate';
import { acceptRoommateRequest, cancelRoommateRequest, rejectRoommateRequest } from './roommate';
import { type AsyncState, useApi } from './use-async';

/** 채팅방 목록. (ChatRoomItem 그대로 — 명세 형태) */
export function useChatRooms(enabled = true): AsyncState<ChatRoomItem[]> {
  const state = useApi(['chat', 'rooms'], () => getChatRooms(), { enabled, retry: false });
  return { ...state, data: state.data?.chatRooms ?? null };
}

/** 채팅 요청 승인 단계 없이 채팅방을 바로 생성한다. */
export function useCreateChatRoom() {
  const queryClient = useQueryClient();
  const mutation = useMutation({
    mutationFn: (body: ChatRoomCreateRequest) => createChatRoom(body),
  });

  return {
    createRoom: async (body: ChatRoomCreateRequest) => {
      const res = await mutation.mutateAsync(body);
      const chatRoomId = res.data?.chatRoomId;
      if (res.status < 200 || res.status >= 300 || res.error || chatRoomId == null) {
        throw new Error(res.error?.message ?? '채팅방을 만들지 못했습니다.');
      }
      await queryClient.invalidateQueries({ queryKey: ['chat', 'rooms'] });
      return chatRoomId;
    },
    creatingRoom: mutation.isPending,
  };
}

export function useChatRequests(enabled = true): AsyncState<ChatRequestItem[]> {
  const state = useApi(['chat', 'requests'], () => getChatRequests(), { enabled, retry: false });
  return { ...state, data: state.data?.chatRequireds ?? null };
}

export function useChatRequestDetail(
  requestId: string,
  enabled = true,
): AsyncState<ChatRequestDetailData> {
  return useApi(['chat', 'requests', requestId], () => getChatRequestDetail(requestId), {
    enabled: enabled && requestId.length > 0,
    retry: false,
  });
}

export function useChatRoomDetail(
  chatRoomId: string,
  currentMemberId?: string,
): AsyncState<ChatRoom> {
  const state = useApi(['chat', 'rooms', chatRoomId], () => getChatRoomDetail(chatRoomId), {
    enabled: chatRoomId.length > 0,
    retry: false,
  });
  const room = useMemo<ChatRoom | null>(() => {
    if (!state.data) return null;
    return chatRoomDetailToDomainRoom(chatRoomId, state.data, currentMemberId);
  }, [chatRoomId, currentMemberId, state.data]);

  return {
    ...state,
    data: room,
    loading: state.loading,
    error: state.error ?? (!state.loading && !room ? '채팅방을 찾을 수 없습니다.' : null),
  };
}

export function useChatRoomActions() {
  const queryClient = useQueryClient();
  const leaveMutation = useMutation({
    mutationFn: (chatRoomId: string) => leaveChatRoom(chatRoomId),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['chat', 'rooms'] });
    },
  });
  const uploadImageMutation = useMutation({
    mutationFn: ({ chatRoomId, file }: { chatRoomId: string; file: ChatImageUpload }) =>
      uploadChatImage(chatRoomId, file),
  });

  return {
    leaveChat: async (chatRoomId: string) => {
      const res = await leaveMutation.mutateAsync(chatRoomId);
      if (res.status !== 200 || res.error) {
        throw new Error(res.error?.message ?? '채팅방을 나가지 못했습니다.');
      }
      return res.data;
    },
    uploadImage: async (chatRoomId: string, file: ChatImageUpload) => {
      const res = await uploadImageMutation.mutateAsync({ chatRoomId, file });
      if (res.status !== 200 || res.error) {
        throw new Error(res.error?.message ?? '이미지를 업로드하지 못했습니다.');
      }
      return res.data;
    },
    leaving: leaveMutation.isPending,
    uploadingImage: uploadImageMutation.isPending,
  };
}

export function useRoommateRequestAction() {
  const queryClient = useQueryClient();
  const mutation = useMutation({
    mutationFn: (chatRoomId: string | number) =>
      createRoommateRequest({ chatRoomId: Number(chatRoomId) }),
  });

  const acceptMutation = useMutation({ mutationFn: acceptRoommateRequest });
  const rejectMutation = useMutation({ mutationFn: rejectRoommateRequest });
  const cancelMutation = useMutation({ mutationFn: cancelRoommateRequest });

  const refreshRequests = async () => {
    await Promise.all([
      queryClient.invalidateQueries({ queryKey: ['chat', 'rooms'] }),
      queryClient.invalidateQueries({ queryKey: ['roommate', 'requests'] }),
    ]);
  };

  const runRequestAction = async (
    requestId: string,
    action: typeof acceptMutation | typeof rejectMutation | typeof cancelMutation,
    fallbackMessage: string,
  ) => {
    const res = await action.mutateAsync(requestId);
    if (res.status !== 200 || res.error) {
      throw new Error(res.error?.message ?? fallbackMessage);
    }
    await refreshRequests();
    return res.data;
  };

  return {
    requestRoommate: async (chatRoomId: string | number) => {
      const res = await mutation.mutateAsync(chatRoomId);
      if (res.status !== 200 || res.error) {
        throw new Error(res.error?.message ?? '룸메이트 요청에 실패했습니다.');
      }
      await refreshRequests();
      return res.data;
    },
    acceptRequest: (requestId: string) =>
      runRequestAction(requestId, acceptMutation, '룸메이트 요청을 수락하지 못했습니다.'),
    rejectRequest: (requestId: string) =>
      runRequestAction(requestId, rejectMutation, '룸메이트 요청을 거절하지 못했습니다.'),
    cancelRequest: (requestId: string) =>
      runRequestAction(requestId, cancelMutation, '룸메이트 요청을 취소하지 못했습니다.'),
    requesting: mutation.isPending,
    processingRequest:
      acceptMutation.isPending || rejectMutation.isPending || cancelMutation.isPending,
  };
}

export function useChatRequestActions() {
  const queryClient = useQueryClient();
  const createMutation = useMutation({
    mutationFn: (body: ChatRequestCreate) => createChatRequest(body),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['chat', 'requests'] });
      await queryClient.invalidateQueries({ queryKey: ['chat', 'rooms'] });
    },
  });
  const acceptMutation = useMutation({ mutationFn: acceptChatRequest });
  const rejectMutation = useMutation({ mutationFn: rejectChatRequest });
  const cancelMutation = useMutation({ mutationFn: cancelChatRequest });

  const refreshChat = async () => {
    await Promise.all([
      queryClient.invalidateQueries({ queryKey: ['chat', 'requests'] }),
      queryClient.invalidateQueries({ queryKey: ['chat', 'rooms'] }),
    ]);
  };

  const runAction = async (
    requestId: string,
    action: typeof acceptMutation | typeof rejectMutation | typeof cancelMutation,
    fallbackMessage: string,
  ) => {
    const res = await action.mutateAsync(requestId);
    if (res.status !== 200 || res.error) throw new Error(res.error?.message ?? fallbackMessage);
    await refreshChat();
    return res.data;
  };

  return {
    requestChat: async (body: ChatRequestCreate) => {
      const res = await createMutation.mutateAsync(body);
      if (res.status !== 200 || res.error) {
        throw new Error(res.error?.message ?? '채팅 요청에 실패했습니다.');
      }
      await refreshChat();
      return res.data;
    },
    acceptChat: (requestId: string) =>
      runAction(requestId, acceptMutation, '채팅 요청을 수락하지 못했습니다.'),
    rejectChat: (requestId: string) =>
      runAction(requestId, rejectMutation, '채팅 요청을 거절하지 못했습니다.'),
    cancelChat: (requestId: string) =>
      runAction(requestId, cancelMutation, '채팅 요청을 취소하지 못했습니다.'),
    requestingChat: createMutation.isPending,
    processingChatRequest:
      acceptMutation.isPending || rejectMutation.isPending || cancelMutation.isPending,
  };
}

function chatRoomItemToDomainRoom(item: ChatRoomItem): ChatRoom {
  const id = String(item.chatRoomId ?? '');
  const peer = userFromChatRoom(item);
  const messages = initialMessagesFromChatRoom(item, peer.id);
  return {
    id,
    peer,
    messages,
    matched: item.isAgree === true,
    acceptedRequest: item.isAgree === true,
  };
}

function chatRoomDetailToDomainRoom(
  chatRoomId: string,
  detail: ChatRoomDetailData,
  currentMemberId?: string,
): ChatRoom {
  const peer = userFromChatRoomDetail(detail);
  const messages = detailMessages(detail, peer.id);
  const matched =
    detail.matchingRequiredList?.some((request) => request.status === 'ACCEPTED') === true;
  const latestRequest = [...(detail.matchingRequiredList ?? [])]
    .filter((request) => request.requiredId != null && request.status != null)
    .sort((a, b) => (b.createdAt ?? '').localeCompare(a.createdAt ?? ''))[0];
  const role = latestRequest
    ? String(latestRequest.requesterMemberId) === currentMemberId
      ? 'requester'
      : String(latestRequest.requesteeMemberId) === currentMemberId
        ? 'requestee'
        : 'unknown'
    : undefined;
  return {
    id: chatRoomId,
    peer,
    messages,
    matched,
    acceptedRequest: matched,
    roommateRequest:
      latestRequest?.requiredId != null && latestRequest.status
        ? {
            id: String(latestRequest.requiredId),
            status: latestRequest.status,
            role: role ?? 'unknown',
          }
        : undefined,
  };
}

function userFromChatRoom(item: ChatRoomItem): UserSummary {
  const name = item.name ?? '사용자';
  return {
    id: String(item.chatRoomId ?? name),
    name,
    age: 0,
    gender: 'other',
    preferredGender: 'any',
    bio: '',
    region: {
      id: 'unknown',
      city: '-',
      district: '',
    },
    badges: [],
    lifestyle: {},
    importantConditions: [],
  };
}

function userFromChatRoomDetail(detail: ChatRoomDetailData): UserSummary {
  const profile = detail.opponentProfile;
  const name = profile?.name ?? '사용자';
  return {
    id: String(profile?.id ?? name),
    name,
    age: profile?.age ?? 0,
    gender: profile?.gender === 'FEMALE' ? 'female' : profile?.gender === 'MALE' ? 'male' : 'other',
    preferredGender: 'any',
    bio: '',
    avatarUrl: profile?.memberProfileImageUrl,
    compatibilityScore: profile?.score,
    region: {
      id: 'unknown',
      city: '-',
      district: '',
    },
    badges: [],
    lifestyle: {},
    importantConditions: [],
  };
}

function initialMessagesFromChatRoom(item: ChatRoomItem, peerId: string): ChatMessage[] {
  const createdAt = parseDate(item.lastMessageAt ?? item.creatAt ?? item.createdAt);
  const messages: ChatMessage[] = [
    {
      id: `chat-${item.chatRoomId ?? 'new'}-system`,
      authorId: 'system',
      body: item.isAgree ? '룸메이트가 확정되었어요.' : '채팅이 시작되었어요.',
      sentAt: createdAt,
      kind: 'system',
    },
  ];

  if (item.lastMessage) {
    messages.push({
      id: `chat-${item.chatRoomId ?? 'new'}-last`,
      authorId: peerId,
      body: item.lastMessage,
      sentAt: createdAt,
      kind: 'text',
    });
  }

  return messages;
}

function detailMessages(detail: ChatRoomDetailData, peerId: string): ChatMessage[] {
  const messages =
    detail.messages?.map((message) => {
      const type = message.type;
      const isSystem = type === 'LEFT_ROOM';
      const isImage = type === 'IMAGE';
      return {
        id: String(
          message.id ?? `${message.senderId ?? 'system'}-${message.createdAt ?? Date.now()}`,
        ),
        authorId: isSystem ? 'system' : String(message.senderId ?? peerId),
        body: isSystem
          ? '채팅방을 나갔어요.'
          : message.contents || message.imageUrl || '이미지 메시지',
        imageUrl: isImage ? message.imageUrl : undefined,
        sentAt: parseDate(message.createdAt),
        kind: isSystem ? 'system' : isImage ? 'image' : 'text',
      } satisfies ChatMessage;
    }) ?? [];

  if (messages.length > 0) return messages;

  return [
    {
      id: `chat-${detail.opponentProfile?.id ?? 'new'}-system`,
      authorId: 'system',
      body: '채팅이 시작되었어요.',
      sentAt: new Date(),
      kind: 'system',
    },
  ];
}

function parseDate(value?: string): Date {
  return parseServerDate(value) ?? new Date();
}
