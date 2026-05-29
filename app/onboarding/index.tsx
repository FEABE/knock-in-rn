import { View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { OnboardingHeader } from '@/components/onboarding/onboarding-header';
import { ProfileBasicStep } from '@/components/onboarding/steps/profile-basic-step';
import { ProfileLifestyleStep } from '@/components/onboarding/steps/profile-lifestyle-step';
import { RoomInfoStep } from '@/components/onboarding/steps/roominfo-step';
import { useOnboarding } from '@/lib/onboarding';

export default function OnboardingScreen() {
  const { currentStep } = useOnboarding();

  return (
    <SafeAreaView className="flex-1 bg-white" edges={['top']}>
      <OnboardingHeader />
      <View className="flex-1">
        {currentStep === 'profile-basic' ? <ProfileBasicStep /> : null}
        {currentStep === 'profile-lifestyle' ? <ProfileLifestyleStep /> : null}
        {currentStep === 'roominfo' ? <RoomInfoStep /> : null}
      </View>
    </SafeAreaView>
  );
}
