import type { ChatMessage } from '@/lib/domain';

/** 서버 메시지와 이 시간 안에서 내용이 같으면 낙관적 메시지의 중복으로 간주한다. */
const RECONCILE_DUP_WINDOW_MS = 5 * 60 * 1000;

export function reconcileWithServerMessages(
  current: ChatMessage[],
  incoming: ChatMessage[],
): ChatMessage[] {
  if (incoming.length === 0) return current;

  const latestServerAt = incoming.reduce(
    (latest, message) => Math.max(latest, message.sentAt.getTime()),
    Number.NEGATIVE_INFINITY,
  );
  const recentServerCounts = countRecentServerMessages(incoming, latestServerAt);
  const serverIds = new Set(incoming.map((message) => message.id));
  const pending = current.filter((message) => {
    if (message.sentAt.getTime() <= latestServerAt || serverIds.has(message.id)) return false;

    const key = fuzzyMessageKey(message);
    const remaining = recentServerCounts.get(key) ?? 0;
    if (remaining === 0) return true;

    recentServerCounts.set(key, remaining - 1);
    return false;
  });

  return sortMessages([...incoming, ...pending]);
}

/** 소켓 단건 병합용. 같은 id의 낙관적 메시지를 서버 응답으로 교체한다. */
export function mergeMessages(current: ChatMessage[], incoming: ChatMessage[]): ChatMessage[] {
  const byId = new Map(current.map((message) => [message.id, message]));
  incoming.forEach((message) => byId.set(message.id, { ...byId.get(message.id), ...message }));
  return sortMessages([...byId.values()]);
}

function countRecentServerMessages(messages: ChatMessage[], latestServerAt: number) {
  const counts = new Map<string, number>();
  for (const message of messages) {
    if (message.sentAt.getTime() < latestServerAt - RECONCILE_DUP_WINDOW_MS) continue;
    const key = fuzzyMessageKey(message);
    counts.set(key, (counts.get(key) ?? 0) + 1);
  }
  return counts;
}

function fuzzyMessageKey(message: ChatMessage): string {
  const content = message.kind === 'image' ? (message.imageUrl ?? '') : message.body;
  return `${message.authorId}|${message.kind}|${content}`;
}

function sortMessages(messages: ChatMessage[]): ChatMessage[] {
  return messages.sort((a, b) => a.sentAt.getTime() - b.sentAt.getTime());
}
