import type { ReportTargetKind } from './use-report-form';

type PendingReportToast = {
  target: ReportTargetKind;
  targetId: string;
  message: string;
};

let pendingToast: PendingReportToast | null = null;

export function setReportSuccessToast(target: ReportTargetKind, targetId: string) {
  pendingToast = { target, targetId, message: '신고가 완료되었어요' };
}

export function consumeReportSuccessToast(
  target: ReportTargetKind,
  targetId: string,
): string | null {
  if (pendingToast?.target !== target || pendingToast.targetId !== targetId) return null;

  const { message } = pendingToast;
  pendingToast = null;
  return message;
}
