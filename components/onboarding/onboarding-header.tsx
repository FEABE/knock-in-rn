import { Pressable, Text, View } from 'react-native';

import { OnboardingProgress } from '@/components/ui/headless';
import {
  ONBOARDING_STEPS,
  STEP_LABELS,
  useOnboarding,
} from '@/lib/onboarding';

export function OnboardingHeader() {
  const { currentStep, currentIndex, goPrev, isFirst } = useOnboarding();
  const labels = ONBOARDING_STEPS.map((s) => STEP_LABELS[s]);

  return (
    <View className="gap-4 border-b border-neutral-200 bg-white px-5 pb-4 pt-2">
      <View className="flex-row items-center justify-between">
        <Pressable
          onPress={goPrev}
          disabled={isFirst}
          accessibilityRole="button"
          accessibilityLabel="이전"
          className="h-9 w-9 items-center justify-center rounded-full active:bg-neutral-100"
        >
          <Text
            className={
              isFirst ? 'text-2xl text-neutral-300' : 'text-2xl text-neutral-800'
            }
          >
            ‹
          </Text>
        </Pressable>
        <Text className="text-base font-semibold text-neutral-900">
          {STEP_LABELS[currentStep]}
        </Text>
        <View className="h-9 w-9" />
      </View>

      <OnboardingProgress steps={labels} current={currentIndex}>
        {({ progress, current, total }) => (
          <View className="gap-2">
            <View className="h-1.5 w-full overflow-hidden rounded-full bg-neutral-200">
              <View
                style={{ width: `${progress * 100}%` }}
                className="h-full rounded-full bg-blue-600"
              />
            </View>
            <Text className="text-xs text-neutral-500">
              {current + 1} / {total}
            </Text>
          </View>
        )}
      </OnboardingProgress>
    </View>
  );
}
