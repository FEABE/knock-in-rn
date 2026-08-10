import type { ChatMessage, ChatRoom, UserSummary } from '@/lib/domain';

import type { ChatRoomDetailData, ChatSocketEnvelope, ChatSocketMessage } from '../chat';
import { parseServerDate } from '../date-time';

export function toChatRoomModel(
  chatRoomId: string,
  detail: ChatRoomDetailData,
  currentMemberId?: string,
): ChatRoom {
  const peer = toChatPeerModel(detail);
  const matched =
    detail.matchingRequiredList?.some((request) => request.status === 'ACCEPTED') === true;
  const latestRequest = [...(detail.matchingRequiredList ?? [])]
    .filter((request) => request.requiredId != null && request.status != null)
    .sort(
      (a, b) =>
        (b.createdAt ?? '').localeCompare(a.createdAt ?? '') ||
        (b.requiredId ?? 0) - (a.requiredId ?? 0),
    )[0];
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
    messages: toChatHistoryMessages(detail, peer.id),
    matched,
    acceptedRequest: matched,
    opponentHasRoommate: detail.opponentHasRoommate === true,
    roommateRequest:
      latestRequest?.requiredId != null && latestRequest.status
        ? {
            id: String(latestRequest.requiredId),
            status: latestRequest.status,
            role: role ?? 'unknown',
            createdAt: parseServerDate(latestRequest.createdAt) ?? undefined,
            updatedAt: parseServerDate(latestRequest.updatedAt) ?? undefined,
          }
        : undefined,
  };
}

export function toChatSocketMessage(event: ChatSocketEnvelope): ChatMessage | null {
  const payload = event.payload as ChatSocketMessage;
  const body = payload.contents ?? '';
  const sentAt = parseDate(event.createdAt);
  const id =
    payload.clientMessageId ??
    `${event.chatRoomId}-${payload.senderId ?? 'system'}-${sentAt.getTime()}-${payload.type ?? 'TEXT'}`;

  if (payload.type === 'LEFT_ROOM' || event.eventType === 'SYSTEM_MESSAGE') {
    const leftRoom = payload.type === 'LEFT_ROOM' || body.includes('나갔');
    return {
      id,
      authorId: 'system',
      body,
      sentAt,
      kind: 'system',
      leftRoom: leftRoom || undefined,
    };
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

function toChatPeerModel(detail: ChatRoomDetailData): UserSummary {
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

function toChatHistoryMessages(detail: ChatRoomDetailData, peerId: string): ChatMessage[] {
  const messages =
    detail.messages?.map((message) => {
      const isSystem = message.type === 'LEFT_ROOM';
      const isImage = message.type === 'IMAGE';
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
        leftRoom: isSystem || undefined,
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
