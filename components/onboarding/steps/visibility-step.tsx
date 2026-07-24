import { Ionicons } from '@expo/vector-icons';
import { ScrollView, Text, View } from 'react-native';

import { SegmentedControl } from '@/components/ui/headless';
import { useOnboarding, useOnboardingProfile, type ProfileVisibility } from '@/lib/onboarding';

import { OnboardingFooter } from '../onboarding-footer';

const VISIBILITY_OPTIONS = [
  {
    value: 'public' as const,
    label: '공개 중',
    description: '추천/피드에 내 룸메이트 매칭 카드가 노출돼요',
  },
  {
    value: 'hidden' as const,
    label: '숨김',
    description: '추천/피드에 노출되지 않아요. 기존 채팅은 유지돼요',
  },
  {
    value: 'matched' as const,
    label: '매칭 완료',
    description: '더 이상 추천받지 않아요. 언제든 다시 찾기 시작할 수 있어요',
  },
];

export function VisibilityStep() {
  const { goNext } = useOnboarding();
  const { profile, patch } = useOnboardingProfile();

  const onNext = async () => {
    goNext();
  };

  return (
    <View className="flex-1 bg-white">
      <ScrollView contentContainerClassName="gap-6 px-5 py-6">
        <View className="gap-1">
          <Text className="text-2xl font-bold text-neutral-900">
            내 프로필 노출 상태를{'\n'}선택하세요
          </Text>
          <Text className="text-sm text-neutral-500">언제든 마이페이지에서 변경할 수 있어요.</Text>
        </View>

        <SegmentedControl<ProfileVisibility>
          options={VISIBILITY_OPTIONS}
          value={profile.visibility}
          onValueChange={(v) => patch({ visibility: v })}
          className="gap-3"
          renderItem={({ option, selected }) => {
            const opt = VISIBILITY_OPTIONS.find((o) => o.value === option.value)!;
            return (
              <View
                className={`gap-1 rounded-2xl border p-4 ${
                  selected ? 'border-[#256EF4] bg-[#256EF4]/10' : 'border-neutral-200 bg-white'
                }`}
              >
                <View className="flex-row items-center justify-between">
                  <Text
                    className={`text-base font-semibold ${
                      selected ? 'text-[#256EF4]' : 'text-neutral-900'
                    }`}
                  >
                    {opt.label}
                  </Text>
                  <View
                    className={`h-5 w-5 items-center justify-center rounded-full border ${
                      selected ? 'border-[#256EF4] bg-[#256EF4]' : 'border-neutral-300 bg-white'
                    }`}
                  >
                    {selected ? <Ionicons name="checkmark" size={13} color="#FFFFFF" /> : null}
                  </View>
                </View>
                <Text
                  className={selected ? 'text-xs text-[#256EF4]/80' : 'text-xs text-neutral-500'}
                >
                  {opt.description}
                </Text>
              </View>
            );
          }}
        />
      </ScrollView>

      <OnboardingFooter canProceed={true} onPress={onNext} />
    </View>
  );
}
