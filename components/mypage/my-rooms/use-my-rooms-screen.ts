import { useRouter } from 'expo-router';
import { Alert } from 'react-native';

import { useMyRoommateBoards, useRoommateBoardWriteActions } from '@/lib/api';
import { useSession, type RoomPost } from '@/lib/domain';
import { goNewRoom, goRoomDetail, goRoomEdit } from '@/lib/navigation/routes';

export type UseMyRoomsScreenReturn = {
  loggedIn: boolean;
  rooms: RoomPost[];
  onBack: () => void;
  onCreatePress: () => void;
  onRoomPress: (post: RoomPost) => void;
  onEditPress: (post: RoomPost) => void;
  onDeletePress: (post: RoomPost) => void;
};

export function useMyRoomsScreen(): UseMyRoomsScreenReturn {
  const router = useRouter();
  const { session } = useSession();
  const { data: apiRooms } = useMyRoommateBoards(!!session);
  const { deleteBoard } = useRoommateBoardWriteActions();
  const rooms = session ? (apiRooms ?? []) : [];

  return {
    loggedIn: !!session,
    rooms,
    onBack: () => router.back(),
    onCreatePress: () => goNewRoom(router),
    onRoomPress: (post) => goRoomDetail(router, post.id),
    onEditPress: (post) => goRoomEdit(router, post.id),
    onDeletePress: (post) =>
      Alert.alert('삭제', '게시글을 삭제할까요?', [
        { text: '취소', style: 'cancel' },
        {
          text: '삭제',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteBoard(post.id);
            } catch (error) {
              Alert.alert(
                '삭제 실패',
                error instanceof Error ? error.message : '잠시 후 다시 시도해주세요.',
              );
            }
          },
        },
      ]),
  };
}
