import { useRouter } from 'expo-router';
import { Pressable, Text, View } from 'react-native';

import { ONBOARDING_STEPS, STEP_LABELS, useOnboarding } from '@/lib/onboarding';

/**
 * 와이어프레임 온보딩 헤더: 우상단 닫기(✕) + 3분할 진행 바 + "1 / 3 — 기본 정보" 라벨.
 * (뒤로가기는 푸터의 "이전"으로)
 */
export function OnboardingHeader() {
  const { currentStep, currentIndex } = useOnboarding();
  const router = useRouter();
  const total = ONBOARDING_STEPS.length;

  const exit = () => {
    if (router.canGoBack()) router.back();
    else router.replace('/(tabs)/explore' as never);
  };

  return (
    <View className="gap-2 bg-white px-5 pb-3 pt-3">
      <View className="flex-row items-center justify-end">
        <Pressable
          onPress={exit}
          hitSlop={8}
          className="h-8 w-8 items-center justify-center rounded-full active:bg-neutral-100"
        >
          <Text className="text-xl text-neutral-500">✕</Text>
        </Pressable>
      </View>
      <View className="flex-row gap-1.5">
        {ONBOARDING_STEPS.map((step, i) => (
          <View
            key={step}
            className={`h-1.5 flex-1 rounded-full ${
              i <= currentIndex ? 'bg-[#256EF4]' : 'bg-neutral-200'
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
