import { useRouter } from 'expo-router';
import { Alert } from 'react-native';
import { useMemo, useState } from 'react';

import { useAccountActions } from '@/lib/api';
import { useSession } from '@/lib/domain';
import { goExplore } from '@/lib/navigation/routes';

export type WithdrawReason = {
  id: string;
  label: string;
};

export type UseWithdrawScreenReturn = {
  reasons: WithdrawReason[];
  selectedReasonIds: Set<string>;
  canSubmit: boolean;
  submitting: boolean;
  onBack: () => void;
  toggleReason: (id: string) => void;
  submit: () => void;
};

export function useWithdrawScreen(): UseWithdrawScreenReturn {
  const router = useRouter();
  const { signOut } = useSession();
  const { requestWithdraw, withdrawing } = useAccountActions();
  const [selectedReasonIds, setSelectedReasonIds] = useState<Set<string>>(new Set());

  const reasons = useMemo<WithdrawReason[]>(
    () => [
      { id: 'matched', label: '이미 원하는 룸메이트를 찾았어요' },
      { id: 'low-usage', label: '서비스를 자주 사용하지 않아요' },
      { id: 'privacy', label: '개인정보 삭제를 요청하고 싶어요' },
      { id: 'other', label: '기타 사유가 있어요' },
    ],
    [],
  );

  const toggleReason = (id: string) => {
    setSelectedReasonIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const submit = () => {
    if (selectedReasonIds.size === 0) return;
    Alert.alert('탈퇴하기', '계정과 프로필을 삭제할까요?', [
      { text: '취소', style: 'cancel' },
      {
        text: '탈퇴',
        style: 'destructive',
        onPress: async () => {
          try {
            await requestWithdraw();
          } catch (error) {
            Alert.alert(
              '탈퇴 실패',
              error instanceof Error ? error.message : '잠시 후 다시 시도해주세요.',
            );
            return;
          }
          await signOut();
          Alert.alert('탈퇴 완료', '계정이 삭제되었어요.');
          goExplore(router, 'replace');
        },
      },
    ]);
  };

  return {
    reasons,
    selectedReasonIds,
    canSubmit: selectedReasonIds.size > 0 && !withdrawing,
    submitting: withdrawing,
    onBack: () => router.back(),
    toggleReason,
    submit,
  };
}
