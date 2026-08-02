import { KeyboardAvoidingView, Platform, ScrollView, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ReadyScreenHeader } from '@/components/ui/ready-to-dev-components';
import {
  ReadyBottomActionBar,
  ReadyFieldLabel,
  ReadyNotice,
  ReadySelectField,
  ReadyTextAreaField,
} from '@/components/ui/ready-to-dev-form';

export type ReportFormViewProps = {
  title?: string;
  reportType?: string;
  reportReason: string;
  reportTypeError?: string;
  reportReasonError?: string;
  processing?: boolean;
  submitDisabled?: boolean;
  bottomPadding?: number;
  onBack: () => void;
  onReportTypePress: () => void;
  onReportReasonChange: (value: string) => void;
  onSubmit: () => void;
};

/**
 * 신고 API 연결 전에도 Figma의 입력/검증 상태를 그대로 확인할 수 있는 화면 컴포넌트다.
 * 선택 목록과 제출 동작은 화면을 사용하는 쪽에서 주입한다.
 */
export function ReportFormView({
  title = '신고하기',
  reportType,
  reportReason,
  reportTypeError,
  reportReasonError,
  processing = false,
  submitDisabled = false,
  bottomPadding = 0,
  onBack,
  onReportTypePress,
  onReportReasonChange,
  onSubmit,
}: ReportFormViewProps) {
  return (
    <SafeAreaView className="flex-1 bg-white" edges={['top']}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        className="flex-1"
      >
        <ReadyScreenHeader title={title} onBack={onBack} />
        <ScrollView
          className="flex-1"
          contentContainerClassName="gap-6 px-4 pb-8 pt-4"
          keyboardShouldPersistTaps="handled"
        >
          <View className="gap-2">
            <ReadyFieldLabel required>신고 유형</ReadyFieldLabel>
            <ReadySelectField
              value={reportType}
              placeholder="신고 유형 선택"
              onPress={onReportTypePress}
              error={reportTypeError}
            />
          </View>

          <View className="gap-2">
            <ReadyFieldLabel required>신고 사유</ReadyFieldLabel>
            <View className="gap-2">
              <ReadyNotice tone="info">
                허위 정보, 부적절한 콘텐츠, 사기 의심, 불쾌한 언행 등 신고 사유를 자세히
                작성해주세요
              </ReadyNotice>
              <ReadyTextAreaField
                value={reportReason}
                onChangeText={onReportReasonChange}
                placeholder="신고 사유를 입력해주세요"
                maxLength={500}
                minHeight={112}
                error={reportReasonError}
              />
            </View>
          </View>

          <ReadyNotice>
            신고 접수 후 운영팀에서 검토하여 7일 내로 처리돼요. 허위 신고 시 서비스 이용이
            제한될 수 있어요.
          </ReadyNotice>
        </ScrollView>
        <ReadyBottomActionBar
          primaryLabel="제출하기"
          onPrimary={onSubmit}
          primaryDisabled={submitDisabled}
          processing={processing}
          bottomPadding={bottomPadding}
        />
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
