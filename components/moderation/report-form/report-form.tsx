import { ReportFormView } from './report-form.view';
import { useReportForm } from './use-report-form';

export function ReportFormScreen() {
  const asks = useReportForm();
  return (
    <ReportFormView
      title={asks.title}
      reportReason={asks.reportReason}
      processing={asks.submitting}
      submitDisabled={asks.submitDisabled}
      bottomPadding={asks.bottomPadding}
      onBack={asks.onBack}
      onReportReasonChange={asks.onReportReasonChange}
      onSubmit={asks.onSubmit}
    />
  );
}
