/**
 * 채팅 화면용 데이터 훅.
 */
import { useMemo } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';

import type { ChatRoom } from '@/lib/domain';

import {
  createChatRoom,
  type ChatRoomCreateRequest,
  type ChatRoomItem,
  getChatRoomDetail,
  getChatRooms,
  leaveChatRoom,
  uploadChatImage,
  type ChatImageUpload,
} from './chat';
import { toApiActionError } from './client';
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
import { toChatRoomModel } from './mappers/chat';
import {
  acceptRoommateRequest,
  cancelRoommateRequest,
  createRoommateRequest,
  rejectRoommateRequest,
} from './roommate';
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
        // 개수 제한(ROOM_LIMIT_EXCEEDED) 등은 호출부에서 apiErrorCode 로 분기한다.
        throw toApiActionError(res, '채팅방을 만들지 못했습니다.');
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
    return toChatRoomModel(chatRoomId, state.data, currentMemberId);
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

  // 목록 키만 정확히 무효화한다. 접두사 매칭이면 상세 키 `['chat','rooms', id]` 까지 함께
  // 무효화되어, 소켓 ROOMMATE_REQUEST → reload() 와 겹친 중복 재조회가 발생한다.
  const refreshRequests = async () => {
    await Promise.all([
      queryClient.invalidateQueries({ queryKey: ['chat', 'rooms'], exact: true }),
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
      throw toApiActionError(res, fallbackMessage);
    }
    await refreshRequests();
    return res.data;
  };

  return {
    requestRoommate: async (chatRoomId: string | number) => {
      const res = await mutation.mutateAsync(chatRoomId);
      if (res.status !== 200 || res.error) {
        throw toApiActionError(res, '룸메이트 요청에 실패했습니다.');
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
