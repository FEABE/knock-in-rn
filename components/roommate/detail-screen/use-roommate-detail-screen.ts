import { useFocusEffect } from '@react-navigation/native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Alert, type NativeScrollEvent, type NativeSyntheticEvent } from 'react-native';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import { consumeReportSuccessToast } from '@/components/moderation/report-form/report-success-toast';
import { AnalyticsEvent, logEvent } from '@/lib/analytics';
import { useSafeBottomPadding } from '@/hooks/use-safe-bottom-padding';
import {
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
import { goChatRoom } from '@/lib/navigation/routes';

export type UseRoommateDetailScreenReturn = {
  data: RoommateMatchDetailModel | null;
  loading: boolean;
  error: string | null;
  liked: boolean;
  reportOpen: boolean;
  lifestyleExpanded: boolean;
  creatingChat: boolean;
  blockConfirmOpen: boolean;
  blocking: boolean;
  toast: string | null;
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

const TOAST_DURATION_MS = 2000;

export function useRoommateDetailScreen(): UseRoommateDetailScreenReturn {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { requireLogin } = useRequireLogin();
  const bottomPadding = useSafeBottomPadding(12, 12);
  const [lifestyleExpanded, setLifestyleExpanded] = useState(false);
  const compatY = useRef(0);
  const firedCompat = useRef(false);
  const matchId = id ?? '';
  const { data: rawData, loading, error } = useRoommateMatchDetail(matchId);
  const { data: matchList } = useRoommateMatchList();
  const setMatchLiked = useRoommateMatchLikeActions();
  const { createRoom, creatingRoom } = useCreateChatRoom();
  const { requestBlock } = useAccountActions();
  const { blockUser } = useModeration();
  const [reportOpen, setReportOpen] = useState(false);
  const [blockConfirmOpen, setBlockConfirmOpen] = useState(false);
  const [blocking, setBlocking] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

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

  useEffect(
    () => () => {
      if (toastTimer.current) clearTimeout(toastTimer.current);
    },
    [],
  );

  const showToast = useCallback((message: string) => {
    setToast(message);
    if (toastTimer.current) clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToast(null), TOAST_DURATION_MS);
  }, []);

  useFocusEffect(
    useCallback(() => {
      const message = consumeReportSuccessToast('match', matchId);
      if (message) showToast(message);
    }, [matchId, showToast]),
  );

  return {
    data,
    loading,
    error,
    liked,
    reportOpen,
    lifestyleExpanded,
    creatingChat: creatingRoom,
    blockConfirmOpen,
    blocking,
    toast,
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
          // 디자인 기준: 차단 후에도 화면을 유지하고 토스트만 보여준다.
          showToast('차단되었어요');
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
          params: { target: 'match', id: matchId },
        } as never);
      }),
  };
}
