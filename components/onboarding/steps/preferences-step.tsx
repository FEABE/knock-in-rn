import { Ionicons } from '@expo/vector-icons';
import { useMemo, useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, Text, View } from 'react-native';

import { ChipMultiSelect } from '@/components/ui/headless';
import { OnboardingCompleteArtwork, PriorityArtwork } from '@/components/ui/ready-to-dev-assets';
import {
  type LifestyleChoiceGroup,
  type LifestylePatternOptionsState,
  type LifestyleScaleOption,
  useLifestylePatternOptions,
} from '@/lib/api';
import { EMBEDDED_PREFERENCE_PRIORITIES } from '@/lib/domain/preference-priorities';
import { useOnboarding, useOnboardingPreferences, useOnboardingProfile } from '@/lib/onboarding';

import { OnboardingFooter } from '../onboarding-footer';

type PreferenceSelection = number | 'any';

type PreferenceQuestion = {
  key: string;
  title: string;
  options: { label: string; value: PreferenceSelection }[];
};

const PREFERENCE_HEADERS = [
  '성별',
  '성격',
  '개인 공간 중요도',
  '방문객 빈도',
  '흡연 여부',
  '반려동물 여부',
  '우선순위 선택',
] as const;

export function PreferencesStep() {
  const { goNext, goPrev } = useOnboarding();
  const { profile, patch: patchProfile } = useOnboardingProfile();
  const { preferences, patch: patchPreferences } = useOnboardingPreferences();
  const lifestyleOptions = useLifestylePatternOptions();
  const questions = useMemo(() => buildPreferenceQuestions(lifestyleOptions), [lifestyleOptions]);
  const [stage, setStage] = useState(0);
  const [complete, setComplete] = useState(false);

  const goBack = () => {
    if (complete) {
      setComplete(false);
      return;
    }
    if (stage === 0) {
      goPrev();
      return;
    }
    setStage((current) => current - 1);
  };

  if (complete) {
    return (
      <View className="flex-1 bg-white">
        <View className="h-12 justify-center px-4">
          <BackButton onPress={goBack} />
        </View>
        <View className="flex-1 items-center px-4 pt-14">
          <Text className="text-center text-2xl font-bold leading-9 text-[#17171B]">
            모든 준비가 끝났어요!
          </Text>
          <Text className="mt-2 text-center text-base text-[#696976]">
            지금부터 나와 맞는 룸메이트를 만나보세요
          </Text>
          <View className="mt-8">
            <OnboardingCompleteArtwork size={256} />
          </View>
        </View>
        <OnboardingFooter canProceed primaryLabel="시작하기" onPress={goNext} />
      </View>
    );
  }

  const selectPreference = (key: string, value: PreferenceSelection) => {
    patchPreferences({
      lifestyleSelections: {
        ...preferences.lifestyleSelections,
        [key]: value,
      },
    });
    setStage((current) => Math.min(current + 1, 6));
  };
  const activeQuestion = stage >= 1 && stage <= 5 ? questions[stage - 1] : null;

  return (
    <View className="flex-1 bg-white">
      <PreferenceHeader stage={stage} onBack={goBack} />

      {stage === 0 ? (
        <PreferenceQuestionView
          title="원하는 룸메이트의 성별을 선택해주세요"
          options={[
            { label: '동성만 원해요', value: 'same' },
            { label: '성별은 상관 없어요', value: 'any' },
          ]}
          selected={profile.preferredGender}
          onSelect={(value) => {
            patchProfile({ preferredGender: value as 'same' | 'any' });
            setStage(1);
          }}
        />
      ) : null}

      {stage >= 1 && stage <= 5 ? (
        lifestyleOptions.loading ? (
          <LoadingState message="선호조건 항목을 불러오는 중이에요" />
        ) : lifestyleOptions.error ? (
          <LoadingState error message={lifestyleOptions.error} />
        ) : activeQuestion ? (
          <PreferenceQuestionView
            title={activeQuestion.title}
            options={activeQuestion.options}
            selected={preferences.lifestyleSelections[activeQuestion.key]}
            onSelect={(value) => selectPreference(activeQuestion.key, value)}
          />
        ) : (
          <LoadingState
            error
            message={`${PREFERENCE_HEADERS[stage]} 기준값을 서버에서 찾지 못했어요.`}
          />
        )
      ) : null}

      {stage === 6 ? (
        <>
          <ScrollView className="flex-1" contentContainerClassName="px-4 pb-8 pt-6">
            <Text className="text-xl font-bold leading-[30px] text-[#17171B]">
              룸메이트를 선택할 때{'\n'}가장 중요한 조건은 무엇인가요?
            </Text>
            <Text className="mt-2 text-sm leading-5 text-[#696976]">
              가장 중요한 조건을 최대 3개까지 선택해주세요
            </Text>

            <ChipMultiSelect<string>
              options={EMBEDDED_PREFERENCE_PRIORITIES.map(({ value, label }) => ({ value, label }))}
              value={profile.importantConditionIds}
              onValueChange={(importantConditionIds) => patchProfile({ importantConditionIds })}
              max={3}
              className="mt-6 flex-row flex-wrap gap-3"
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
          <OnboardingFooter
            canProceed={profile.importantConditionIds.length > 0}
            primaryLabel="완료"
            onPress={() => setComplete(true)}
          />
        </>
      ) : null}
    </View>
  );
}

function PreferenceHeader({ stage, onBack }: { stage: number; onBack: () => void }) {
  return (
    <View className="h-12 flex-row items-center justify-between px-4">
      <BackButton onPress={onBack} />
      <Text className="text-lg font-medium text-[#17171B]">{PREFERENCE_HEADERS[stage]}</Text>
      <Text className="w-10 text-right text-base text-[#AAAABA]">{stage + 1}/7</Text>
    </View>
  );
}

function BackButton({ onPress }: { onPress: () => void }) {
  return (
    <Pressable
      onPress={onPress}
      hitSlop={12}
      accessibilityRole="button"
      accessibilityLabel="이전으로"
      className="h-10 w-10 items-center justify-center rounded-full active:bg-[#F6F6FA]"
    >
      <Ionicons name="chevron-back" size={24} color="#6B6B76" />
    </Pressable>
  );
}

function PreferenceQuestionView<T extends string | number>({
  title,
  options,
  selected,
  onSelect,
}: {
  title: string;
  options: { label: string; value: T }[];
  selected: T | null | undefined;
  onSelect: (value: T) => void;
}) {
  return (
    <View className="flex-1 px-4 pt-6">
      <Text className="text-xl font-bold leading-[30px] text-[#17171B]">{title}</Text>
      <Text className="mt-2 text-sm leading-5 text-[#696976]">
        가장 가까운 것 한 개를 선택해주세요
      </Text>
      <View className="mt-6 gap-4">
        {options.map((option) => {
          const isSelected = selected === option.value;
          return (
            <Pressable
              key={String(option.value)}
              onPress={() => onSelect(option.value)}
              accessibilityRole="radio"
              accessibilityState={{ checked: isSelected }}
              className={`h-[50px] justify-center rounded-lg border px-5 ${
                isSelected
                  ? 'border-[#256EF4] bg-[#EEF4FF]'
                  : 'border-transparent bg-[#F6F6FA] active:opacity-80'
              }`}
            >
              <Text
                className={
                  isSelected
                    ? 'text-base font-medium text-[#256EF4]'
                    : 'text-base font-medium text-[#696976]'
                }
              >
                {option.label}
              </Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

function LoadingState({ message, error = false }: { message: string; error?: boolean }) {
  return (
    <View className="flex-1 items-center justify-center gap-3 px-8">
      {!error ? <ActivityIndicator color="#256EF4" /> : null}
      <Text className={error ? 'text-center text-sm text-[#E5484D]' : 'text-sm text-[#696976]'}>
        {message}
      </Text>
    </View>
  );
}

function buildPreferenceQuestions(
  options: LifestylePatternOptionsState,
): (PreferenceQuestion | null)[] {
  return [
    scaleQuestion(
      findScale(options.scaleOptions, ['성격', '성향', 'mbti']),
      'personality',
      '원하는 룸메이트의 성격을 선택해주세요',
      ['매우 내향적', '내향적', '보통', '외향적', '매우 외향적'],
    ),
    scaleQuestion(
      findScale(options.scaleOptions, ['개인공간', '프라이버시']),
      'personal-space',
      '원하는 룸메이트의 개인 공간 중요도를 선택해주세요',
      ['전혀 중요하지 않음', '중요하지 않음', '보통', '중요함', '매우 중요함'],
    ),
    scaleQuestion(
      findScale(options.scaleOptions, ['방문객', '손님']),
      'visitors',
      '원하는 룸메이트의 방문객 빈도를 선택해주세요',
      ['매우 적음', '적음', '보통', '많음', '매우 많음'],
    ),
    choiceQuestion(
      findChoice(options.choiceGroups, ['흡연']),
      'smoking',
      '원하는 룸메이트의 흡연 여부를 선택해주세요',
      '흡연자도 괜찮아요 (상관없어요)',
      '비흡연자만 원해요',
      ['비흡연', '하지않'],
    ),
    choiceQuestion(
      findChoice(options.choiceGroups, ['반려', '애완']),
      'pet',
      '원하는 룸메이트의 반려동물 여부를 선택해주세요',
      '있어도 괜찮아요 (상관없어요)',
      '없으면 좋겠어요',
      ['없', '키우지않'],
    ),
  ];
}

function scaleQuestion(
  option: LifestyleScaleOption | undefined,
  fallbackKey: string,
  title: string,
  labels: string[],
): PreferenceQuestion | null {
  if (!option) return null;
  return {
    key: option.key || fallbackKey,
    title,
    options: labels.flatMap((label, index) => {
      const backendId = option.backendIdsByValue[index + 1];
      return backendId === undefined ? [] : [{ label, value: backendId }];
    }),
  };
}

function choiceQuestion(
  group: LifestyleChoiceGroup | undefined,
  fallbackKey: string,
  title: string,
  anyLabel: string,
  requiredLabel: string,
  requiredKeywords: string[],
): PreferenceQuestion | null {
  if (!group) return null;
  const required = group.options.find((option) =>
    requiredKeywords.some((keyword) => normalize(option.label).includes(normalize(keyword))),
  );
  if (!required) return null;
  return {
    key: group.key || fallbackKey,
    title,
    options: [
      { label: anyLabel, value: 'any' },
      { label: requiredLabel, value: required.backendId },
    ],
  };
}

function findScale(options: LifestyleScaleOption[], keywords: string[]) {
  return options.find((option) =>
    keywords.some((keyword) => normalize(option.label).includes(normalize(keyword))),
  );
}

function findChoice(options: LifestyleChoiceGroup[], keywords: string[]) {
  return options.find((option) =>
    keywords.some((keyword) => normalize(option.label).includes(normalize(keyword))),
  );
}

function normalize(value: string): string {
  return value.replace(/\s/g, '').toLowerCase();
}
