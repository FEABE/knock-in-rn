import { SafeAreaView } from 'react-native-safe-area-context';
import { ActivityIndicator, Text, View } from 'react-native';

import { ChatRoom } from '@/components/ui/headless';

import { ChatRoomBlockedView, ChatRoomScreenView } from './chat-room-screen.view';
import { useChatRoomScreen } from './use-chat-room-screen';

export function ChatRoomScreen() {
  const asks = useChatRoomScreen();

  if (asks.loading) {
    return (
      <SafeAreaView className="flex-1 bg-white" edges={['top']}>
        <StatusView message="채팅방을 불러오는 중..." />
      </SafeAreaView>
    );
  }

  if (asks.error || !asks.room) {
    return (
      <SafeAreaView className="flex-1 bg-white" edges={['top']}>
        <StatusView message="채팅방을 불러오지 못했어요" detail={asks.error ?? undefined} />
      </SafeAreaView>
    );
  }

  const room = asks.room;

  return (
    <SafeAreaView className="flex-1 bg-white" edges={['top']}>
      {asks.blocked ? (
        <ChatRoomBlockedView peer={room.peer} onBack={asks.onBack} />
      ) : (
        <ChatRoom
          currentUserId={asks.currentUserId}
          initialMessages={room.messages}
          initialMatched={room.matched}
          className="flex-1"
        >
          {(chat) => <ChatRoomScreenView {...asks} room={room} chat={chat} />}
        </ChatRoom>
      )}
    </SafeAreaView>
  );
}

function StatusView({ message, detail }: { message: string; detail?: string }) {
  return (
    <View className="flex-1 items-center justify-center gap-3 p-10">
      {!detail ? <ActivityIndicator color="#256EF4" /> : null}
      <Text className="text-sm text-neutral-500">{message}</Text>
      {detail ? <Text className="text-center text-xs text-neutral-400">{detail}</Text> : null}
    </View>
  );
}
