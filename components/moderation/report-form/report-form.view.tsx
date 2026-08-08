import { KeyboardAvoidingView, Platform, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ReadyScreenHeader } from '@/components/ui/ready-to-dev-components';
import {
  ReadyBottomActionBar,
  ReadyNotice,
  ReadyTextAreaField,
} from '@/components/ui/ready-to-dev-form';

export type ReportFormViewProps = {
  title?: string;
  reportReason: string;
  reportReasonError?: string;
  processing?: boolean;
  submitDisabled?: boolean;
  bottomPadding?: number;
  onBack: () => void;
  onReportReasonChange: (value: string) => void;
  onSubmit: () => void;
};

/** 신고 사유 입력과 제출 상태를 렌더링하는 화면 컴포넌트. */
export function ReportFormView({
  title = '신고하기',
  reportReason,
  reportReasonError,
  processing = false,
  submitDisabled = false,
  bottomPadding = 0,
  onBack,
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
          contentContainerClassName="gap-4 px-4 pb-8 pt-6"
          keyboardShouldPersistTaps="handled"
        >
          <View className="gap-3">
            <View className="gap-1.5">
              <Text className="text-[15px] font-semibold leading-[23px] text-[#17171B]">
                신고 사유
              </Text>
              <Text className="text-[13px] font-medium leading-[20px] text-[#696976]">
                허위 정보, 부적절한 콘텐츠, 사기 의심, 불쾌한 언행 등 신고 사유를 자세히
                작성해주세요
              </Text>
            </View>
            <ReadyTextAreaField
              value={reportReason}
              onChangeText={onReportReasonChange}
              placeholder="신고 사유를 입력해주세요"
              maxLength={500}
              minHeight={112}
              error={reportReasonError}
            />
          </View>

          <ReadyNotice>
            신고 접수 후 운영팀에서 검토하여 7일 내로 처리돼요{`\n`}허위 신고 시 서비스 이용이
            제한될 수 있어요
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
