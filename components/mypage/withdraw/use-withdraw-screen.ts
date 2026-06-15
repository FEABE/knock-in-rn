import { useRouter } from 'expo-router';
import { Alert } from 'react-native';
import { useMemo, useState } from 'react';

import { useSession } from '@/lib/domain';

export type WithdrawReason = {
  id: string;
  label: string;
};

export type UseWithdrawScreenReturn = {
  reasons: WithdrawReason[];
  selectedReasonIds: Set<string>;
  canSubmit: boolean;
  onBack: () => void;
  toggleReason: (id: string) => void;
  submit: () => void;
};

export function useWithdrawScreen(): UseWithdrawScreenReturn {
  const router = useRouter();
  const { signOut } = useSession();
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
    Alert.alert('탈퇴 신청 완료', '데모 모드에서는 세션만 로그아웃 처리돼요.', [
      {
        text: '확인',
        onPress: () => {
          signOut();
          router.replace('/explore' as never);
        },
      },
    ]);
  };

  return {
    reasons,
    selectedReasonIds,
    canSubmit: selectedReasonIds.size > 0,
    onBack: () => router.back(),
    toggleReason,
    submit,
  };
}
