import { Pressable, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { LifestyleIntroArtwork, PriorityArtwork } from '@/components/ui/ready-to-dev-assets';

import {
  LifestyleQuestionFlow,
  QuestionFlowHeader,
  QuestionFlowTabStrip,
} from '../lifestyle-question-flow';
import type { UsePreferencesScreenReturn } from './use-preferences-screen';

export type PreferencesScreenViewProps = UsePreferencesScreenReturn;

export function PreferencesScreenView(props: PreferencesScreenViewProps) {
  if (props.step === 0) {
    return (
      <PromptStep
        onStart={props.start}
        onSkip={props.skip}
        bottomPadding={props.promptBottomPadding}
      />
    );
  }

  if (props.step === 1) {
    return (
      <SafeAreaView className="flex-1 bg-white" edges={['top', 'bottom']}>
        <LifestyleQuestionFlow
          title="선호 룸메이트 관리"
          questionVariant="preference"
          scales={props.scales}
          choiceValues={props.choiceValues}
          scaleOptions={props.scaleOptions}
          choiceGroups={props.choiceGroups}
          onScaleChange={props.setScale}
          onChoiceChange={props.setChoice}
          onBack={props.goBackStep}
          onSave={props.goPriorityStep}
          trailingTabLabel="우선순위"
          onTrailingTab={props.goPriorityStep}
        />
      </SafeAreaView>
    );
  }

  return <PriorityStep {...props} />;
}

function PromptStep({
  onStart,
  onSkip,
  bottomPadding,
}: {
  onStart: () => void;
  onSkip: () => void;
  bottomPadding: number;
}) {
  return (
    <SafeAreaView className="flex-1 bg-[#F6F6FA]" edges={['top']}>
      <View className="flex-1 justify-end">
        <View
          className="items-center gap-3 rounded-t-[24px] bg-white px-5 pt-6"
          style={{ paddingBottom: bottomPadding }}
        >
          <LifestyleIntroArtwork size={180} />
          <Text className="text-xl font-bold text-[#242429]">매칭 정확도를 높여볼까요?</Text>
          <Text className="text-center text-sm leading-5 text-[#696976]">
            원하는 룸메이트 조건을 설정하면{`\n`}
            <Text className="font-semibold text-[#256EF4]">궁합 점수가 더 정확</Text>해져요
          </Text>
          <View className="my-2 flex-row gap-3">
            <View className="flex-1 items-center gap-1 rounded-xl bg-[#F7F7FA] py-3">
              <Text className="text-xs font-semibold text-[#256EF4]">Step 1</Text>
              <Text className="text-center text-xs leading-[18px] text-[#696976]">
                원하는 생활패턴{`\n`}설정
              </Text>
            </View>
            <View className="flex-1 items-center gap-1 rounded-xl bg-[#F7F7FA] py-3">
              <Text className="text-xs font-semibold text-[#256EF4]">Step 2</Text>
              <Text className="text-center text-xs leading-[18px] text-[#696976]">
                중요 조건{`\n`}최대 3개 선택
              </Text>
            </View>
          </View>
          <Pressable
            onPress={onStart}
            className="h-12 w-full items-center justify-center rounded-lg bg-[#256EF4] active:opacity-90"
          >
            <Text className="text-[15px] font-bold text-white">지금 설정할게요</Text>
          </Pressable>
          <Pressable onPress={onSkip} className="py-2">
            <Text className="text-sm text-[#696976]">나중에 할게요</Text>
          </Pressable>
          <Text className="text-xs text-[#AAAABA]">마이페이지에서 언제든 설정할 수 있어요</Text>
        </View>
      </View>
    </SafeAreaView>
  );
}

function PriorityStep({
  priorities,
  questionLabels,
  selected,
  goBackStep,
  togglePriority,
  save,
  formBottomPadding,
}: PreferencesScreenViewProps) {
  // 탭 스트립도 서버 문항 목록에서 만든다(하드코딩 06~09 제거). 마지막 '우선순위'가 현재 단계.
  const tabs = [...questionLabels, '우선순위'].map((label, index) => ({
    key: `${index}-${label}`,
    label,
  }));
  return (
    <SafeAreaView className="flex-1 bg-white" edges={['top']}>
      <QuestionFlowHeader
        title="선호 룸메이트 관리"
        onBack={goBackStep}
        onSave={() => void save()}
        saveEnabled={selected.length > 0}
      />

      <QuestionFlowTabStrip
        tabs={tabs}
        activeIndex={tabs.length - 1}
        onSelect={(index) => {
          if (index < tabs.length - 1) goBackStep();
        }}
      />

      <ScrollView
        className="flex-1"
        contentContainerClassName="px-4 pt-7"
        contentContainerStyle={{ paddingBottom: formBottomPadding }}
        showsVerticalScrollIndicator={false}
      >
        <Text className="text-xl font-bold leading-[30px] text-[#17171B]">
          룸메이트를 선택할 때{`\n`}가장 중요한 조건은 무엇인가요?
        </Text>
        <Text className="mt-1 text-sm leading-5 text-[#696976]">
          가장 중요한 조건을 최대 3개까지 선택해주세요
        </Text>

        <View className="mt-7 flex-row flex-wrap gap-3">
          {priorities.map((priority) => {
            const on = selected.includes(priority.id);
            const disabled = !on && selected.length >= 3;
            const rank = selected.indexOf(priority.id) + 1;
            return (
              <Pressable
                key={priority.id}
                disabled={disabled}
                accessibilityRole="checkbox"
                accessibilityState={{ checked: on, disabled }}
                onPress={() => togglePriority(priority.id)}
                className={`h-[42px] flex-row items-center justify-center gap-2 rounded-lg border px-3 ${
                  on
                    ? 'border-[#256EF4] bg-[#EEF4FF]'
                    : disabled
                      ? 'border-[#ECECF3] bg-[#F7F7FA] opacity-40'
                      : 'border-[#DADAE8] bg-white'
                }`}
              >
                <PriorityArtwork label={priority.name} image={priority.image} size={22} />
                <Text
                  className={`text-[14px] font-medium ${on ? 'text-[#256EF4]' : 'text-[#696976]'}`}
                >
                  {priority.name}
                </Text>
                {on ? (
                  <View className="h-5 w-5 items-center justify-center rounded-full bg-[#256EF4]">
                    <Text className="text-[11px] font-bold text-white">{rank}</Text>
                  </View>
                ) : null}
              </Pressable>
            );
          })}
        </View>

        {selected.length > 0 ? (
          <View className="mt-8 rounded-xl bg-[#F7F7FA] p-4">
            <Text className="text-xs font-semibold text-[#696976]">선택한 우선 순위</Text>
            {selected.map((id, index) => {
              const priority = priorities.find((item) => item.id === id);
              if (!priority) return null;
              return (
                <View key={id} className="mt-3 flex-row items-center gap-3">
                  <View className="h-6 w-6 items-center justify-center rounded-full bg-[#256EF4]">
                    <Text className="text-xs font-bold text-white">{index + 1}</Text>
                  </View>
                  <PriorityArtwork label={priority.name} image={priority.image} size={25} />
                  <View className="flex-1">
                    <Text className="text-sm font-semibold text-[#242429]">{priority.name}</Text>
                    {priority.desc ? (
                      <Text className="mt-0.5 text-xs text-[#8A8A98]">{priority.desc}</Text>
                    ) : null}
                  </View>
                </View>
              );
            })}
          </View>
        ) : null}
      </ScrollView>
    </SafeAreaView>
  );
}
