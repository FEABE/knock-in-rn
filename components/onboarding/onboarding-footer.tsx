import { ActivityIndicator, Text, View } from 'react-native';

import { AnalyticsEvent, logEvent, ONBOARDING_STEP_META } from '@/lib/analytics';
import { Button } from '@/components/ui/headless';
import { useSafeBottomPadding } from '@/hooks/use-safe-bottom-padding';
import { useOnboarding } from '@/lib/onboarding';

export type OnboardingFooterProps = {
  canProceed: boolean;
  primaryLabel?: string;
  onPress?: () => void;
  helper?: string;
  /** "이전으로" 보조 버튼 표시 (2·3 스텝). */
  showBack?: boolean;
  /** 제출(API 호출) 진행 중. 버튼 비활성 + 스피너 표시. */
  loading?: boolean;
};

export function OnboardingFooter({
  canProceed,
  primaryLabel,
  onPress,
  helper,
  showBack = false,
  loading = false,
}: OnboardingFooterProps) {
  const { isLast, goNext, goPrev, currentStep } = useOnboarding();
  const handlePress = onPress ?? goNext;
  const label = primaryLabel ?? (isLast ? '완료' : '다음으로');
  const disabled = !canProceed || loading;
  const bottomPadding = useSafeBottomPadding(12, 16);

  // 뒤로가기 탭: 어느 질문에서 망설임이 많은지 파악.
  const handleBack = () => {
    const meta = ONBOARDING_STEP_META[currentStep];
    logEvent(AnalyticsEvent.ONBOARDING_BACK_TAP, {
      step_index: meta?.index,
      step_name: meta?.name,
    });
    goPrev();
  };

  return (
    <View
      className="gap-2 border-t border-[#ECECF3] bg-white px-4 pt-4"
      style={{ paddingBottom: bottomPadding }}
    >
      {helper ? <Text className="text-xs text-neutral-500">{helper}</Text> : null}
      <View className="flex-row gap-3">
        {showBack ? (
          <Button
            onPress={handleBack}
            className="h-12 flex-1 items-center justify-center rounded-lg border border-neutral-200 bg-white active:bg-neutral-50"
          >
            <Text className="text-base font-semibold text-neutral-500">이전으로</Text>
          </Button>
        ) : null}
        <Button
          disabled={disabled}
          onPress={handlePress}
          className={`h-12 items-center justify-center rounded-lg ${
            showBack ? 'flex-1' : 'w-full'
          } ${canProceed ? 'bg-[#256EF4] active:bg-[#256EF4]' : 'bg-[#ECECF3]'}`}
        >
          {loading ? (
            <ActivityIndicator color="#ffffff" />
          ) : (
            <Text className={`text-base font-bold ${canProceed ? 'text-white' : 'text-[#AAAABA]'}`}>
              {label}
            </Text>
          )}
        </Button>
      </View>
    </View>
  );
}
