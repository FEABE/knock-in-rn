import { View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { OnboardingHeader } from '@/components/onboarding/onboarding-header';
import { PreferencesStep } from '@/components/onboarding/steps/preferences-step';
import { ProfileBasicStep } from '@/components/onboarding/steps/profile-basic-step';
import { ProfileLifestyleStep } from '@/components/onboarding/steps/profile-lifestyle-step';
import { TermsStep } from '@/components/onboarding/steps/terms-step';
import { VisibilityStep } from '@/components/onboarding/steps/visibility-step';
import { useOnboarding } from '@/lib/onboarding';

export default function OnboardingScreen() {
  const { currentStep } = useOnboarding();

  return (
    <SafeAreaView className="flex-1 bg-white" edges={['top']}>
      <OnboardingHeader />
      <View className="flex-1">
        {currentStep === 'terms' ? <TermsStep /> : null}
        {currentStep === 'profile-basic' ? <ProfileBasicStep /> : null}
        {currentStep === 'profile-lifestyle' ? <ProfileLifestyleStep /> : null}
        {currentStep === 'visibility' ? <VisibilityStep /> : null}
        {currentStep === 'preferences' ? <PreferencesStep /> : null}
      </View>
    </SafeAreaView>
  );
}
