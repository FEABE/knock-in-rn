import { View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { OnboardingHeader } from '@/components/onboarding/onboarding-header';
import { PreferencesStep } from '@/components/onboarding/steps/preferences-step';
import { ProfileBasicStep } from '@/components/onboarding/steps/profile-basic-step';
import { ProfileLifestyleStep } from '@/components/onboarding/steps/profile-lifestyle-step';
import { RoomInfoStep } from '@/components/onboarding/steps/roominfo-step';
import { TermsStep } from '@/components/onboarding/steps/terms-step';
import { VisibilityStep } from '@/components/onboarding/steps/visibility-step';

import type { UseOnboardingScreenReturn } from './use-onboarding-screen';

export type OnboardingScreenViewProps = UseOnboardingScreenReturn;

export function OnboardingScreenView({ currentStep }: OnboardingScreenViewProps) {
  return (
    <SafeAreaView className="flex-1 bg-white" edges={['top']}>
      {currentStep !== 'roominfo' && currentStep !== 'profile-lifestyle' ? (
        <OnboardingHeader />
      ) : null}
      <View className="flex-1">
        {currentStep === 'terms' ? <TermsStep /> : null}
        {currentStep === 'profile-basic' ? <ProfileBasicStep /> : null}
        {currentStep === 'profile-lifestyle' ? <ProfileLifestyleStep /> : null}
        {currentStep === 'roominfo' ? <RoomInfoStep /> : null}
        {currentStep === 'visibility' ? <VisibilityStep /> : null}
        {currentStep === 'preferences' ? <PreferencesStep /> : null}
      </View>
    </SafeAreaView>
  );
}
