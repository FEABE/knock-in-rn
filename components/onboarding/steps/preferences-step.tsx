import { ScrollView, Text, View } from 'react-native';

import { ChipMultiSelect } from '@/components/ui/headless';
import { PriorityArtwork } from '@/components/ui/ready-to-dev-assets';
import { EMBEDDED_PREFERENCE_PRIORITIES } from '@/lib/domain/preference-priorities';
import { useOnboardingProfile } from '@/lib/onboarding';

import { OnboardingFooter } from '../onboarding-footer';

export function PreferencesStep() {
  const { profile, patch: patchProfile } = useOnboardingProfile();

  return (
    <View className="flex-1 bg-white">
      <ScrollView contentContainerClassName="gap-6 px-5 py-6">
        <View className="gap-1">
          <Text className="text-xl font-bold leading-[30px] text-neutral-900">
            룸메이트를 선택할 때{'\n'}가장 중요한 조건은 무엇인가요?
          </Text>
          <Text className="text-sm text-neutral-500">
            가장 중요한 조건을 최대 3개까지 선택해주세요
          </Text>
        </View>

        <ChipMultiSelect<string>
          options={EMBEDDED_PREFERENCE_PRIORITIES.map(({ value, label }) => ({ value, label }))}
          value={profile.importantConditionIds}
          onValueChange={(importantConditionIds) => patchProfile({ importantConditionIds })}
          max={3}
          className="flex-row flex-wrap gap-2"
          renderItem={({ option, selected }) => (
            <View
              className={`h-[42px] flex-row items-center gap-2 rounded-lg border px-3 ${
                selected ? 'border-[#256EF4] bg-[#EEF4FF]' : 'border-[#DADAE8] bg-white'
              }`}
            >
              <PriorityArtwork label={option.label} size={22} />
              <Text
                className={
                  selected
                    ? 'text-base font-medium text-[#256EF4]'
                    : 'text-base font-medium text-[#696976]'
                }
              >
                {option.label}
              </Text>
            </View>
          )}
        />
      </ScrollView>

      <OnboardingFooter canProceed={true} primaryLabel="다음으로" />
    </View>
  );
}
