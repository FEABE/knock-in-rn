import { useLocalSearchParams, useRouter } from 'expo-router';
import { useState } from 'react';
import { Alert, Keyboard } from 'react-native';

import { setModerationSuccessToast } from '@/components/moderation/moderation-success-toast';
import { useSafeBottomPadding } from '@/hooks/use-safe-bottom-padding';
import { useRoommateBoardWriteActions, useRoommateMatchReportActions } from '@/lib/api';
import { goModerationReturnTarget, resolveModerationReturnTarget } from '@/lib/navigation/routes';

/** 신고 대상 종류. board=방 게시글, match=룸메이트(사용자). */
export type ReportTargetKind = 'board' | 'match';

export type UseReportFormReturn = {
  title: string;
  reportReason: string;
  submitting: boolean;
  submitDisabled: boolean;
  bottomPadding: number;
  onBack: () => void;
  onReportReasonChange: (value: string) => void;
  onSubmit: () => void;
};

export function useReportForm(): UseReportFormReturn {
  const router = useRouter();
  const params = useLocalSearchParams<{
    target?: string;
    id?: string;
    from?: string;
    tab?: string;
    returnTo?: string;
  }>();
  const target: ReportTargetKind = params.target === 'match' ? 'match' : 'board';
  const targetId = typeof params.id === 'string' ? params.id : '';
  const bottomPadding = useSafeBottomPadding(12, 12);
  const { reportBoard } = useRoommateBoardWriteActions();
  const { reportMatch } = useRoommateMatchReportActions();

  const [reportReason, setReportReason] = useState('');
  const [submitting, setSubmitting] = useState(false);

  return {
    title: '신고하기',
    reportReason,
    submitting,
    submitDisabled: !reportReason.trim() || submitting,
    bottomPadding,
    onBack: () => router.back(),
    onReportReasonChange: setReportReason,
    onSubmit: () => {
      const contents = reportReason.trim();
      if (!contents || !targetId || submitting) return;
      setSubmitting(true);
      void (async () => {
        try {
          if (target === 'match') {
            await reportMatch(targetId, contents);
          } else {
            await reportBoard(targetId, contents);
          }
          const returnTarget = resolveModerationReturnTarget(
            params.from,
            params.returnTo,
            params.tab,
            target === 'match' ? 'roommates' : 'rooms',
          );
          setModerationSuccessToast(returnTarget, '신고가 완료되었어요');
          Keyboard.dismiss();
          goModerationReturnTarget(router, returnTarget);
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
