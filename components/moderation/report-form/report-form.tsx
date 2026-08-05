import { View } from 'react-native';

import { ReadyToast } from '@/components/ui/ready-to-dev-feedback';

import { ReportFormView } from './report-form.view';
import { ReportTypeSheetView } from './report-type-sheet.view';
import { useReportForm } from './use-report-form';

export function ReportFormScreen() {
  const asks = useReportForm();
  return (
    <View className="flex-1 bg-white">
      <ReportFormView
        title={asks.title}
        reportType={asks.reportType}
        reportReason={asks.reportReason}
        processing={asks.submitting}
        submitDisabled={asks.submitDisabled}
        bottomPadding={asks.bottomPadding}
        onBack={asks.onBack}
        onReportTypePress={asks.openTypeSheet}
        onReportReasonChange={asks.onReportReasonChange}
        onSubmit={asks.onSubmit}
      />
      <ReportTypeSheetView
        open={asks.typeSheetOpen}
        onOpenChange={asks.setTypeSheetOpen}
        options={asks.reportTypeOptions}
        value={asks.reportType}
        onConfirm={asks.onSelectReportType}
      />
      <ReadyToast visible={asks.toastVisible} message="신고가 완료되었어요" tone="success" />
    </View>
  );
}
