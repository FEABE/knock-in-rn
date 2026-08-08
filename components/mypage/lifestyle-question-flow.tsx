import { Ionicons } from '@expo/vector-icons';
import { useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';

import {
  lifestylePatternQuestions,
  type LifestyleChoiceGroup,
  type LifestyleScaleOption,
} from '@/lib/api';

/**
 * 관리(마이페이지) 화면 공통 헤더.
 * 저장 버튼은 시안대로 마지막 단계에서만 파랑(활성)이고 그 전에는 회색(비활성)이다.
 */
export function QuestionFlowHeader({
  title,
  onBack,
  onSave,
  saveEnabled,
}: {
  title: string;
  onBack: () => void;
  onSave: () => void;
  saveEnabled: boolean;
}) {
  return (
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
      <Pressable
        onPress={onSave}
        disabled={!saveEnabled}
        accessibilityRole="button"
        accessibilityLabel="저장"
        accessibilityState={{ disabled: !saveEnabled }}
        className="ml-auto px-2 py-2 active:opacity-60"
      >
        <Text
          className={`text-[15px] ${
            saveEnabled ? 'font-semibold text-[#256EF4]' : 'font-medium text-[#AAAABA]'
          }`}
        >
          저장
        </Text>
      </Pressable>
    </View>
  );
}

export type QuestionFlowTab = {
  key: string;
  label: string;
};

/**
 * 문항 탭 스트립. 시안대로 왼쪽부터 시작하는 가로 스크롤이고,
 * 선택된 탭이 화면 밖이면 자동으로 스크롤해 보여준다.
 */
export function QuestionFlowTabStrip({
  tabs,
  activeIndex,
  onSelect,
}: {
  tabs: QuestionFlowTab[];
  activeIndex: number;
  onSelect?: (index: number) => void;
}) {
  const scrollRef = useRef<ScrollView>(null);
  const offsets = useRef<number[]>([]);

  useEffect(() => {
    const x = offsets.current[activeIndex];
    if (x === undefined) return;
    scrollRef.current?.scrollTo({ x: Math.max(0, x - 16), animated: true });
  }, [activeIndex, tabs.length]);

  return (
    <ScrollView
      ref={scrollRef}
      horizontal
      showsHorizontalScrollIndicator={false}
      className="max-h-[58px] border-b border-[#ECECF3]"
      contentContainerClassName="px-4"
    >
      {tabs.map((tab, index) => {
        const active = index === activeIndex;
        return (
          <Pressable
            key={tab.key}
            disabled={!onSelect}
            onPress={() => onSelect?.(index)}
            onLayout={(event) => {
              offsets.current[index] = event.nativeEvent.layout.x;
              if (index === activeIndex) {
                scrollRef.current?.scrollTo({
                  x: Math.max(0, event.nativeEvent.layout.x - 16),
                  animated: true,
                });
              }
            }}
            accessibilityRole="tab"
            accessibilityState={{ selected: active }}
            className={`h-[58px] justify-center border-b-2 pr-6 ${
              active ? 'border-[#256EF4]' : 'border-transparent'
            }`}
          >
            <Text className={`text-xs ${active ? 'font-bold text-[#17171B]' : 'text-[#AAAABA]'}`}>
              {String(index + 1).padStart(2, '0')}
            </Text>
            <Text
              numberOfLines={1}
              className={`mt-1 text-[13px] ${
                active ? 'font-semibold text-[#17171B]' : 'text-[#AAAABA]'
              }`}
            >
              {tab.label}
            </Text>
          </Pressable>
        );
      })}
    </ScrollView>
  );
}

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
  /** 선호 룸메이트 흐름에서 문항 뒤에 붙는 '우선순위' 탭 라벨. */
  trailingTabLabel?: string;
  /** 위 탭을 눌렀을 때(= 다음 단계로 이동). */
  onTrailingTab?: () => void;
  /** 마지막 탭에서 같은 질문 플로우 안에 렌더링할 내용. */
  trailingContent?: ReactNode;
  trailingSaveEnabled?: boolean;
  displayMode?: 'initial' | 'management';
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
  trailingTabLabel,
  onTrailingTab,
  trailingContent,
  trailingSaveEnabled = false,
  displayMode = 'management',
}: LifestyleQuestionFlowProps) {
  const questions = useMemo(
    () => lifestylePatternQuestions({ scaleOptions, choiceGroups }),
    [choiceGroups, scaleOptions],
  );
  const [questionIndex, setQuestionIndex] = useState(0);
  const trailingActive = Boolean(trailingTabLabel) && questionIndex >= questions.length;
  const safeIndex = Math.min(questionIndex, Math.max(0, questions.length - 1));
  const question = trailingActive ? undefined : questions[safeIndex];
  const tabs = useMemo<QuestionFlowTab[]>(
    () => [
      ...questions.map((item) => ({
        key: `${item.kind}-${item.patternId}`,
        label: item.label,
      })),
      ...(trailingTabLabel ? [{ key: 'trailing', label: trailingTabLabel }] : []),
    ],
    [questions, trailingTabLabel],
  );

  const answered = question
    ? question.kind === 'scale'
      ? scales[question.key] !== undefined
      : Boolean(choiceValues[question.key])
    : false;
  const allAnswered =
    questions.length > 0 &&
    questions.every((item) =>
      item.kind === 'scale' ? scales[item.key] !== undefined : Boolean(choiceValues[item.key]),
    );
  // 최초 진입(initial)은 시안대로 마지막 문항까지 순서대로 답해야 다음 단계로 넘어간다.
  // 관리(management, 수정) 화면은 이미 값이 채워져 있는 상태라, 어느 탭에서든
  // 값을 바꾸면 바로 저장이 열려야 한다 — 마지막 탭까지 다시 넘길 필요가 없다.
  const canSave = trailingActive
    ? trailingSaveEnabled
    : displayMode === 'management'
      ? allAnswered
      : questions.length > 0 && safeIndex === questions.length - 1 && answered;

  const enterTrailingTab = () => {
    if (!trailingTabLabel) return;
    setQuestionIndex(questions.length);
    onTrailingTab?.();
  };

  const selectTab = (index: number) => {
    if (index >= questions.length) {
      enterTrailingTab();
      return;
    }
    setQuestionIndex(index);
  };

  const goBack = () => {
    onBack();
  };

  const saveOrContinue = () => {
    if (!trailingActive && trailingTabLabel) {
      enterTrailingTab();
      return;
    }
    onSave();
  };

  return (
    <View className="flex-1 bg-white">
      {displayMode === 'management' ? (
        <>
          <QuestionFlowHeader
            title={title}
            onBack={goBack}
            onSave={saveOrContinue}
            saveEnabled={canSave}
          />
          <QuestionFlowTabStrip
            tabs={tabs}
            activeIndex={trailingActive ? questions.length : safeIndex}
            onSelect={selectTab}
          />
        </>
      ) : (
        <InitialQuestionHeader
          title={trailingActive ? (trailingTabLabel ?? '') : (question?.label ?? '')}
          progress={(trailingActive ? questions.length : safeIndex) + 1}
          total={tabs.length}
          onBack={goBack}
        />
      )}

      {trailingActive ? (
        <View className="flex-1">
          {trailingContent}
          {displayMode === 'initial' ? (
            <View className="border-t border-[#ECECF3] bg-white px-4 pb-3 pt-4">
              <Pressable
                onPress={onSave}
                disabled={!trailingSaveEnabled}
                accessibilityRole="button"
                accessibilityLabel="완료하기"
                className={`h-12 items-center justify-center rounded-lg ${
                  trailingSaveEnabled ? 'bg-[#256EF4] active:opacity-85' : 'bg-[#ECECF3]'
                }`}
              >
                <Text
                  className={`text-[15px] font-bold ${
                    trailingSaveEnabled ? 'text-white' : 'text-[#AAAABA]'
                  }`}
                >
                  완료하기
                </Text>
              </Pressable>
            </View>
          ) : null}
        </View>
      ) : question ? (
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
                    // 하단 이전/다음 버튼이 없는 시안이라 선택하면 다음 문항으로 넘어간다.
                    if (safeIndex < questions.length - 1) {
                      setQuestionIndex(safeIndex + 1);
                    } else if (trailingTabLabel) {
                      enterTrailingTab();
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

function InitialQuestionHeader({
  title,
  progress,
  total,
  onBack,
}: {
  title: string;
  progress: number;
  total: number;
  onBack: () => void;
}) {
  return (
    <View className="h-14 flex-row items-center px-3">
      <Pressable
        onPress={onBack}
        hitSlop={12}
        accessibilityRole="button"
        accessibilityLabel="이전으로"
        className="h-10 w-10 items-center justify-center rounded-full active:bg-neutral-100"
      >
        <Ionicons name="chevron-back" size={24} color="#696976" />
      </Pressable>
      <Text className="pointer-events-none absolute left-14 right-14 text-center text-[17px] font-medium text-[#242429]">
        {title}
      </Text>
      <Text className="ml-auto px-2 text-[15px] text-[#AAAABA]">
        {progress}/{total}
      </Text>
    </View>
  );
}
