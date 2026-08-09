import { useRouter } from 'expo-router';
import { useCallback, useEffect, useRef, useState } from 'react';
import { Alert } from 'react-native';

import { useSafeBottomPadding } from '@/hooks/use-safe-bottom-padding';
import { useMyRoommateBoardsInfinite, useRoommateBoardWriteActions } from '@/lib/api';
import { useRequireLogin } from '@/lib/auth';
import type { RoomPost } from '@/lib/domain';
import { goNewRoom, goRoomDetail, goRoomEdit } from '@/lib/navigation/routes';

const TOAST_DURATION_MS = 1800;

export type UseMyRoomsScreenReturn = {
  loggedIn: boolean;
  rooms: RoomPost[];
  loading: boolean;
  refreshing: boolean;
  error: string | null;
  loadingMore: boolean;
  onEndReached: () => void;
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
  const { session, requireLogin } = useRequireLogin();
  const {
    data: apiRooms,
    loading,
    error,
    refresh,
    loadMore,
    loadingMore,
  } = useMyRoommateBoardsInfinite(!!session);
  const { deleteBoard, deleting } = useRoommateBoardWriteActions();
  const bottomPadding = useSafeBottomPadding(12, 24);
  const rooms = session ? (apiRooms ?? []) : [];
  const [deleteTarget, setDeleteTarget] = useState<RoomPost | null>(null);
  const [refreshing, setRefreshing] = useState(false);
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

  const onRetry = useCallback(() => {
    setRefreshing(true);
    void Promise.resolve(refresh()).finally(() => setRefreshing(false));
  }, [refresh]);

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
    loadingMore,
    onEndReached: loadMore,
    deleting,
    bottomPadding,
    deleteDialogOpen: deleteTarget !== null,
    toastMessage,
    onBack: () => router.back(),
    onLoginPress: () => requireLogin(() => undefined),
    onRetry,
    onCreatePress: () => goNewRoom(router),
    onRoomPress: (post) => goRoomDetail(router, post.id),
    onEditPress: (post) => goRoomEdit(router, post.id),
    onDeletePress: (post) => setDeleteTarget(post),
    onCancelDelete: () => setDeleteTarget(null),
    onConfirmDelete,
  };
}
