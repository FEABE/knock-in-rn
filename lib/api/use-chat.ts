/**
 * 채팅 화면용 데이터 훅.
 */
import { useMemo } from 'react';
import { useMutation } from '@tanstack/react-query';

import type { ChatMessage, ChatRoom, UserSummary } from '@/lib/domain';

import { type ChatRoomItem, getChatRooms } from './chat';
import { createRoommateRequest } from './roommate';
import { type AsyncState, useApi } from './use-async';

/** 채팅방 목록. (ChatRoomItem 그대로 — 명세 형태) */
export function useChatRooms(): AsyncState<ChatRoomItem[]> {
  const state = useApi(['chat', 'rooms'], () => getChatRooms());
  return { ...state, data: state.data?.chatRooms ?? null };
}

export function useChatRoomDetail(chatRoomId: string): AsyncState<ChatRoom> {
  const state = useChatRooms();
  const room = useMemo<ChatRoom | null>(() => {
    const source = state.data?.find((item) => String(item.chatRoomId ?? '') === chatRoomId);
    if (!source) return null;
    return chatRoomItemToDomainRoom(source);
  }, [chatRoomId, state.data]);

  return {
    ...state,
    data: room,
    loading: state.loading,
    error: state.error ?? (!state.loading && !room ? '채팅방을 찾을 수 없습니다.' : null),
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

function parseDate(value?: string): Date {
  if (!value) return new Date();
  const d = new Date(value);
  return Number.isNaN(d.getTime()) ? new Date() : d;
}
