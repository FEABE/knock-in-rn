import { useRouter } from 'expo-router';
import { Alert } from 'react-native';
import { useState } from 'react';

import { useAccountActions } from '@/lib/api';
import { useSession } from '@/lib/domain';
import { resetToExplore } from '@/lib/navigation/routes';

export type UseWithdrawScreenReturn = {
  submitting: boolean;
  confirmOpen: boolean;
  onBack: () => void;
  openConfirm: () => void;
  closeConfirm: () => void;
  confirmWithdraw: () => Promise<void>;
};

export function useWithdrawScreen(): UseWithdrawScreenReturn {
  const router = useRouter();
  const { signOut } = useSession();
  const { requestWithdraw, withdrawing } = useAccountActions();
  const [confirmOpen, setConfirmOpen] = useState(false);

  const confirmWithdraw = async () => {
    if (withdrawing) return;
    try {
      await requestWithdraw();
    } catch (error) {
      setConfirmOpen(false);
      Alert.alert(
        '탈퇴 실패',
        error instanceof Error ? error.message : '잠시 후 다시 시도해주세요.',
      );
      return;
    }
    setConfirmOpen(false);
    resetToExplore(router);
    await signOut();
    resetToExplore(router);
  };

  return {
    submitting: withdrawing,
    confirmOpen,
    onBack: () => router.back(),
    openConfirm: () => setConfirmOpen(true),
    closeConfirm: () => setConfirmOpen(false),
    confirmWithdraw,
  };
}
