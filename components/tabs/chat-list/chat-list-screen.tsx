import { ChatListScreenView } from './chat-list-screen.view';
import { useChatListScreen } from './use-chat-list-screen';

export function ChatListScreen() {
  const asks = useChatListScreen();
  return <ChatListScreenView {...asks} />;
}
