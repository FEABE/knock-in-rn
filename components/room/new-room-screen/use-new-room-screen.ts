import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Alert } from 'react-native';

import { roomFormValuesToBoardWriteRequest } from '@/components/room/room-post-form.api';
import type { RoomFormValues } from '@/components/room/room-post-form';
import { useRoommateBoardWriteActions } from '@/lib/api';
import { useRequireLogin } from '@/lib/auth';
import { goKakaoLogin } from '@/lib/navigation/routes';

export type UseNewRoomScreenReturn = {
  session: ReturnType<typeof useRequireLogin>['session'];
  submitting: boolean;
  onBack: () => void;
  onSignIn: () => void;
  onSubmit: (values: RoomFormValues) => Promise<void>;
};

export function useNewRoomScreen(): UseNewRoomScreenReturn {
  const router = useRouter();
  const { session } = useRequireLogin();
  const { createBoard } = useRoommateBoardWriteActions();
  const [submitting, setSubmitting] = useState(false);

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

    Alert.alert('등록 완료', '게시글이 등록되었어요.', [
      { text: '확인', onPress: () => router.back() },
    ]);
    setSubmitting(false);
  };

  return {
    session,
    submitting,
    onBack: () => router.back(),
    onSignIn: () => goKakaoLogin(router),
    onSubmit,
  };
}
