import { useCallback, useMemo, useState } from 'react';

import type { ChatMessage } from '@/lib/domain';

export type UseChatRoomProps = {
  initialMessages?: ChatMessage[];
  currentUserId: string;
  initialMatched?: boolean;
};

export type ChatRoomBubble = ChatMessage & {
  mine: boolean;
};

export type UseChatRoomReturn = {
  messages: ChatRoomBubble[];
  draft: string;
  setDraft: (next: string) => void;
  canSend: boolean;
  send: () => void;
  matched: boolean;
  requestMatch: () => void;
  reset: () => void;
};

export function useChatRoom({
  initialMessages = [],
  currentUserId,
  initialMatched = false,
}: UseChatRoomProps): UseChatRoomReturn {
  const [messages, setMessages] = useState<ChatMessage[]>(initialMessages);
  const [draft, setDraft] = useState('');
  const [matched, setMatched] = useState(initialMatched);

  const send = useCallback(() => {
    const trimmed = draft.trim();
    if (!trimmed) return;
    setMessages((prev) => [
      ...prev,
      {
        id: `m-${Date.now()}`,
        authorId: currentUserId,
        body: trimmed,
        sentAt: new Date(),
        kind: 'text',
      },
    ]);
    setDraft('');
  }, [currentUserId, draft]);

  const requestMatch = useCallback(() => {
    setMatched(true);
    setMessages((prev) => [
      ...prev,
      {
        id: `m-${Date.now()}`,
        authorId: 'system',
        body: '🎉 매칭이 성사되었어요. 공동생활 합의서를 작성해보세요.',
        sentAt: new Date(),
        kind: 'system',
      },
    ]);
  }, []);

  const reset = useCallback(() => {
    setMessages(initialMessages);
    setDraft('');
    setMatched(initialMatched);
  }, [initialMatched, initialMessages]);

  const bubbles = useMemo<ChatRoomBubble[]>(
    () =>
      messages.map((m) => ({
        ...m,
        mine: m.authorId === currentUserId,
      })),
    [messages, currentUserId],
  );

  return {
    messages: bubbles,
    draft,
    setDraft,
    canSend: draft.trim().length > 0,
    send,
    matched,
    requestMatch,
    reset,
  };
}
