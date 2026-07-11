import { useLocalSearchParams, useRouter } from 'expo-router';
import { Alert, Share } from 'react-native';
import { useEffect, useState } from 'react';

import { AnalyticsEvent, logEvent } from '@/lib/analytics';
import { useSafeBottomPadding } from '@/hooks/use-safe-bottom-padding';
import {
  blockUser as blockUserRequest,
  getAccessTokenMemberId,
  useChatRequestActions,
  useRoommateBoardDetail,
  useRoommateBoardLikeActions,
  useRoommateBoardWriteActions,
} from '@/lib/api';
import { useRequireLogin } from '@/lib/auth';
import { useModeration, useSession, type RoomPost } from '@/lib/domain';
import { goRoomEdit, goRoommateDetail } from '@/lib/navigation/routes';

export const ROOM_REPORT_REASONS = [
  '허위 매물',
  '욕설/혐오 표현',
  '불법/사기 의심',
  '동일/반복 게시',
  '기타',
];

export type UseRoomDetailScreenReturn = {
  post: RoomPost | null;
  photos: string[];
  loading: boolean;
  error: string | null;
  isLoggedIn: boolean;
  isOwner: boolean;
  blocked: boolean;
  liked: boolean;
  reportOpen: boolean;
  menuOpen: boolean;
  photoIndex: number;
  descExpanded: boolean;
  lifestyleExpanded: boolean;
  bottomPadding: number;
  setReportOpen: (next: boolean) => void;
  setMenuOpen: (next: boolean) => void;
  setPhotoIndex: (next: number) => void;
  toggleDescription: () => void;
  toggleLifestyle: () => void;
  onBack: () => void;
  onEdit: () => void;
  onDelete: () => void;
  onAuthorPress: () => void;
  onShare: () => void;
  onLike: () => void;
  onRequestChat: () => void;
  onReportReason: (reason: string) => void;
  onBlockAuthor: () => void;
};

export function useRoomDetailScreen(): UseRoomDetailScreenReturn {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const boardId = typeof id === 'string' ? id : '';
  const { session } = useSession();
  const { requireLogin } = useRequireLogin();
  const { data: post, loading, error } = useRoommateBoardDetail(boardId);
  const { requestChat } = useChatRequestActions();
  const setBoardLiked = useRoommateBoardLikeActions();
  const { deleteBoard, reportBoard } = useRoommateBoardWriteActions();
  const { report, blockUser, isPostBlocked, blockPost } = useModeration();
  const bottomPadding = useSafeBottomPadding(12, 12);

  const [reportOpen, setReportOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [photoIndex, setPhotoIndex] = useState(0);
  const [descExpanded, setDescExpanded] = useState(false);
  const [lifestyleExpanded, setLifestyleExpanded] = useState(false);

  const photos = post?.photoUrls?.length
    ? post.photoUrls
    : post?.thumbnailUrl
      ? [post.thumbnailUrl]
      : [];
  const currentMemberId = getAccessTokenMemberId() ?? session?.user.id;
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
    loading,
    error,
    isLoggedIn: !!session,
    isOwner,
    blocked,
    liked: !!post?.liked,
    reportOpen,
    menuOpen,
    photoIndex,
    descExpanded,
    lifestyleExpanded,
    bottomPadding,
    setReportOpen,
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
      Alert.alert('삭제', '게시글을 삭제할까요?', [
        { text: '취소', style: 'cancel' },
        {
          text: '삭제',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteBoard(post.id);
            } catch (deleteError) {
              Alert.alert(
                '삭제 실패',
                deleteError instanceof Error ? deleteError.message : '잠시 후 다시 시도해주세요.',
              );
              return;
            }
            router.back();
          },
        },
      ]);
    },
    onAuthorPress: () => {
      if (!post) return;
      goRoommateDetail(router, post.author.id);
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
    onRequestChat: () =>
      requireLogin(() => {
        if (!post) return;
        Alert.alert('매칭 요청', `${post.author.name}님께 1:1 대화 요청을 보낼까요?`, [
          { text: '취소', style: 'cancel' },
          {
            text: '요청 보내기',
            onPress: async () => {
              const requesteeId = Number(post.author.id);
              const requestBoardId = Number(post.id);
              if (!Number.isFinite(requesteeId)) {
                Alert.alert('요청 실패', '상대 사용자 정보를 확인하지 못했습니다.');
                return;
              }
              try {
                await requestChat({
                  requesteeId,
                  boardId: Number.isFinite(requestBoardId) ? requestBoardId : undefined,
                });
                Alert.alert('요청 완료', '상대방에게 채팅 요청을 보냈어요.');
              } catch (requestError) {
                Alert.alert(
                  '요청 실패',
                  requestError instanceof Error
                    ? requestError.message
                    : '잠시 후 다시 시도해주세요.',
                );
              }
            },
          },
        ]);
      }),
    onReportReason: (reason) => {
      if (!post) return;
      requireLogin(() => {
        void reportBoard(post.id, reason)
          .then(() => {
            report({ kind: 'post', id: post.id }, reason);
            setReportOpen(false);
            Alert.alert('신고 접수 완료', '검토 후 조치할게요.');
          })
          .catch((reportError) => {
            Alert.alert(
              '신고 실패',
              reportError instanceof Error ? reportError.message : '잠시 후 다시 시도해주세요.',
            );
          });
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
              const res = await blockUserRequest({ userId: authorId });
              if (res.status !== 200 || res.error) {
                throw new Error(res.error?.message ?? '차단에 실패했습니다.');
              }
              blockUser(post.author.id);
              blockPost(post.id);
              setReportOpen(false);
              router.back();
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
