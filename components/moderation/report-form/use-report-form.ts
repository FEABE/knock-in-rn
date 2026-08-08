import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import { Alert } from 'react-native';

import { useSafeBottomPadding } from '@/hooks/use-safe-bottom-padding';
import { useRoommateBoardWriteActions, useRoommateMatchReportActions } from '@/lib/api';

/** 신고 대상 종류. board=방 게시글, match=룸메이트(사용자). */
export type ReportTargetKind = 'board' | 'match';

export type UseReportFormReturn = {
  title: string;
  reportReason: string;
  submitting: boolean;
  submitDisabled: boolean;
  toastVisible: boolean;
  bottomPadding: number;
  onBack: () => void;
  onReportReasonChange: (value: string) => void;
  onSubmit: () => void;
};

const TOAST_DURATION_MS = 1400;

export function useReportForm(): UseReportFormReturn {
  const router = useRouter();
  const params = useLocalSearchParams<{ target?: string; id?: string }>();
  const target: ReportTargetKind = params.target === 'match' ? 'match' : 'board';
  const targetId = typeof params.id === 'string' ? params.id : '';
  const bottomPadding = useSafeBottomPadding(12, 12);
  const { reportBoard } = useRoommateBoardWriteActions();
  const { reportMatch } = useRoommateMatchReportActions();

  const [reportReason, setReportReason] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [toastVisible, setToastVisible] = useState(false);
  const backTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(
    () => () => {
      if (backTimer.current) clearTimeout(backTimer.current);
    },
    [],
  );

  return {
    title: '신고하기',
    reportReason,
    submitting,
    submitDisabled: !reportReason.trim() || submitting || toastVisible,
    toastVisible,
    bottomPadding,
    onBack: () => router.back(),
    onReportReasonChange: setReportReason,
    onSubmit: () => {
      const contents = reportReason.trim();
      if (!contents || !targetId || submitting || toastVisible) return;
      setSubmitting(true);
      void (async () => {
        try {
          if (target === 'match') {
            await reportMatch(targetId, contents);
          } else {
            await reportBoard(targetId, contents);
          }
          setToastVisible(true);
          backTimer.current = setTimeout(() => router.back(), TOAST_DURATION_MS);
        } catch (reportError) {
          Alert.alert(
            '신고 실패',
            reportError instanceof Error ? reportError.message : '잠시 후 다시 시도해주세요.',
          );
        } finally {
          setSubmitting(false);
        }
      })();
    },
  };
}
