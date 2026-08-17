import type { ModerationReturnTarget } from '@/lib/navigation/routes';

export type PendingModerationSuccessToast = ModerationReturnTarget & {
  message: string;
  expiresAt: number;
};

let pendingToast: PendingModerationSuccessToast | null = null;

/** 신고·차단 성공 결과를 원래 목록 화면에서 한 번만 보여주기 위해 예약한다. */
export function setModerationSuccessToast(target: ModerationReturnTarget, message: string) {
  pendingToast = { ...target, message, expiresAt: Date.now() + 10_000 };
}

export function consumeModerationSuccessToast(
  screen: ModerationReturnTarget['screen'],
): PendingModerationSuccessToast | null {
  if (pendingToast && pendingToast.expiresAt < Date.now()) pendingToast = null;
  if (pendingToast?.screen !== screen) return null;
  const toast = pendingToast;
  pendingToast = null;
  return toast;
}
