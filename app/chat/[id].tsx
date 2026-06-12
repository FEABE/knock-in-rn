import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useMemo, useRef } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ChatRoom } from '@/components/ui/headless';
import {
  MOCK_CHAT_ROOMS,
  MOCK_SESSION_USER,
  MOCK_USERS,
  useModeration,
  type UserSummary,
} from '@/lib/domain';

export default function ChatRoomScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const scrollRef = useRef<ScrollView | null>(null);
  const { isUserBlocked } = useModeration();

  const room = useMemo(() => {
    const existing = MOCK_CHAT_ROOMS.find((r) => r.id === id);
    if (existing) return existing;
    const peer = MOCK_USERS.find((u) => u.id === id) ?? MOCK_USERS[1];
    return {
      id: peer.id,
      peer,
      matched: false,
      acceptedRequest: false,
      messages: [
        {
          id: 'sys',
          authorId: 'system',
          body: '채팅이 시작되었어요 🎉',
          sentAt: new Date(),
          kind: 'system' as const,
        },
      ],
    };
  }, [id]);

  if (isUserBlocked(room.peer.id)) {
    return (
      <SafeAreaView className="flex-1 bg-white" edges={['top']}>
        <ChatHeader peer={room.peer} matched={false} onBack={() => router.back()} />
        <View className="flex-1 items-center justify-center gap-3 p-10">
          <Text className="text-base text-neutral-500">차단한 사용자에요</Text>
          <Text className="text-xs text-neutral-400">
            메시지 전송이 제한돼요. 마이페이지에서 차단 해제할 수 있어요.
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-white" edges={['top']}>
      <ChatRoom
        currentUserId={MOCK_SESSION_USER.id}
        initialMessages={room.messages}
        initialMatched={room.matched}
        className="flex-1"
      >
        {({ messages, draft, setDraft, canSend, send, matched, requestMatch }) => (
          <ChatBody
            peer={room.peer}
            scrollRef={scrollRef}
            messages={messages}
            draft={draft}
            setDraft={setDraft}
            canSend={canSend}
            send={send}
            matched={matched}
            requestMatch={requestMatch}
            onBack={() => router.back()}
          />
        )}
      </ChatRoom>
    </SafeAreaView>
  );
}

function ChatHeader({
  peer,
  matched,
  onBack,
}: {
  peer: UserSummary;
  matched: boolean;
  onBack: () => void;
}) {
  return (
    <View className="flex-row items-center gap-2 border-b border-neutral-100 px-3 py-2">
      <Pressable onPress={onBack} className="h-9 w-9 items-center justify-center">
        <Text className="text-2xl text-neutral-700">‹</Text>
      </Pressable>
      <View className="h-8 w-8 items-center justify-center rounded-full bg-[#256EF4]/15">
        <Text className="text-xs font-semibold text-[#256EF4]">{peer.name.charAt(0)}</Text>
      </View>
      <View className="flex-1 flex-row items-center gap-2">
        <Text className="text-base font-semibold text-neutral-900">{peer.name}</Text>
        <Text className="text-xs text-neutral-400">
          {peer.age}세 · {peer.gender === 'female' ? '여성' : '남성'}
        </Text>
        {matched ? (
          <View className="rounded bg-emerald-50 px-1.5 py-0.5">
            <Text className="text-[10px] text-emerald-700">✓ 룸메이트 확정</Text>
          </View>
        ) : (
          <View className="rounded bg-[#256EF4]/10 px-1.5 py-0.5">
            <Text className="text-[10px] text-[#256EF4]">궁합 91점</Text>
          </View>
        )}
      </View>
      <Pressable className="h-9 w-9 items-center justify-center">
        <Text className="text-xl text-neutral-400">⋯</Text>
      </Pressable>
    </View>
  );
}

type ChatMsg = {
  id: string;
  body: string;
  mine: boolean;
  kind?: 'text' | 'system';
  sentAt: Date;
};

function ChatBody({
  peer,
  scrollRef,
  messages,
  draft,
  setDraft,
  canSend,
  send,
  matched,
  requestMatch,
  onBack,
}: {
  peer: UserSummary;
  scrollRef: React.MutableRefObject<ScrollView | null>;
  messages: ChatMsg[];
  draft: string;
  setDraft: (next: string) => void;
  canSend: boolean;
  send: () => void;
  matched: boolean;
  requestMatch: () => void;
  onBack: () => void;
}) {
  useEffect(() => {
    setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 50);
  }, [messages.length, scrollRef]);

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      className="flex-1"
    >
      <ChatHeader peer={peer} matched={matched} onBack={onBack} />

      {/* 룸메이트 확정 배너 */}
      {matched ? (
        <View className="border-b border-emerald-100 bg-emerald-50 px-4 py-3">
          <Text className="text-sm font-medium text-emerald-700">✓ 룸메이트가 확정되었어요 🎉</Text>
          <Text className="mt-0.5 text-xs text-emerald-600">함께하는 새로운 시작을 응원해요.</Text>
        </View>
      ) : (
        <View className="flex-row items-center gap-3 border-b border-[#256EF4]/15 bg-[#256EF4]/10 px-4 py-3">
          <View className="flex-1">
            <Text className="text-sm font-medium text-[#256EF4]">룸메이트로 확정할까요?</Text>
            <Text className="text-xs text-[#256EF4]">대화가 잘 됐다면 매칭을 완료해보세요</Text>
          </View>
          <Pressable
            onPress={requestMatch}
            className="rounded-full bg-[#256EF4] px-4 py-2 active:opacity-90"
          >
            <Text className="text-xs font-semibold text-white">룸메이트 확정하기</Text>
          </Pressable>
        </View>
      )}

      <ScrollView
        ref={scrollRef}
        className="flex-1 bg-neutral-50"
        contentContainerClassName="gap-2 px-4 py-4"
      >
        {messages.map((m) => {
          if (m.kind === 'system') {
            return (
              <View key={m.id} className="my-2 items-center">
                <Text className="rounded-full bg-neutral-200 px-3 py-1 text-[10px] text-neutral-600">
                  {m.body}
                </Text>
              </View>
            );
          }
          return (
            <View key={m.id} className={m.mine ? 'items-end' : 'items-start'}>
              <View className="max-w-[80%] flex-row items-end gap-1">
                {!m.mine ? (
                  <View className="h-7 w-7 items-center justify-center self-start rounded-full bg-[#256EF4]/15">
                    <Text className="text-[10px] font-semibold text-[#256EF4]">
                      {peer.name.charAt(0)}
                    </Text>
                  </View>
                ) : null}
                <View className="gap-0.5">
                  <View
                    className={`rounded-2xl px-3 py-2 ${
                      m.mine ? 'bg-[#256EF4]' : 'border border-neutral-200 bg-white'
                    }`}
                  >
                    <Text className={m.mine ? 'text-sm text-white' : 'text-sm text-neutral-800'}>
                      {m.body}
                    </Text>
                  </View>
                  <Text
                    className={`text-[10px] text-neutral-400 ${
                      m.mine ? 'text-right' : 'text-left'
                    }`}
                  >
                    {fmtTime(m.sentAt)}
                  </Text>
                </View>
              </View>
            </View>
          );
        })}
      </ScrollView>

      <View className="flex-row items-center gap-2 border-t border-neutral-100 bg-white px-3 py-2">
        <View className="h-9 w-9 items-center justify-center rounded-full bg-neutral-100">
          <Text className="text-lg text-neutral-500">＋</Text>
        </View>
        <TextInput
          value={draft}
          onChangeText={setDraft}
          placeholder="메시지 보내기"
          multiline
          className="max-h-24 min-h-10 flex-1 rounded-2xl bg-neutral-100 px-4 py-2 text-sm"
        />
        <Pressable
          onPress={send}
          disabled={!canSend}
          className={`h-10 w-10 items-center justify-center rounded-full ${
            canSend ? 'bg-[#256EF4]' : 'bg-neutral-200'
          }`}
        >
          <Text className={canSend ? 'text-base text-white' : 'text-base text-neutral-400'}>➤</Text>
        </Pressable>
      </View>
    </KeyboardAvoidingView>
  );
}

function fmtTime(d: Date): string {
  const h = d.getHours();
  const ampm = h < 12 ? '오전' : '오후';
  const hh = h % 12 || 12;
  return `${ampm} ${hh}:${String(d.getMinutes()).padStart(2, '0')}`;
}
