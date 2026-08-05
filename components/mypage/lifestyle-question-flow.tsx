import { Ionicons } from '@expo/vector-icons';
import { useMemo, useState } from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';

import {
  lifestylePatternQuestions,
  type LifestyleChoiceGroup,
  type LifestyleScaleOption,
} from '@/lib/api';

type LifestyleQuestionFlowProps = {
  title: string;
  /**
   * 질문 문구 출처. 내 생활패턴 화면은 lifePatternDescription,
   * 선호 룸메이트 화면은 preferenceDescription을 쓴다(두 값이 다를 수 있다).
   */
  questionVariant: 'lifestyle' | 'preference';
  scales: Record<string, number>;
  choiceValues: Record<string, string>;
  scaleOptions: LifestyleScaleOption[];
  choiceGroups: LifestyleChoiceGroup[];
  onScaleChange: (key: string, value: number) => void;
  onChoiceChange: (key: string, value: string) => void;
  onBack: () => void;
  onSave: () => void;
};

export function LifestyleQuestionFlow({
  title,
  questionVariant,
  scales,
  choiceValues,
  scaleOptions,
  choiceGroups,
  onScaleChange,
  onChoiceChange,
  onBack,
  onSave,
}: LifestyleQuestionFlowProps) {
  const questions = useMemo(
    () => lifestylePatternQuestions({ scaleOptions, choiceGroups }),
    [choiceGroups, scaleOptions],
  );
  const [questionIndex, setQuestionIndex] = useState(0);
  const question = questions[questionIndex];

  return (
    <View className="flex-1 bg-white">
      <View className="h-14 flex-row items-center px-3">
        <Pressable
          onPress={onBack}
          accessibilityRole="button"
          accessibilityLabel="이전으로"
          className="h-10 w-10 items-center justify-center rounded-full active:bg-neutral-100"
        >
          <Ionicons name="chevron-back" size={24} color="#696976" />
        </Pressable>
        <Text className="pointer-events-none absolute left-0 right-0 text-center text-[17px] font-semibold text-[#242429]">
          {title}
        </Text>
        <Pressable onPress={onSave} className="ml-auto px-2 py-2 active:opacity-60">
          <Text className="text-[15px] font-medium text-[#696976]">저장</Text>
        </Pressable>
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        className="max-h-[58px] border-b border-[#ECECF3]"
        contentContainerClassName="px-4"
      >
        {questions.map((item, index) => {
          const selected = index === questionIndex;
          return (
            <Pressable
              key={`${item.kind}-${item.patternId}`}
              onPress={() => setQuestionIndex(index)}
              className={`min-w-[74px] items-center justify-center border-b-2 px-2 ${
                selected ? 'border-[#256EF4]' : 'border-transparent'
              }`}
            >
              <Text
                className={`text-xs font-semibold ${selected ? 'text-[#256EF4]' : 'text-[#AAAABA]'}`}
              >
                {String(index + 1).padStart(2, '0')}
              </Text>
              <Text
                numberOfLines={1}
                className={`mt-0.5 text-[12px] ${selected ? 'text-[#242429]' : 'text-[#AAAABA]'}`}
              >
                {item.label}
              </Text>
            </Pressable>
          );
        })}
      </ScrollView>

      {question ? (
        <ScrollView
          className="flex-1"
          contentContainerClassName="px-4 pb-8 pt-7"
          showsVerticalScrollIndicator={false}
        >
          <Text className="text-xl font-bold leading-[30px] text-[#17171B]">
            {questionVariant === 'preference' ? question.preferenceQuestion : question.question}
          </Text>
          <Text className="mt-1 text-sm leading-5 text-[#696976]">
            가장 가까운 것 한 개를 선택해주세요
          </Text>

          <View className="mt-7 gap-3">
            {(question.kind === 'scale'
              ? question.levels.map((level) => ({ value: level.value, label: level.label }))
              : question.options
            ).map((option) => {
              const selected =
                question.kind === 'scale'
                  ? scales[question.key] === option.value
                  : choiceValues[question.key] === option.value;
              return (
                <Pressable
                  key={String(option.value)}
                  accessibilityRole="radio"
                  accessibilityState={{ selected }}
                  onPress={() => {
                    if (question.kind === 'scale') {
                      onScaleChange(question.key, Number(option.value));
                    } else {
                      onChoiceChange(question.key, String(option.value));
                    }
                  }}
                  className={`h-[52px] justify-center rounded-lg border px-5 ${
                    selected
                      ? 'border-[#256EF4] bg-[#EEF4FF]'
                      : 'border-transparent bg-[#F6F6FA] active:opacity-80'
                  }`}
                >
                  <View className="flex-row items-center justify-between">
                    <Text
                      className={`text-[15px] font-medium ${
                        selected ? 'text-[#256EF4]' : 'text-[#696976]'
                      }`}
                    >
                      {option.label}
                    </Text>
                    {selected ? <Ionicons name="checkmark" size={18} color="#256EF4" /> : null}
                  </View>
                </Pressable>
              );
            })}
          </View>

          <View className="mt-7 flex-row justify-between">
            <Pressable
              disabled={questionIndex === 0}
              onPress={() => setQuestionIndex((current) => Math.max(0, current - 1))}
              className="h-10 flex-row items-center gap-1 px-2 disabled:opacity-30"
            >
              <Ionicons name="chevron-back" size={18} color="#696976" />
              <Text className="text-sm text-[#696976]">이전</Text>
            </Pressable>
            <Pressable
              disabled={questionIndex === questions.length - 1}
              onPress={() =>
                setQuestionIndex((current) => Math.min(questions.length - 1, current + 1))
              }
              className="h-10 flex-row items-center gap-1 px-2 disabled:opacity-30"
            >
              <Text className="text-sm text-[#696976]">다음</Text>
              <Ionicons name="chevron-forward" size={18} color="#696976" />
            </Pressable>
          </View>
        </ScrollView>
      ) : (
        <View className="flex-1 items-center justify-center px-6">
          <Text className="text-center text-sm text-[#696976]">
            생활패턴 항목을 불러오는 중이에요
          </Text>
        </View>
      )}
    </View>
  );
}
