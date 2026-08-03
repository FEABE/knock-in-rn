import { useLocalSearchParams, useRouter } from 'expo-router';
import { Alert, type NativeScrollEvent, type NativeSyntheticEvent } from 'react-native';
import { useEffect, useMemo, useRef, useState } from 'react';

import { AnalyticsEvent, logEvent } from '@/lib/analytics';
import { useSafeBottomPadding } from '@/hooks/use-safe-bottom-padding';
import {
  DEFAULT_CHAT_MESSAGE,
  toRoommateMatchDetailModel,
  type RoommateMatchDetailModel,
  useAccountActions,
  useCreateChatRoom,
  useRoommateMatchCards,
  useRoommateMatchDetail,
  useRoommateMatchLikeActions,
  useRoommateMatchReportActions,
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
  bottomPadding: number;
  setReportOpen: (next: boolean) => void;
  onBack: () => void;
  onScroll: (event: NativeSyntheticEvent<NativeScrollEvent>) => void;
  onCompatibilityLayout: (y: number) => void;
  toggleLifestyle: () => void;
  onLike: () => void;
  onChat: () => void;
  onBlock: () => void;
  onReportReason: (reason: string) => void;
};

export const ROOMMATE_REPORT_REASONS = [
  '허위 프로필',
  '욕설/혐오 표현',
  '불쾌한 대화',
  '사기/금전 요구',
  '기타',
];

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
  const { data: matchCards } = useRoommateMatchCards();
  const setMatchLiked = useRoommateMatchLikeActions();
  const { reportMatch } = useRoommateMatchReportActions();
  const { createRoom, creatingRoom } = useCreateChatRoom();
  const { requestBlock } = useAccountActions();
  const { blockUser } = useModeration();
  const liked = matchCards?.find((match) => match.id === matchId)?.liked ?? false;
  const [reportOpen, setReportOpen] = useState(false);
  const data = useMemo(
    () => (rawData ? toRoommateMatchDetailModel(rawData, matchId) : null),
    [rawData, matchId],
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
        Alert.alert('차단', `${data.name}님을 차단할까요? 서로의 목록에서 보이지 않게 돼요.`, [
          { text: '취소', style: 'cancel' },
          {
            text: '차단',
            style: 'destructive',
            onPress: async () => {
              const userId = Number(data.id);
              if (!Number.isFinite(userId)) {
                Alert.alert('차단 실패', '상대 사용자 정보를 확인하지 못했습니다.');
                return;
              }
              try {
                await requestBlock(userId);
                blockUser(String(userId));
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
      }),
    onReportReason: (reason) =>
      requireLogin(() => {
        if (!matchId) return;
        void reportMatch(matchId, reason)
          .then(() => {
            setReportOpen(false);
            Alert.alert('신고 접수 완료', '검토 후 조치할게요.');
          })
          .catch((reportError) => {
            Alert.alert(
              '신고 실패',
              reportError instanceof Error ? reportError.message : '잠시 후 다시 시도해주세요.',
            );
          });
      }),
  };
}
