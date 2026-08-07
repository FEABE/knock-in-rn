import { Ionicons } from '@expo/vector-icons';
import { Pressable, Text, View } from 'react-native';

import { OnboardingCompleteArtwork } from '@/components/ui/ready-to-dev-assets';
import { useOnboarding } from '@/lib/onboarding';

import { OnboardingFooter } from '../onboarding-footer';

export function OnboardingCompleteStep() {
  const { goNext, goPrev } = useOnboarding();

  return (
    <View className="flex-1 bg-white">
      <View className="h-12 justify-center px-4">
        <Pressable
          onPress={goPrev}
          hitSlop={12}
          accessibilityRole="button"
          accessibilityLabel="이전으로"
          className="h-10 w-10 items-center justify-center rounded-full active:bg-neutral-100"
        >
          <Ionicons name="chevron-back" size={24} color="#6B6B76" />
        </Pressable>
      </View>

      <View className="flex-1 items-center justify-center">
        <Text className="text-center text-2xl font-bold leading-9 text-[#17171B]">
          모든 준비가 끝났어요!
        </Text>
        <Text className="mt-2 text-center text-base text-[#696976]">
          지금부터 나와 맞는 룸메이트를 만나보세요
        </Text>
        <View className="mt-8 items-center">
          <OnboardingCompleteArtwork size={256} />
        </View>
      </View>

      <OnboardingFooter canProceed primaryLabel="시작하기" onPress={goNext} />
    </View>
  );
}
