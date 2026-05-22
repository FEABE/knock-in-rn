import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useMemo, useRef } from 'react';
import {
  Alert,
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
} from '@/lib/domain';

export default function ChatRoomScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const scrollRef = useRef<ScrollView | null>(null);
  const { isUserBlocked } = useModeration();

  const room = useMemo(() => {
    const existing = MOCK_CHAT_ROOMS.find((r) => r.id === id);
    if (existing) return existing;
    const peer =
      MOCK_USERS.find((u) => u.id === id) ?? MOCK_USERS[1];
    return {
      id: peer.id,
      peer,
      matched: false,
      acceptedRequest: false,
      messages: [
        {
          id: 'sys',
          authorId: 'system',
          body: '채팅이 시작되었어요. 인사를 건네보세요.',
          sentAt: new Date(),
          kind: 'system' as const,
        },
      ],
    };
  }, [id]);

  const peerBlocked = isUserBlocked(room.peer.id);
  if (peerBlocked) {
    return (
      <SafeAreaView className="flex-1 bg-white" edges={['top']}>
        <View className="flex-row items-center gap-2 border-b border-neutral-100 px-3 py-2">
          <Pressable
            onPress={() => router.back()}
            className="h-9 w-9 items-center justify-center"
          >
            <Text className="text-2xl text-neutral-700">‹</Text>
          </Pressable>
          <Text className="text-base font-semibold text-neutral-900">
            {room.peer.name}
          </Text>
        </View>
        <View className="flex-1 items-center justify-center gap-3 p-10">
          <Text className="text-base text-neutral-500">
            차단한 사용자에요
          </Text>
          <Text className="text-xs text-neutral-400">
            메시지 전송이 제한돼요. 차단을 해제하려면 마이페이지에서 가능해요.
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
            router={router}
          />
        )}
      </ChatRoom>
    </SafeAreaView>
  );
}

type ChatBodyProps = {
  peer: { id: string; name: string };
  scrollRef: React.MutableRefObject<ScrollView | null>;
  messages: {
    id: string;
    body: string;
    mine: boolean;
    kind?: 'text' | 'system';
    sentAt: Date;
  }[];
  draft: string;
  setDraft: (next: string) => void;
  canSend: boolean;
  send: () => void;
  matched: boolean;
  requestMatch: () => void;
  router: ReturnType<typeof useRouter>;
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
  router,
}: ChatBodyProps) {
  useEffect(() => {
    setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 50);
  }, [messages.length, scrollRef]);

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      className="flex-1"
    >
      <View className="flex-row items-center gap-2 border-b border-neutral-100 px-3 py-2">
        <Pressable
          onPress={() => router.back()}
          className="h-9 w-9 items-center justify-center"
        >
          <Text className="text-2xl text-neutral-700">‹</Text>
        </Pressable>
        <View className="flex-1">
          <Text className="text-base font-semibold text-neutral-900">
            {peer.name}
          </Text>
          {matched ? (
            <Text className="text-[10px] text-emerald-600">매칭 성사됨</Text>
          ) : null}
        </View>
        {!matched ? (
          <Pressable
            onPress={() =>
              Alert.alert(
                '매칭 성사',
                '이 사용자와 룸메이트 매칭을 성사할까요?',
                [
                  { text: '취소', style: 'cancel' },
                  { text: '매칭하기', onPress: requestMatch },
                ],
              )
            }
            className="rounded-full bg-blue-600 px-4 py-2"
          >
            <Text className="text-xs font-medium text-white">매칭하기</Text>
          </Pressable>
        ) : null}
      </View>

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
            <View
              key={m.id}
              className={m.mine ? 'items-end' : 'items-start'}
            >
              <View
                className={`max-w-[80%] rounded-2xl px-3 py-2 ${
                  m.mine ? 'bg-blue-600' : 'bg-white border border-neutral-200'
                }`}
              >
                <Text
                  className={
                    m.mine
                      ? 'text-sm text-white'
                      : 'text-sm text-neutral-800'
                  }
                >
                  {m.body}
                </Text>
              </View>
              <Text className="mt-0.5 text-[10px] text-neutral-400">
                {fmtTime(m.sentAt)}
              </Text>
            </View>
          );
        })}
      </ScrollView>

      <View className="flex-row items-center gap-2 border-t border-neutral-100 bg-white px-3 py-2">
        <TextInput
          value={draft}
          onChangeText={setDraft}
          placeholder="메시지를 입력하세요"
          multiline
          className="max-h-24 min-h-10 flex-1 rounded-2xl bg-neutral-100 px-4 py-2 text-sm"
        />
        <Pressable
          onPress={send}
          disabled={!canSend}
          className={`h-10 items-center justify-center rounded-full px-4 ${
            canSend ? 'bg-blue-600' : 'bg-neutral-200'
          }`}
        >
          <Text
            className={
              canSend
                ? 'text-sm font-semibold text-white'
                : 'text-sm font-semibold text-neutral-400'
            }
          >
            전송
          </Text>
        </Pressable>
      </View>
    </KeyboardAvoidingView>
  );
}

function fmtTime(d: Date): string {
  return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
}
