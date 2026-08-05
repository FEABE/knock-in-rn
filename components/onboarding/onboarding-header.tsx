import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Pressable, Text, View } from 'react-native';

import { goExplore } from '@/lib/navigation/routes';
import { STEP_LABELS, useOnboarding, type OnboardingStep } from '@/lib/onboarding';

const DESIGN_PROGRESS: Record<Exclude<OnboardingStep, 'roominfo'>, number> = {
  'profile-basic': 1,
  'profile-lifestyle': 3,
};

export function OnboardingHeader() {
  const { currentStep, isFirst, goPrev } = useOnboarding();
  const router = useRouter();
  const progress = currentStep === 'roominfo' ? 11 : DESIGN_PROGRESS[currentStep];

  const goBack = () => {
    if (!isFirst) {
      goPrev();
      return;
    }
    if (router.canGoBack()) router.back();
    else goExplore(router, 'replace');
  };

  return (
    <View className="h-12 flex-row items-center justify-between bg-white px-4">
      <View className="w-12 items-start">
        <Pressable
          onPress={goBack}
          hitSlop={12}
          accessibilityRole="button"
          accessibilityLabel="이전으로"
          className="h-10 w-10 items-center justify-center rounded-full active:bg-neutral-100"
        >
          <Ionicons name="chevron-back" size={24} color="#6B6B76" />
        </Pressable>
      </View>
      <View className="flex-1 items-center">
        <Text className="text-[18px] font-medium text-[#1E1E24]">{STEP_LABELS[currentStep]}</Text>
      </View>
      <View className="w-12 items-end">
        <Text className="text-base text-[#8B8B9B]">{progress}/15</Text>
      </View>
    </View>
  );
}
