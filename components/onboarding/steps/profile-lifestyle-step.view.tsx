import { Ionicons } from '@expo/vector-icons';
import { useMemo, useState } from 'react';
import { ActivityIndicator, Pressable, Text, View } from 'react-native';

import { LifestyleIntroArtwork } from '@/components/ui/ready-to-dev-assets';
import { ReadyErrorState } from '@/components/ui/ready-to-dev-feedback';
import type { LifestyleScaleKey } from '@/lib/onboarding';

import { OnboardingFooter } from '../onboarding-footer';
import type { UseProfileLifestyleStepReturn } from './use-profile-lifestyle-step';

export type ProfileLifestyleStepViewProps = UseProfileLifestyleStepReturn;

type LifestyleQuestion =
  | {
      kind: 'scale';
      key: LifestyleScaleKey;
      label: string;
      levels: string[];
    }
  | {
      kind: 'choice';
      key: string;
      label: string;
      options: { value: string; label: string }[];
    };

export function ProfileLifestyleStepView({
  scales,
  choiceValues,
  scaleOptions,
  choiceGroups,
  submitting,
  submitError,
  reload,
  setScale,
  setChoice,
  onScaleComplete,
  onBack,
  onNext,
}: ProfileLifestyleStepViewProps) {
  const questions = useMemo<LifestyleQuestion[]>(
    () =>
      [
        ...scaleOptions.map((option) => ({
          kind: 'scale' as const,
          key: option.key,
          label: option.label,
          levels: [...option.levels],
        })),
        ...choiceGroups.map((group) => ({
          kind: 'choice' as const,
          key: group.key,
          label: group.label,
          options: [...group.options],
        })),
      ].sort((a, b) => questionOrder(a.label) - questionOrder(b.label)),
    [choiceGroups, scaleOptions],
  );
  const [questionIndex, setQuestionIndex] = useState(-1);

  const goBack = () => {
    if (questionIndex < 0) {
      onBack();
      return;
    }
    setQuestionIndex((current) => current - 1);
  };

  if (questionIndex < 0) {
    return (
      <View className="flex-1 bg-white">
        <LifestyleHeader onBack={goBack} />
        <View className="flex-1 px-4 pt-6">
          <View className="gap-2">
            <Text className="text-xl font-bold leading-[30px] text-[#17171B]">
              나와 잘 맞는{'\n'}룸메이트를 찾아드릴게요
            </Text>
            <Text className="text-sm leading-5 text-[#696976]">
              약 1분이면 나와 잘 맞는 룸메이트를 추천받을 수 있어요
            </Text>
          </View>
          {submitError ? (
            <ReadyErrorState
              compact
              title="생활패턴 항목을 불러오지 못했어요"
              description={submitError}
              onRetry={reload}
              className="flex-1 pb-8"
            />
          ) : (
            <View className="flex-1 items-center justify-center pb-8">
              <LifestyleIntroArtwork size={238} />
            </View>
          )}
        </View>
        <OnboardingFooter
          canProceed={!submitting && !submitError && questions.length > 0}
          primaryLabel="시작하기"
          loading={submitting}
          onPress={() => setQuestionIndex(0)}
        />
      </View>
    );
  }

  const question = questions[questionIndex];
  if (!question) {
    return (
      <View className="flex-1 bg-white">
        <LifestyleHeader progress={Math.min(questionIndex + 1, 8)} onBack={goBack} />
        <View className="flex-1 items-center justify-center gap-3 px-6">
          {submitting ? <ActivityIndicator color="#256EF4" /> : null}
          <Text
            className={submitError ? 'text-center text-sm text-red-500' : 'text-sm text-[#696976]'}
          >
            {submitError ?? '생활패턴 항목을 불러오는 중이에요'}
          </Text>
          {submitError ? (
            <Pressable onPress={reload} className="rounded-lg bg-[#ECF2FE] px-4 py-2">
              <Text className="text-sm font-medium text-[#256EF4]">다시 시도</Text>
            </Pressable>
          ) : null}
        </View>
      </View>
    );
  }

  const selectedValue =
    question.kind === 'scale' ? scales[question.key] : choiceValues[question.key];
  const options =
    question.kind === 'scale'
      ? question.levels.map((label, index) => ({ value: index + 1, label }))
      : question.options;
  const advance = () => {
    if (questionIndex >= questions.length - 1) {
      void onNext();
      return;
    }
    setQuestionIndex((current) => current + 1);
  };

  return (
    <View className="flex-1 bg-white">
      <LifestyleHeader progress={Math.min(questionIndex + 1, 8)} onBack={goBack} />
      <View className="flex-1 px-4 pt-6">
        <View className="gap-2">
          <Text className="text-xl font-bold leading-[30px] text-[#17171B]">
            {questionTitle(question.label)}
          </Text>
          <Text className="text-sm leading-5 text-[#696976]">
            가장 가까운 것 한 개를 선택해주세요
          </Text>
        </View>

        <View className="mt-6 gap-4">
          {options.map((option) => {
            const selected = selectedValue === option.value;
            return (
              <Pressable
                key={String(option.value)}
                accessibilityRole="radio"
                accessibilityState={{ selected }}
                onPress={() => {
                  if (question.kind === 'scale') {
                    const value = Number(option.value);
                    setScale(question.key, value);
                    onScaleComplete(question.key, value);
                  } else {
                    setChoice(question.key, String(option.value));
                  }
                  advance();
                }}
                className={`h-[50px] justify-center rounded-lg border px-5 ${
                  selected
                    ? 'border-[#256EF4] bg-[#EEF4FF]'
                    : 'border-transparent bg-[#F6F6FA] active:opacity-80'
                }`}
              >
                <Text
                  className={
                    selected
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
    </View>
  );
}

function LifestyleHeader({ progress, onBack }: { progress?: number; onBack: () => void }) {
  return (
    <View className="h-12 flex-row items-center justify-between px-4">
      <Pressable
        onPress={onBack}
        hitSlop={12}
        accessibilityRole="button"
        accessibilityLabel="이전으로"
        className="h-10 w-10 items-center justify-center rounded-full active:bg-neutral-100"
      >
        <Ionicons name="chevron-back" size={24} color="#6B6B76" />
      </Pressable>
      <Text className="text-[18px] font-medium text-[#1E1E24]">생활패턴</Text>
      <Text className="w-10 text-right text-base text-[#8B8B9B]">
        {progress ? `${progress}/15` : ''}
      </Text>
    </View>
  );
}

function questionOrder(label: string): number {
  const normalized = label.replace(/\s/g, '').toLowerCase();
  if (normalized.includes('취침') || normalized.includes('수면')) return 0;
  if (normalized.includes('방문') || normalized.includes('손님')) return 1;
  if (normalized.includes('흡연')) return 2;
  if (normalized.includes('반려') || normalized.includes('애완')) return 3;
  if (normalized.includes('청결') || normalized.includes('청소')) return 4;
  if (normalized.includes('소음') || normalized.includes('방음')) return 5;
  if (normalized.includes('개인공간') || normalized.includes('프라이버시')) return 6;
  if (normalized.includes('성격') || normalized.includes('성향') || normalized.includes('mbti')) {
    return 7;
  }
  return 100;
}

function questionTitle(label: string): string {
  const normalized = label.replace(/\s/g, '').toLowerCase();
  if (normalized.includes('취침') || normalized.includes('수면')) {
    return '평소 취침 시간은\n어떤 편인가요?';
  }
  if (normalized.includes('방문') || normalized.includes('손님')) {
    return '주로 얼마나 자주\n방문객이 오시나요?';
  }
  if (normalized.includes('흡연')) return '흡연을\n하시나요?';
  if (normalized.includes('반려') || normalized.includes('애완')) {
    return '반려동물을\n키우고 있나요?';
  }
  if (normalized.includes('청결') || normalized.includes('청소')) {
    return '청결에 얼마나\n민감한 편인가요?';
  }
  if (normalized.includes('소음') || normalized.includes('방음')) {
    return '소음에 얼마나\n민감한 편인가요?';
  }
  if (normalized.includes('개인공간') || normalized.includes('프라이버시')) {
    return '개인 공간이 얼마나\n중요한가요?';
  }
  if (normalized.includes('성격') || normalized.includes('성향') || normalized.includes('mbti')) {
    return '나의 성격은 어떤 편인가요?';
  }
  return `${label}은\n어떤 편인가요?`;
}
