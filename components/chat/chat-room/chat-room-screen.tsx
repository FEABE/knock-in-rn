import { SafeAreaView } from 'react-native-safe-area-context';

import { ChatRoom } from '@/components/ui/headless';
import { MOCK_SESSION_USER } from '@/lib/domain';

import { ChatRoomBlockedView, ChatRoomScreenView } from './chat-room-screen.view';
import { useChatRoomScreen } from './use-chat-room-screen';

export function ChatRoomScreen() {
  const asks = useChatRoomScreen();

  return (
    <SafeAreaView className="flex-1 bg-white" edges={['top']}>
      {asks.blocked ? (
        <ChatRoomBlockedView peer={asks.room.peer} onBack={asks.onBack} />
      ) : (
        <ChatRoom
          currentUserId={MOCK_SESSION_USER.id}
          initialMessages={asks.room.messages}
          initialMatched={asks.room.matched}
          className="flex-1"
        >
          {(chat) => <ChatRoomScreenView {...asks} chat={chat} />}
        </ChatRoom>
      )}
    </SafeAreaView>
  );
}
