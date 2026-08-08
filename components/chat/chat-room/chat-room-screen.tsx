import { SafeAreaView } from 'react-native-safe-area-context';
import { ActivityIndicator, Text, View } from 'react-native';

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

  // 방 데이터가 아예 없을 때만 전체 화면을 대체한다. 이미 로드된 방에서 재조회가 한 번
  // 실패했다고 대화 내용·입력창까지 사라지면 사용자에게는 "채팅방이 나가진" 것으로 보인다.
  if (!asks.room) {
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
        <ChatRoomBlockedView peer={room.peer} messages={asks.messages} onBack={asks.onBack} />
      ) : (
        <ChatRoomScreenView {...asks} room={room} />
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
