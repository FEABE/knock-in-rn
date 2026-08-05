import { Ionicons } from '@expo/vector-icons';
import { useMemo, useState } from 'react';
import { ActivityIndicator, Pressable, Text, View } from 'react-native';

import { LifestyleIntroArtwork } from '@/components/ui/ready-to-dev-assets';
import { ReadyErrorState } from '@/components/ui/ready-to-dev-feedback';
import { lifestylePatternQuestions } from '@/lib/api';

import { OnboardingFooter } from '../onboarding-footer';
import type { UseProfileLifestyleStepReturn } from './use-profile-lifestyle-step';

export type ProfileLifestyleStepViewProps = UseProfileLifestyleStepReturn;

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
  // 문항 순서·문항명·질문·선택지는 모두 서버 /meta/lifestyle-patterns 응답을 그대로 따른다.
  const questions = useMemo(
    () => lifestylePatternQuestions({ scaleOptions, choiceGroups }),
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
        <LifestyleHeader progress={questionIndex + 1} total={questions.length} onBack={goBack} />
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
      ? question.levels.map((level) => ({ value: level.value, label: level.label }))
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
      <LifestyleHeader progress={questionIndex + 1} total={questions.length} onBack={goBack} />
      <View className="flex-1 px-4 pt-6">
        <View className="gap-2">
          <Text className="text-xl font-bold leading-[30px] text-[#17171B]">
            {question.question}
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

function LifestyleHeader({
  progress,
  total,
  onBack,
}: {
  progress?: number;
  total?: number;
  onBack: () => void;
}) {
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
      <Text className="text-[18px] font-medium text-[#1E1E24]">{categoryLabel(progress)}</Text>
      <Text className="w-10 text-right text-base text-[#8B8B9B]">
        {progress ? (
          <>
            <Text className="text-[#17171B]">{progress}</Text>
            <Text className="text-[#8B8B9B]">/{total ?? progress}</Text>
          </>
        ) : (
          ''
        )}
      </Text>
    </View>
  );
}

/** 헤더 카테고리 라벨: 질문 1~4 생활패턴, 5~7 생활성향, 8 성격. */
function categoryLabel(progress?: number): string {
  if (progress === undefined || progress <= 4) return '생활패턴';
  if (progress <= 7) return '생활성향';
  return '성격';
}
