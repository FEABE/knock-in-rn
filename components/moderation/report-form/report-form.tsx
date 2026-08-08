import { View } from 'react-native';

import { ReadyToast } from '@/components/ui/ready-to-dev-feedback';

import { ReportFormView } from './report-form.view';
import { useReportForm } from './use-report-form';

export function ReportFormScreen() {
  const asks = useReportForm();
  return (
    <View className="flex-1 bg-white">
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
      <ReadyToast visible={asks.toastVisible} message="신고가 완료되었어요" tone="success" />
    </View>
  );
}
