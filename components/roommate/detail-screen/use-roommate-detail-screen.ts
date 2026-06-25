import { useLocalSearchParams, useRouter } from 'expo-router';
import { Alert, type NativeScrollEvent, type NativeSyntheticEvent } from 'react-native';
import { useEffect, useMemo, useRef, useState } from 'react';

import { AnalyticsEvent, logEvent } from '@/lib/analytics';
import {
  toRoommateMatchDetailModel,
  type RoommateMatchDetailModel,
  useRoommateMatchCards,
  useRoommateMatchDetail,
  useRoommateMatchLikeActions,
} from '@/lib/api';
import { useRequireLogin } from '@/lib/auth';
import { goChatRoom } from '@/lib/navigation/routes';

export type UseRoommateDetailScreenReturn = {
  data: RoommateMatchDetailModel | null;
  loading: boolean;
  error: string | null;
  liked: boolean;
  lifestyleExpanded: boolean;
  onBack: () => void;
  onScroll: (event: NativeSyntheticEvent<NativeScrollEvent>) => void;
  onCompatibilityLayout: (y: number) => void;
  toggleLifestyle: () => void;
  onLike: () => void;
  onRequest: () => void;
};

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
  const liked = matchCards?.find((match) => match.id === matchId)?.liked ?? false;
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
    lifestyleExpanded,
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
            onPress: () => {
              logEvent(AnalyticsEvent.ROOMMATE_MATCH_REQUEST, { target_user_id: id });
              goChatRoom(router, data.id);
            },
          },
        ]);
      }),
  };
}
