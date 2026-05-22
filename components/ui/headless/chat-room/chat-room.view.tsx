import { type ReactNode } from 'react';
import { View, type ViewProps } from 'react-native';

import type { UseChatRoomReturn } from './use-chat-room';

export type ChatRoomViewProps = Omit<ViewProps, 'children'> &
  UseChatRoomReturn & {
    className?: string;
    children: (value: UseChatRoomReturn) => ReactNode;
  };

export function ChatRoomView({
  children,
  messages,
  draft,
  setDraft,
  canSend,
  send,
  matched,
  requestMatch,
  reset,
  ...rest
}: ChatRoomViewProps) {
  return (
    <View {...rest}>
      {children({
        messages,
        draft,
        setDraft,
        canSend,
        send,
        matched,
        requestMatch,
        reset,
      })}
    </View>
  );
}
