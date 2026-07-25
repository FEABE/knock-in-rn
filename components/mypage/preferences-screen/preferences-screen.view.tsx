import { Ionicons } from '@expo/vector-icons';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ScaleSlider } from '@/components/onboarding/scale-slider';
import { SegmentedControl } from '@/components/ui/headless';
import { LifestyleIntroArtwork, PriorityArtwork } from '@/components/ui/ready-to-dev-assets';

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
  return <PreferenceForm {...props} />;
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
    <SafeAreaView className="flex-1 bg-neutral-100" edges={['top']}>
      <View className="flex-1 justify-end">
        <View
          className="items-center gap-3 rounded-t-3xl bg-white px-5 pt-6"
          style={{ paddingBottom: bottomPadding }}
        >
          <LifestyleIntroArtwork size={180} />
          <Text className="text-xl font-bold text-neutral-900">매칭 정확도를 높여볼까요?</Text>
          <Text className="text-center text-sm text-neutral-500">
            원하는 룸메이트 조건을 설정하면{'\n'}
            <Text className="font-semibold text-[#256EF4]">궁합 점수가 더 정확</Text>
            해져요
          </Text>
          <View className="my-2 flex-row gap-3">
            <View className="flex-1 items-center gap-1 rounded-xl bg-neutral-50 py-3">
              <Text className="text-xs font-semibold text-[#256EF4]">Step 1</Text>
              <Text className="text-center text-xs text-neutral-500">
                원하는 생활패턴{'\n'}설정
              </Text>
            </View>
            <View className="flex-1 items-center gap-1 rounded-xl bg-neutral-50 py-3">
              <Text className="text-xs font-semibold text-[#256EF4]">Step 2</Text>
              <Text className="text-center text-xs text-neutral-500">
                중요 조건{'\n'}최대 3개 선택
              </Text>
            </View>
          </View>
          <Pressable
            onPress={onStart}
            className="h-12 w-full items-center justify-center rounded-xl bg-[#256EF4] active:opacity-90"
          >
            <Text className="text-base font-semibold text-white">지금 설정할게요</Text>
          </Pressable>
          <Pressable onPress={onSkip} className="py-2">
            <Text className="text-sm text-neutral-500">나중에 할게요</Text>
          </Pressable>
          <Text className="text-xs text-neutral-400">마이페이지에서 언제든 설정할 수 있어요</Text>
        </View>
      </View>
    </SafeAreaView>
  );
}

function PreferenceForm({
  step,
  scales,
  choiceValues,
  scaleOptions,
  choiceGroups,
  priorities,
  selected,
  setScale,
  setChoice,
  goBackStep,
  goPriorityStep,
  togglePriority,
  save,
  formBottomPadding,
}: PreferencesScreenViewProps) {
  return (
    <SafeAreaView className="flex-1 bg-white" edges={['top']}>
      <View className="h-14 flex-row items-center px-4">
        <Pressable onPress={goBackStep} className="h-9 w-9 items-center justify-center">
          <Ionicons name="chevron-back" size={24} color="#404047" />
        </Pressable>
        <Text className="pointer-events-none absolute left-0 right-0 text-center text-base font-medium text-[#242429]">
          {step === 1 ? '선호 조건' : '우선 순위'}
        </Text>
        <View className="ml-auto h-9 w-9" />
      </View>

      {step === 1 ? (
        <>
          <ScrollView className="flex-1" contentContainerClassName="gap-7 p-5 pb-28">
            <View className="gap-1">
              <Text className="text-2xl font-bold text-neutral-900">원하는 룸메이트의</Text>
              <Text className="text-2xl font-bold text-neutral-900">생활패턴은요?</Text>
              <Text className="mt-1 text-sm text-neutral-500">
                상대방에게 원하는 조건을 설정해요
              </Text>
            </View>

            {scaleOptions.map((scale) => {
              const value = scales[scale.key] ?? 3;
              return (
                <ScaleSlider
                  key={scale.key}
                  label={scale.label}
                  valueLabel={scale.levels[value - 1] ?? scale.levels[0] ?? ''}
                  minLabel={scale.minLabel}
                  maxLabel={scale.maxLabel}
                  value={scales[scale.key] ?? null}
                  onChange={(next) => setScale(scale.key, next)}
                />
              );
            })}
            {choiceGroups.map((group) => (
              <Pick
                key={group.key}
                label={group.label}
                options={group.options}
                value={choiceValues[group.key] ?? null}
                onChange={(next) => setChoice(group.key, next)}
              />
            ))}
          </ScrollView>
          <BottomBtn label="다음" onPress={goPriorityStep} bottomPadding={formBottomPadding} />
        </>
      ) : (
        <>
          <ScrollView
            className="flex-1"
            contentContainerClassName="gap-4 px-4 pb-6 pt-3"
            showsVerticalScrollIndicator={false}
          >
            {priorities.map((priority) => {
              const on = selected.includes(priority.id);
              const disabled = !on && selected.length >= 3;
              return (
                <Pressable
                  key={priority.id}
                  disabled={disabled}
                  accessibilityRole="checkbox"
                  accessibilityState={{ checked: on, disabled }}
                  onPress={() => togglePriority(priority.id)}
                  className={`h-[90px] flex-row items-center rounded border px-5 ${
                    on ? 'border-[#2F71F5] bg-[#EDF3FF]' : 'border-transparent bg-[#F7F7FA]'
                  }`}
                >
                  <PriorityArtwork label={priority.name} size={50} />
                  <View className="ml-4 flex-1 gap-1">
                    <Text className="text-[17px] font-semibold leading-6 text-[#242429]">
                      {priority.name}
                    </Text>
                    <Text className="text-[13px] leading-5 text-[#8A8A98]">{priority.desc}</Text>
                  </View>
                  <View
                    className={`h-6 w-6 items-center justify-center rounded-full border ${
                      on ? 'border-[#2F71F5] bg-[#2F71F5]' : 'border-[#AEB0BE] bg-transparent'
                    }`}
                  >
                    {on ? <Ionicons name="checkmark" size={17} color="#FFFFFF" /> : null}
                  </View>
                </Pressable>
              );
            })}
          </ScrollView>
          <BottomBtn label="저장하기" onPress={save} bottomPadding={formBottomPadding} />
        </>
      )}
    </SafeAreaView>
  );
}

function Pick({
  label,
  options,
  value,
  onChange,
}: {
  label: string;
  options: readonly { value: string; label: string }[];
  value: string | null;
  onChange: (value: string) => void;
}) {
  return (
    <View className="gap-2">
      <Text className="text-sm font-semibold text-neutral-800">{label}</Text>
      <SegmentedControl<string>
        options={options as { value: string; label: string }[]}
        value={value}
        onValueChange={onChange}
        className="flex-row gap-2"
        renderItem={({ option, selected }) => (
          <View
            className={`rounded-full border px-5 py-2 ${
              selected ? 'border-[#256EF4] bg-[#256EF4]' : 'border-neutral-300 bg-white'
            }`}
          >
            <Text
              className={selected ? 'text-sm font-medium text-white' : 'text-sm text-neutral-600'}
            >
              {option.label}
            </Text>
          </View>
        )}
      />
    </View>
  );
}

function BottomBtn({
  label,
  onPress,
  bottomPadding,
}: {
  label: string;
  onPress: () => void;
  bottomPadding: number;
}) {
  return (
    <View
      className="absolute inset-x-0 bottom-0 border-t border-neutral-100 bg-white px-5 pt-3"
      style={{ paddingBottom: bottomPadding }}
    >
      <Pressable
        onPress={onPress}
        className="h-12 items-center justify-center rounded-xl bg-[#256EF4] active:opacity-90"
      >
        <Text className="text-base font-semibold text-white">{label}</Text>
      </Pressable>
    </View>
  );
}
