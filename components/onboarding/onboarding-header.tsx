import { Text, View } from 'react-native';

import { ONBOARDING_STEPS, STEP_LABELS, useOnboarding } from '@/lib/onboarding';

/**
 * 와이어프레임 온보딩 헤더: 3분할 진행 바 + "1 / 3 — 기본 정보" 라벨.
 * (상단 뒤로가기/제목 바 없음 — 뒤로가기는 푸터의 "이전"으로)
 */
export function OnboardingHeader() {
  const { currentStep, currentIndex } = useOnboarding();
  const total = ONBOARDING_STEPS.length;

  return (
    <View className="gap-2 bg-white px-5 pb-3 pt-3">
      <View className="flex-row gap-1.5">
        {ONBOARDING_STEPS.map((step, i) => (
          <View
            key={step}
            className={`h-1.5 flex-1 rounded-full ${
              i <= currentIndex ? 'bg-violet-600' : 'bg-neutral-200'
            }`}
          />
        ))}
      </View>
      <Text className="text-xs text-neutral-400">
        {currentIndex + 1} / {total} — {STEP_LABELS[currentStep]}
      </Text>
    </View>
  );
}
