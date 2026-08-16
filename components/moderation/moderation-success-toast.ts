import type { ListReturnTarget } from '@/lib/navigation/routes';

type PendingModerationSuccessToast = ListReturnTarget & {
  message: string;
};

let pendingToast: PendingModerationSuccessToast | null = null;

/** 신고·차단 성공 결과를 원래 목록 화면에서 한 번만 보여주기 위해 예약한다. */
export function setModerationSuccessToast(target: ListReturnTarget, message: string) {
  pendingToast = { ...target, message };
}

export function consumeModerationSuccessToast(
  screen: ListReturnTarget['screen'],
): PendingModerationSuccessToast | null {
  if (pendingToast?.screen !== screen) return null;
  const toast = pendingToast;
  pendingToast = null;
  return toast;
}
