import { useRouter } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import { Alert, BackHandler } from 'react-native';

import { roomFormValuesToBoardWriteRequest } from '@/components/room/room-post-form.api';
import type { RoomFormValues } from '@/components/room/room-post-form';
import {
  useMyLifestyleOverview,
  useRoommateBoardWriteActions,
  type LifestyleSummaryItem,
  type PreferencePrioritySummaryItem,
} from '@/lib/api';
import { useRequireLogin } from '@/lib/auth';
import { goMypageProfile } from '@/lib/navigation/routes';

const SUCCESS_TOAST_MS = 1200;

export type LifestyleTileViewModel = {
  id: string;
  label: string;
  value: string;
  image?: string | null;
};

export type UseNewRoomScreenReturn = {
  session: ReturnType<typeof useRequireLogin>['session'];
  submitting: boolean;
  successToastVisible: boolean;
  mypageDialogOpen: boolean;
  /** 뒤로가기로 화면을 벗어나기 전 띄우는 확인창(작성 내용은 저장되지 않는다). */
  exitDialogOpen: boolean;
  /** 서버 메타 순서대로 구성한 내 생활패턴 전체. */
  lifestyleTiles: LifestyleTileViewModel[];
  /** 선호 룸메이트 조건. */
  preferredLifestyles: LifestyleSummaryItem[];
  /** 우선순위 조건. */
  importantConditions: PreferencePrioritySummaryItem[];
  lifestyleLoading: boolean;
  lifestyleError: string | null;
  reloadLifestyle: () => void;
  onBack: () => void;
  onExitCancel: () => void;
  onExitConfirm: () => void;
  onSignIn: () => void;
  onSubmit: (values: RoomFormValues) => Promise<void>;
  onRequestEditProfile: () => void;
  onCancelEditProfile: () => void;
  onConfirmEditProfile: () => void;
};

export function useNewRoomScreen(): UseNewRoomScreenReturn {
  const router = useRouter();
  const { session, requireLogin } = useRequireLogin();
  const { createBoard } = useRoommateBoardWriteActions();
  // 세션에는 생활패턴/선호조건이 없어서 화면 진입 시 서버에서 직접 읽어온다.
  const lifestyleOverview = useMyLifestyleOverview(Boolean(session));
  const [submitting, setSubmitting] = useState(false);
  const [successToastVisible, setSuccessToastVisible] = useState(false);
  const [mypageDialogOpen, setMypageDialogOpen] = useState(false);
  const [exitDialogOpen, setExitDialogOpen] = useState(false);
  const backTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  /** 등록 성공 후 자동 복귀는 확인창 없이 지나가야 한다. */
  const leavingRef = useRef(false);

  useEffect(
    () => () => {
      if (backTimer.current) clearTimeout(backTimer.current);
    },
    [],
  );

  // Android 하드웨어 뒤로가기도 헤더 뒤로가기와 같은 확인창을 거치게 한다.
  // (iOS 스와이프 뒤로가기는 app/room/new.tsx 에서 gestureEnabled: false 로 막는다.)
  useEffect(() => {
    const subscription = BackHandler.addEventListener('hardwareBackPress', () => {
      if (leavingRef.current) return false;
      if (exitDialogOpen) {
        setExitDialogOpen(false);
        return true;
      }
      if (submitting) return true;
      setExitDialogOpen(true);
      return true;
    });
    return () => subscription.remove();
  }, [exitDialogOpen, submitting]);

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
    leavingRef.current = true;
    backTimer.current = setTimeout(() => router.back(), SUCCESS_TOAST_MS);
  };

  return {
    session,
    submitting,
    successToastVisible,
    mypageDialogOpen,
    lifestyleTiles: lifestyleOverview.data?.lifestyles ?? [],
    preferredLifestyles: lifestyleOverview.data?.preferredLifestyles ?? [],
    importantConditions: lifestyleOverview.data?.importantConditions ?? [],
    lifestyleLoading: lifestyleOverview.loading,
    lifestyleError: lifestyleOverview.error,
    reloadLifestyle: lifestyleOverview.reload,
    exitDialogOpen,
    // 작성 중인 내용은 저장되지 않으므로 뒤로가기는 바로 나가지 않고 확인창을 띄운다.
    onBack: () => setExitDialogOpen(true),
    onExitCancel: () => setExitDialogOpen(false),
    onExitConfirm: () => {
      setExitDialogOpen(false);
      leavingRef.current = true;
      router.back();
    },
    onSignIn: () => requireLogin(() => undefined),
    onSubmit,
    onRequestEditProfile: () => setMypageDialogOpen(true),
    onCancelEditProfile: () => setMypageDialogOpen(false),
    onConfirmEditProfile: () => {
      setMypageDialogOpen(false);
      goMypageProfile(router);
    },
  };
}
