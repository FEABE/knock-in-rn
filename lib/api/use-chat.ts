/**
 * 채팅 화면용 데이터 훅.
 */
import { type ChatRoomItem, getChatRooms } from './chat';
import { type AsyncState, useApi } from './use-async';

/** 채팅방 목록. (ChatRoomItem 그대로 — 명세 형태) */
export function useChatRooms(): AsyncState<ChatRoomItem[]> {
  const state = useApi(['chat', 'rooms'], () => getChatRooms());
  return { ...state, data: state.data?.chatRooms ?? null };
}
