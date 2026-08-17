import { useLocalSearchParams, useRouter } from 'expo-router';
import { Alert, Share } from 'react-native';
import { useEffect, useMemo, useState } from 'react';

import { setModerationSuccessToast } from '@/components/moderation/moderation-success-toast';
import { AnalyticsEvent, logEvent } from '@/lib/analytics';
import { useSafeBottomPadding } from '@/hooks/use-safe-bottom-padding';
import {
  apiErrorCode,
  DEFAULT_CHAT_MESSAGE,
  getAccessTokenMemberId,
  getRoommateBoardDetail,
  useApi,
  useAccountActions,
  useCreateChatRoom,
  useRoommateBoardDetail,
  useRoommateBoardLikeActions,
  useRoommateBoardWriteActions,
} from '@/lib/api';
import { useRequireLogin } from '@/lib/auth';
import { useModeration, useMyProfileAuthor, useSession, type RoomPost } from '@/lib/domain';
import {
  goChatRoom,
  goModerationReturnTarget,
  goRoomEdit,
  goRoommateDetail,
  moderationReturnParams,
  resolveModerationReturnTarget,
} from '@/lib/navigation/routes';

export type LifestyleTile = { label: string; value: string };

export type UseRoomDetailScreenReturn = {
  post: RoomPost | null;
  photos: string[];
  lifestyleItems: LifestyleTile[];
  loading: boolean;
  error: string | null;
  isLoggedIn: boolean;
  isOwner: boolean;
  blocked: boolean;
  liked: boolean;
  menuOpen: boolean;
  photoIndex: number;
  descExpanded: boolean;
  lifestyleExpanded: boolean;
  creatingChat: boolean;
  bottomPadding: number;
  deleting: boolean;
  deleteDialogOpen: boolean;
  chatLimitOpen: boolean;
  closeChatLimit: () => void;
  setMenuOpen: (next: boolean) => void;
  setPhotoIndex: (next: number) => void;
  toggleDescription: () => void;
  toggleLifestyle: () => void;
  onBack: () => void;
  onEdit: () => void;
  onDelete: () => void;
  onCancelDelete: () => void;
  onConfirmDelete: () => void;
  onAuthorPress: () => void;
  onShare: () => void;
  onLike: () => void;
  onChat: () => void;
  onReport: () => void;
  onBlockAuthor: () => void;
};

export function useRoomDetailScreen(): UseRoomDetailScreenReturn {
  const router = useRouter();
  const { id, from, tab, returnTo } = useLocalSearchParams<{
    id: string;
    from?: string;
    tab?: string;
    returnTo?: string;
  }>();
  const boardId = typeof id === 'string' ? id : '';
  const returnTarget = resolveModerationReturnTarget(from, returnTo, tab, 'rooms');
  const { session } = useSession();
  const { requireLogin } = useRequireLogin();
  const { data: fetchedPost, loading, error } = useRoommateBoardDetail(boardId);
  const currentMemberId = getAccessTokenMemberId() ?? session?.user.id;
  const { applyToPost: applyMyProfile } = useMyProfileAuthor();
  const post = useMemo(
    () => (fetchedPost ? applyMyProfile(fetchedPost) : null),
    [applyMyProfile, fetchedPost],
  );
  // 생활 패턴 8종 타일은 서버 라벨/값을 그대로 쓰기 위해 명세 원본 응답을 함께 구독한다.
  // useRoommateBoardDetail 과 같은 쿼리 키라 추가 네트워크 요청은 발생하지 않는다.
  const { data: rawDetail } = useApi(
    ['roommate', 'boards', 'detail', boardId],
    () => getRoommateBoardDetail(boardId),
    { enabled: boardId.length > 0, retry: false },
  );
  const lifestyleItems = useMemo<LifestyleTile[]>(
    () =>
      (rawDetail?.lifeStyles ?? [])
        .filter((item) => Boolean(item.name?.trim()))
        .map((item) => ({
          label: item.name?.trim() ?? '',
          value: item.description?.trim() || item.value?.trim() || '미입력',
        })),
    [rawDetail],
  );
  const { createRoom, creatingRoom } = useCreateChatRoom();
  const setBoardLiked = useRoommateBoardLikeActions();
  const { deleteBoard, deleting } = useRoommateBoardWriteActions();
  const { requestBlock } = useAccountActions();
  const { blockUser, isPostBlocked, blockPost } = useModeration();
  const bottomPadding = useSafeBottomPadding(12, 12);

  const [menuOpen, setMenuOpen] = useState(false);
  const [photoIndex, setPhotoIndex] = useState(0);
  const [descExpanded, setDescExpanded] = useState(false);
  const [lifestyleExpanded, setLifestyleExpanded] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [chatLimitOpen, setChatLimitOpen] = useState(false);

  const photos = post?.photoUrls?.length
    ? post.photoUrls
    : post?.thumbnailUrl
      ? [post.thumbnailUrl]
      : [];
  const isOwner =
    !!post &&
    ((currentMemberId != null && String(currentMemberId) === String(post.author.id)) ||
      session?.user.name === post.author.name);
  const blocked = post ? isPostBlocked(post.id) : false;

  useEffect(() => {
    if (post?.id) logEvent(AnalyticsEvent.ROOM_DETAIL_VIEW, { room_id: post.id });
  }, [post?.id]);

  return {
    post,
    photos,
    lifestyleItems,
    loading,
    error,
    isLoggedIn: !!session,
    isOwner,
    blocked,
    liked: !!post?.liked,
    menuOpen,
    photoIndex,
    descExpanded,
    lifestyleExpanded,
    creatingChat: creatingRoom,
    bottomPadding,
    deleting,
    deleteDialogOpen,
    chatLimitOpen,
    closeChatLimit: () => setChatLimitOpen(false),
    setMenuOpen,
    setPhotoIndex,
    toggleDescription: () => setDescExpanded((prev) => !prev),
    toggleLifestyle: () => setLifestyleExpanded((prev) => !prev),
    onBack: () => router.back(),
    onEdit: () => {
      if (!post) return;
      setMenuOpen(false);
      goRoomEdit(router, post.id);
    },
    onDelete: () => {
      if (!post) return;
      setMenuOpen(false);
      setDeleteDialogOpen(true);
    },
    onCancelDelete: () => setDeleteDialogOpen(false),
    onConfirmDelete: async () => {
      if (!post || deleting) return;
      try {
        await deleteBoard(post.id);
      } catch (deleteError) {
        setDeleteDialogOpen(false);
        Alert.alert(
          '삭제 실패',
          deleteError instanceof Error ? deleteError.message : '잠시 후 다시 시도해주세요.',
        );
        return;
      }
      setDeleteDialogOpen(false);
      goModerationReturnTarget(router, { screen: 'explore', href: '/explore', tab: 'rooms' });
    },
    onAuthorPress: () => {
      if (!post) return;
      goRoommateDetail(router, post.author.id, returnTarget);
    },
    onShare: () => {
      if (!post) return;
      void Share.share({
        title: post.title,
        message: `${post.title}\nknockinrn://room/${post.id}`,
      }).catch(() => Alert.alert('공유 실패', '공유 화면을 열지 못했어요.'));
    },
    onLike: () =>
      requireLogin(() => {
        if (!post) return;
        const next = !post.liked;
        logEvent(next ? AnalyticsEvent.ROOM_INTEREST_ADD : AnalyticsEvent.ROOM_INTEREST_REMOVE, {
          room_id: post.id,
        });
        setBoardLiked(post.id, next);
      }),
    onChat: () =>
      requireLogin(() => {
        if (!post) return;
        const requesteeId = Number(post.author.id);
        const requestBoardId = Number(post.id);
        if (!Number.isFinite(requesteeId)) {
          Alert.alert('채팅 실패', '상대 사용자 정보를 확인하지 못했습니다.');
          return;
        }
        void createRoom({
          requesteeId,
          boardId: Number.isFinite(requestBoardId) ? requestBoardId : undefined,
          chatMessage: { contents: DEFAULT_CHAT_MESSAGE },
        })
          .then((chatRoomId) => {
            logEvent(AnalyticsEvent.CHAT_ROOM_ENTER, { room_id: chatRoomId });
            goChatRoom(router, chatRoomId);
          })
          .catch((chatError) => {
            // 채팅방 5개 제한은 시스템 Alert가 아니라 시안의 안내 모달로 띄운다.
            if (apiErrorCode(chatError) === 'ROOM_LIMIT_EXCEEDED') {
              setChatLimitOpen(true);
              return;
            }
            Alert.alert(
              '채팅 실패',
              chatError instanceof Error ? chatError.message : '잠시 후 다시 시도해주세요.',
            );
          });
      }),
    onReport: () => {
      if (!post) return;
      requireLogin(() => {
        setMenuOpen(false);
        router.push({
          pathname: '/moderation/report',
          params: {
            target: 'board',
            id: post.id,
            ...moderationReturnParams(returnTarget),
          },
        } as never);
      });
    },
    onBlockAuthor: () => {
      if (!post) return;
      Alert.alert('차단', `${post.author.name}님을 차단할까요? 상호 비노출 처리돼요.`, [
        { text: '취소', style: 'cancel' },
        {
          text: '차단',
          style: 'destructive',
          onPress: async () => {
            const authorId = Number(post.author.id);
            if (!Number.isFinite(authorId)) {
              Alert.alert('차단 실패', '작성자 정보를 확인하지 못했습니다.');
              return;
            }
            try {
              await requestBlock(authorId);
              blockUser(post.author.id);
              blockPost(post.id);
              setModerationSuccessToast(returnTarget, '차단되었어요');
              goModerationReturnTarget(router, returnTarget);
            } catch (blockError) {
              Alert.alert(
                '차단 실패',
                blockError instanceof Error ? blockError.message : '잠시 후 다시 시도해주세요.',
              );
            }
          },
        },
      ]);
    },
  };
}
