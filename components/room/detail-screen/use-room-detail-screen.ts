import { useLocalSearchParams, useRouter } from 'expo-router';
import { Alert } from 'react-native';
import { useEffect, useMemo, useState } from 'react';

import { AnalyticsEvent, logEvent } from '@/lib/analytics';
import { useRequireLogin } from '@/lib/auth';
import { useModeration, useRoomStore, useSession, type RoomPost } from '@/lib/domain';
import { goChatRoom, goRoomEdit, goRoommateDetail } from '@/lib/navigation/routes';

export const ROOM_REPORT_REASONS = [
  '허위 매물',
  '욕설/혐오 표현',
  '불법/사기 의심',
  '동일/반복 게시',
  '기타',
];

export type UseRoomDetailScreenReturn = {
  post: RoomPost;
  photos: string[];
  isLoggedIn: boolean;
  isOwner: boolean;
  blocked: boolean;
  liked: boolean;
  reportOpen: boolean;
  menuOpen: boolean;
  photoIndex: number;
  descExpanded: boolean;
  lifestyleExpanded: boolean;
  setReportOpen: (next: boolean) => void;
  setMenuOpen: (next: boolean) => void;
  setPhotoIndex: (next: number) => void;
  toggleDescription: () => void;
  toggleLifestyle: () => void;
  onBack: () => void;
  onEdit: () => void;
  onDelete: () => void;
  onAuthorPress: () => void;
  onLike: () => void;
  onRequestChat: () => void;
  onReportReason: (reason: string) => void;
  onBlockAuthor: () => void;
};

export function useRoomDetailScreen(): UseRoomDetailScreenReturn {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { session } = useSession();
  const { requireLogin } = useRequireLogin();
  const { getById, posts, remove, update } = useRoomStore();
  const { report, blockUser, isPostBlocked, blockPost } = useModeration();

  const [reportOpen, setReportOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [photoIndex, setPhotoIndex] = useState(0);
  const [descExpanded, setDescExpanded] = useState(false);
  const [lifestyleExpanded, setLifestyleExpanded] = useState(false);

  const post = useMemo(() => {
    if (typeof id === 'string') {
      const found = getById(id);
      if (found) return found;
    }
    return posts[0];
  }, [id, getById, posts]);

  const photos = post.photoUrls?.length
    ? post.photoUrls
    : post.thumbnailUrl
      ? [post.thumbnailUrl]
      : [];
  const isOwner = session?.user.id === post.author.id;
  const blocked = isPostBlocked(post.id);

  useEffect(() => {
    if (post?.id) logEvent(AnalyticsEvent.ROOM_DETAIL_VIEW, { room_id: post.id });
  }, [post?.id]);

  return {
    post,
    photos,
    isLoggedIn: !!session,
    isOwner,
    blocked,
    liked: !!post.liked,
    reportOpen,
    menuOpen,
    photoIndex,
    descExpanded,
    lifestyleExpanded,
    setReportOpen,
    setMenuOpen,
    setPhotoIndex,
    toggleDescription: () => setDescExpanded((prev) => !prev),
    toggleLifestyle: () => setLifestyleExpanded((prev) => !prev),
    onBack: () => router.back(),
    onEdit: () => {
      setMenuOpen(false);
      goRoomEdit(router, post.id);
    },
    onDelete: () => {
      setMenuOpen(false);
      Alert.alert('삭제', '게시글을 삭제할까요?', [
        { text: '취소', style: 'cancel' },
        {
          text: '삭제',
          style: 'destructive',
          onPress: () => {
            remove(post.id);
            router.back();
          },
        },
      ]);
    },
    onAuthorPress: () => goRoommateDetail(router, `rc-${post.author.id}`),
    onLike: () =>
      requireLogin(() => {
        const next = !post.liked;
        logEvent(next ? AnalyticsEvent.ROOM_INTEREST_ADD : AnalyticsEvent.ROOM_INTEREST_REMOVE, {
          room_id: post.id,
        });
        update(post.id, { liked: next });
      }),
    onRequestChat: () =>
      requireLogin(() => {
        Alert.alert('매칭 요청', `${post.author.name}님께 1:1 대화 요청을 보낼까요?`, [
          { text: '취소', style: 'cancel' },
          { text: '요청 보내기', onPress: () => goChatRoom(router, post.author.id) },
        ]);
      }),
    onReportReason: (reason) => {
      report({ kind: 'post', id: post.id }, reason);
      setReportOpen(false);
      Alert.alert('신고 접수 완료', '검토 후 조치할게요.');
    },
    onBlockAuthor: () => {
      Alert.alert('차단', `${post.author.name}님을 차단할까요? 상호 비노출 처리돼요.`, [
        { text: '취소', style: 'cancel' },
        {
          text: '차단',
          style: 'destructive',
          onPress: () => {
            blockUser(post.author.id);
            blockPost(post.id);
            setReportOpen(false);
            router.back();
          },
        },
      ]);
    },
  };
}
