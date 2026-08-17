import { useLocalSearchParams, useRouter } from 'expo-router';
import { Alert, type NativeScrollEvent, type NativeSyntheticEvent } from 'react-native';
import { useEffect, useMemo, useRef, useState } from 'react';

import { setModerationSuccessToast } from '@/components/moderation/moderation-success-toast';
import { AnalyticsEvent, logEvent } from '@/lib/analytics';
import { useSafeBottomPadding } from '@/hooks/use-safe-bottom-padding';
import {
  apiErrorCode,
  DEFAULT_CHAT_MESSAGE,
  toRoommateMatchDetailModel,
  type RoommateMatchDetailModel,
  useAccountActions,
  useCreateChatRoom,
  useRoommateMatchDetail,
  useRoommateMatchLikeActions,
  useRoommateMatchList,
} from '@/lib/api';
import { useRequireLogin } from '@/lib/auth';
import { useModeration } from '@/lib/domain';
import {
  goChatRoom,
  goModerationReturnTarget,
  moderationReturnParams,
  resolveModerationReturnTarget,
} from '@/lib/navigation/routes';

export type UseRoommateDetailScreenReturn = {
  data: RoommateMatchDetailModel | null;
  loading: boolean;
  error: string | null;
  liked: boolean;
  reportOpen: boolean;
  lifestyleExpanded: boolean;
  creatingChat: boolean;
  blockConfirmOpen: boolean;
  chatLimitOpen: boolean;
  closeChatLimit: () => void;
  blocking: boolean;
  bottomPadding: number;
  setReportOpen: (next: boolean) => void;
  onBack: () => void;
  onScroll: (event: NativeSyntheticEvent<NativeScrollEvent>) => void;
  onCompatibilityLayout: (y: number) => void;
  toggleLifestyle: () => void;
  onLike: () => void;
  onChat: () => void;
  onBlock: () => void;
  onBlockCancel: () => void;
  onBlockConfirm: () => void;
  onReport: () => void;
};

export function useRoommateDetailScreen(): UseRoommateDetailScreenReturn {
  const router = useRouter();
  const { id, from, tab, returnTo } = useLocalSearchParams<{
    id: string;
    from?: string;
    tab?: string;
    returnTo?: string;
  }>();
  const { requireLogin } = useRequireLogin();
  const bottomPadding = useSafeBottomPadding(12, 12);
  const [lifestyleExpanded, setLifestyleExpanded] = useState(false);
  const compatY = useRef(0);
  const firedCompat = useRef(false);
  const matchId = id ?? '';
  const returnTarget = resolveModerationReturnTarget(from, returnTo, tab, 'roommates');
  const { data: rawData, loading, error } = useRoommateMatchDetail(matchId);
  const { data: matchList } = useRoommateMatchList();
  const setMatchLiked = useRoommateMatchLikeActions();
  const { createRoom, creatingRoom } = useCreateChatRoom();
  const { requestBlock } = useAccountActions();
  const { blockUser } = useModeration();
  const [reportOpen, setReportOpen] = useState(false);
  const [blockConfirmOpen, setBlockConfirmOpen] = useState(false);
  const [chatLimitOpen, setChatLimitOpen] = useState(false);
  const [blocking, setBlocking] = useState(false);

  const rawListItem = useMemo(
    () =>
      matchList?.find((match) => String(match.userId ?? match.memberId ?? '') === matchId) ?? null,
    [matchList, matchId],
  );
  const liked = rawListItem?.interested === true;
  const data = useMemo(
    () => (rawData ? toRoommateMatchDetailModel(rawData, matchId, rawListItem?.lifeStyles) : null),
    [rawData, matchId, rawListItem],
  );

  useEffect(() => {
    if (id) logEvent(AnalyticsEvent.ROOMMATE_DETAIL_VIEW, { target_user_id: id });
  }, [id]);

  return {
    data,
    loading,
    error,
    liked,
    reportOpen,
    lifestyleExpanded,
    creatingChat: creatingRoom,
    blockConfirmOpen,
    chatLimitOpen,
    closeChatLimit: () => setChatLimitOpen(false),
    blocking,
    bottomPadding,
    setReportOpen,
    onBack: () => router.back(),
    onScroll: (event) => {
      if (firedCompat.current || !id) return;
      const { contentOffset, layoutMeasurement } = event.nativeEvent;
      if (contentOffset.y + layoutMeasurement.height >= compatY.current + 40) {
        firedCompat.current = true;
        logEvent(AnalyticsEvent.ROOMMATE_COMPATIBILITY_VIEW, { target_user_id: id });
      }
    },
    onCompatibilityLayout: (y) => {
      compatY.current = y;
    },
    toggleLifestyle: () => setLifestyleExpanded((prev) => !prev),
    onLike: () =>
      requireLogin(() => {
        const next = !liked;
        if (next) logEvent(AnalyticsEvent.ROOMMATE_INTEREST_ADD, { target_user_id: id });
        setMatchLiked(matchId, next);
      }),
    onChat: () =>
      requireLogin(() => {
        if (!data) return;
        const requesteeId = Number(data.id);
        if (!Number.isFinite(requesteeId)) {
          Alert.alert('채팅 실패', '상대 사용자 정보를 확인하지 못했습니다.');
          return;
        }
        void createRoom({
          requesteeId,
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
    onBlock: () =>
      requireLogin(() => {
        if (!data) return;
        setReportOpen(false);
        setBlockConfirmOpen(true);
      }),
    onBlockCancel: () => {
      if (blocking) return;
      setBlockConfirmOpen(false);
    },
    onBlockConfirm: () => {
      if (!data || blocking) return;
      const userId = Number(data.id);
      if (!Number.isFinite(userId)) {
        setBlockConfirmOpen(false);
        Alert.alert('차단 실패', '상대 사용자 정보를 확인하지 못했습니다.');
        return;
      }
      setBlocking(true);
      void (async () => {
        try {
          await requestBlock(userId);
          blockUser(String(userId));
          setBlockConfirmOpen(false);
          setModerationSuccessToast(returnTarget, '차단되었어요');
          goModerationReturnTarget(router, returnTarget);
        } catch (blockError) {
          Alert.alert(
            '차단 실패',
            blockError instanceof Error ? blockError.message : '잠시 후 다시 시도해주세요.',
          );
        } finally {
          setBlocking(false);
        }
      })();
    },
    onReport: () =>
      requireLogin(() => {
        if (!matchId) return;
        setReportOpen(false);
        router.push({
          pathname: '/moderation/report',
          params: {
            target: 'match',
            id: matchId,
            ...moderationReturnParams(returnTarget),
          },
        } as never);
      }),
  };
}
