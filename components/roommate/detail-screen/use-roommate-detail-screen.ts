import { useLocalSearchParams, useRouter } from 'expo-router';
import { Alert, type NativeScrollEvent, type NativeSyntheticEvent } from 'react-native';
import { useEffect, useMemo, useRef, useState } from 'react';

import { AnalyticsEvent, logEvent } from '@/lib/analytics';
import {
  toRoommateMatchDetailModel,
  type RoommateMatchDetailModel,
  useChatRequestActions,
  useRoommateMatchCards,
  useRoommateMatchDetail,
  useRoommateMatchLikeActions,
  useRoommateMatchReportActions,
} from '@/lib/api';
import { useRequireLogin } from '@/lib/auth';

export type UseRoommateDetailScreenReturn = {
  data: RoommateMatchDetailModel | null;
  loading: boolean;
  error: string | null;
  liked: boolean;
  reportOpen: boolean;
  lifestyleExpanded: boolean;
  setReportOpen: (next: boolean) => void;
  onBack: () => void;
  onScroll: (event: NativeSyntheticEvent<NativeScrollEvent>) => void;
  onCompatibilityLayout: (y: number) => void;
  toggleLifestyle: () => void;
  onLike: () => void;
  onRequest: () => void;
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
  const [lifestyleExpanded, setLifestyleExpanded] = useState(false);
  const compatY = useRef(0);
  const firedCompat = useRef(false);
  const matchId = id ?? '';
  const { data: rawData, loading, error } = useRoommateMatchDetail(matchId);
  const { data: matchCards } = useRoommateMatchCards();
  const setMatchLiked = useRoommateMatchLikeActions();
  const { reportMatch } = useRoommateMatchReportActions();
  const { requestChat } = useChatRequestActions();
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
    onRequest: () =>
      requireLogin(() => {
        if (!data) return;
        Alert.alert('매칭 요청', `${data.name}님께 매칭을 요청할까요?`, [
          { text: '취소', style: 'cancel' },
          {
            text: '요청',
            onPress: async () => {
              logEvent(AnalyticsEvent.ROOMMATE_MATCH_REQUEST, { target_user_id: id });
              const requesteeId = Number(data.id);
              if (!Number.isFinite(requesteeId)) {
                Alert.alert('요청 실패', '상대 사용자 정보를 확인하지 못했습니다.');
                return;
              }
              try {
                await requestChat({ requesteeId });
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
