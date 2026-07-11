import { ChatRequestScreenView } from './chat-request-screen.view';
import { useChatRequestScreen } from './use-chat-request-screen';

export function ChatRequestScreen() {
  const asks = useChatRequestScreen();
  return <ChatRequestScreenView {...asks} />;
}
