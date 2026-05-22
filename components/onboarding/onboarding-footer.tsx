import { Text, View } from 'react-native';

import { Button } from '@/components/ui/headless';
import { useOnboarding } from '@/lib/onboarding';

export type OnboardingFooterProps = {
  canProceed: boolean;
  primaryLabel?: string;
  onPress?: () => void;
  helper?: string;
};

export function OnboardingFooter({
  canProceed,
  primaryLabel,
  onPress,
  helper,
}: OnboardingFooterProps) {
  const { isLast, goNext } = useOnboarding();
  const handlePress = onPress ?? goNext;
  const label = primaryLabel ?? (isLast ? '완료' : '다음');

  return (
    <View className="gap-2 border-t border-neutral-100 bg-white px-5 pb-6 pt-4">
      {helper ? (
        <Text className="text-xs text-neutral-500">{helper}</Text>
      ) : null}
      <Button
        disabled={!canProceed}
        onPress={handlePress}
        className={`h-12 items-center justify-center rounded-xl ${
          canProceed ? 'bg-blue-600 active:bg-blue-700' : 'bg-neutral-300'
        }`}
      >
        <Text
          className={`text-base font-semibold ${
            canProceed ? 'text-white' : 'text-neutral-500'
          }`}
        >
          {label}
        </Text>
      </Button>
    </View>
  );
}
