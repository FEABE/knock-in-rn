import {
  ChatRoomView,
  type ChatRoomViewProps,
} from './chat-room.view';
import {
  useChatRoom,
  type UseChatRoomProps,
} from './use-chat-room';

export type ChatRoomProps = UseChatRoomProps &
  Omit<ChatRoomViewProps, keyof ReturnType<typeof useChatRoom>>;

export function ChatRoom({
  initialMessages,
  currentUserId,
  initialMatched,
  ...rest
}: ChatRoomProps) {
  const asks = useChatRoom({
    initialMessages,
    currentUserId,
    initialMatched,
  });
  return <ChatRoomView {...asks} {...rest} />;
}
