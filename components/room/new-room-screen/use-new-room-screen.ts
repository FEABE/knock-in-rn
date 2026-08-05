import { useRouter } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import { Alert } from 'react-native';

import { roomFormValuesToBoardWriteRequest } from '@/components/room/room-post-form.api';
import type { RoomFormValues } from '@/components/room/room-post-form';
import { useRoommateBoardWriteActions } from '@/lib/api';
import { useRequireLogin } from '@/lib/auth';
import { goKakaoLogin, goMypageProfile } from '@/lib/navigation/routes';

const SUCCESS_TOAST_MS = 1200;

export type UseNewRoomScreenReturn = {
  session: ReturnType<typeof useRequireLogin>['session'];
  submitting: boolean;
  successToastVisible: boolean;
  mypageDialogOpen: boolean;
  onBack: () => void;
  onSignIn: () => void;
  onSubmit: (values: RoomFormValues) => Promise<void>;
  onRequestEditProfile: () => void;
  onCancelEditProfile: () => void;
  onConfirmEditProfile: () => void;
};

export function useNewRoomScreen(): UseNewRoomScreenReturn {
  const router = useRouter();
  const { session } = useRequireLogin();
  const { createBoard } = useRoommateBoardWriteActions();
  const [submitting, setSubmitting] = useState(false);
  const [successToastVisible, setSuccessToastVisible] = useState(false);
  const [mypageDialogOpen, setMypageDialogOpen] = useState(false);
  const backTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(
    () => () => {
      if (backTimer.current) clearTimeout(backTimer.current);
    },
    [],
  );

  const onSubmit = async (values: RoomFormValues) => {
    if (!session || submitting) return;

    setSubmitting(true);
    try {
      await createBoard(roomFormValuesToBoardWriteRequest(values));
    } catch (error) {
      Alert.alert(
        '등록 실패',
        error instanceof Error ? error.message : '잠시 후 다시 시도해주세요.',
      );
      setSubmitting(false);
      return;
    }

    // 등록 성공: 토스트를 잠시 보여준 뒤 목록으로 복귀한다.
    setSuccessToastVisible(true);
    backTimer.current = setTimeout(() => router.back(), SUCCESS_TOAST_MS);
  };

  return {
    session,
    submitting,
    successToastVisible,
    mypageDialogOpen,
    onBack: () => router.back(),
    onSignIn: () => goKakaoLogin(router),
    onSubmit,
    onRequestEditProfile: () => setMypageDialogOpen(true),
    onCancelEditProfile: () => setMypageDialogOpen(false),
    onConfirmEditProfile: () => {
      setMypageDialogOpen(false);
      goMypageProfile(router);
    },
  };
}
