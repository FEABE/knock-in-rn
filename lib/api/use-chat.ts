/**
 * 채팅 화면용 데이터 훅.
 */
import { useMemo } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';

import type { ChatMessage, ChatRoom, UserSummary } from '@/lib/domain';

import {
  type ChatRoomDetailData,
  type ChatRoomItem,
  getChatRoomDetail,
  getChatRooms,
  leaveChatRoom,
  uploadChatImage,
  type ChatImageUpload,
} from './chat';
import { createChatRequest, type ChatRequestCreate } from './chat-requests';
import { createRoommateRequest } from './roommate';
import { type AsyncState, useApi } from './use-async';

/** 채팅방 목록. (ChatRoomItem 그대로 — 명세 형태) */
export function useChatRooms(): AsyncState<ChatRoomItem[]> {
  const state = useApi(['chat', 'rooms'], () => getChatRooms());
  return { ...state, data: state.data?.chatRooms ?? null };
}

export function useChatRoomDetail(chatRoomId: string): AsyncState<ChatRoom> {
  const state = useApi(['chat', 'rooms', chatRoomId], () => getChatRoomDetail(chatRoomId), {
    enabled: chatRoomId.length > 0,
  });
  const room = useMemo<ChatRoom | null>(() => {
    if (!state.data) return null;
    return chatRoomDetailToDomainRoom(chatRoomId, state.data);
  }, [chatRoomId, state.data]);

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
  const mutation = useMutation({
    mutationFn: (chatRoomId: string | number) =>
      createRoommateRequest({ chatRoomId: Number(chatRoomId) }),
  });

  return {
    requestRoommate: async (chatRoomId: string | number) => {
      const res = await mutation.mutateAsync(chatRoomId);
      if (res.status !== 200 || res.error) {
        throw new Error(res.error?.message ?? '룸메이트 요청에 실패했습니다.');
      }
      return res.data;
    },
    requesting: mutation.isPending,
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

  return {
    requestChat: async (body: ChatRequestCreate) => {
      const res = await createMutation.mutateAsync(body);
      if (res.status !== 200 || res.error) {
        throw new Error(res.error?.message ?? '채팅 요청에 실패했습니다.');
      }
      return res.data;
    },
    requestingChat: createMutation.isPending,
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

function chatRoomDetailToDomainRoom(chatRoomId: string, detail: ChatRoomDetailData): ChatRoom {
  const peer = userFromChatRoomDetail(detail);
  const messages = detailMessages(detail, peer.id);
  const matched = detail.matchingRequiredList?.some((request) => request.status === 'ACCEPTED') === true;
  return {
    id: chatRoomId,
    peer,
    messages,
    matched,
    acceptedRequest: matched,
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
    avatarUrl: profile?.profileImageUrl,
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
  const createdAt = parseDate(item.creatAt);
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
      return {
        id: String(message.id ?? `${message.senderId ?? 'system'}-${message.createdAt ?? Date.now()}`),
        authorId: isSystem ? 'system' : String(message.senderId ?? peerId),
        body: isSystem
          ? '채팅방을 나갔어요.'
          : message.contents || message.imageUrl || '이미지 메시지',
        sentAt: parseDate(message.createdAt),
        kind: isSystem ? 'system' : 'text',
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
  if (!value) return new Date();
  const d = new Date(value);
  return Number.isNaN(d.getTime()) ? new Date() : d;
}
