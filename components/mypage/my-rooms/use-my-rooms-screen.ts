import { useRouter } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import { Alert } from 'react-native';

import { useSafeBottomPadding } from '@/hooks/use-safe-bottom-padding';
import { useMyRoommateBoards, useRoommateBoardWriteActions } from '@/lib/api';
import { useSession, type RoomPost } from '@/lib/domain';
import { goKakaoLogin, goNewRoom, goRoomDetail, goRoomEdit } from '@/lib/navigation/routes';

const TOAST_DURATION_MS = 1800;

export type UseMyRoomsScreenReturn = {
  loggedIn: boolean;
  rooms: RoomPost[];
  loading: boolean;
  refreshing: boolean;
  error: string | null;
  deleting: boolean;
  bottomPadding: number;
  deleteDialogOpen: boolean;
  toastMessage: string | null;
  onBack: () => void;
  onLoginPress: () => void;
  onRetry: () => void;
  onCreatePress: () => void;
  onRoomPress: (post: RoomPost) => void;
  onEditPress: (post: RoomPost) => void;
  onDeletePress: (post: RoomPost) => void;
  onCancelDelete: () => void;
  onConfirmDelete: () => void;
};

export function useMyRoomsScreen(): UseMyRoomsScreenReturn {
  const router = useRouter();
  const { session } = useSession();
  const {
    data: apiRooms,
    loading,
    refreshing,
    error,
    reload,
  } = useMyRoommateBoards(!!session);
  const { deleteBoard, deleting } = useRoommateBoardWriteActions();
  const bottomPadding = useSafeBottomPadding(12, 24);
  const rooms = session ? (apiRooms ?? []) : [];
  const [deleteTarget, setDeleteTarget] = useState<RoomPost | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(
    () => () => {
      if (toastTimer.current) clearTimeout(toastTimer.current);
    },
    [],
  );

  const showToast = (message: string) => {
    if (toastTimer.current) clearTimeout(toastTimer.current);
    setToastMessage(message);
    toastTimer.current = setTimeout(() => setToastMessage(null), TOAST_DURATION_MS);
  };

  const onConfirmDelete = async () => {
    if (!deleteTarget || deleting) return;
    try {
      await deleteBoard(deleteTarget.id);
    } catch (deleteError) {
      setDeleteTarget(null);
      Alert.alert(
        '삭제 실패',
        deleteError instanceof Error ? deleteError.message : '잠시 후 다시 시도해주세요.',
      );
      return;
    }
    setDeleteTarget(null);
    showToast('게시글이 삭제되었어요');
  };

  return {
    loggedIn: !!session,
    rooms,
    loading,
    refreshing,
    error,
    deleting,
    bottomPadding,
    deleteDialogOpen: deleteTarget !== null,
    toastMessage,
    onBack: () => router.back(),
    onLoginPress: () => goKakaoLogin(router),
    onRetry: reload,
    onCreatePress: () => goNewRoom(router),
    onRoomPress: (post) => goRoomDetail(router, post.id),
    onEditPress: (post) => goRoomEdit(router, post.id),
    onDeletePress: (post) => setDeleteTarget(post),
    onCancelDelete: () => setDeleteTarget(null),
    onConfirmDelete,
  };
}
