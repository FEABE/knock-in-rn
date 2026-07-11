import type { ReactNode } from 'react';
import { ScrollView, Text, View } from 'react-native';

import { SegmentedControl } from '@/components/ui/headless';

import { OnboardingFooter } from '../onboarding-footer';
import { ScaleSlider } from '../scale-slider';
import { type UseProfileLifestyleStepReturn } from './use-profile-lifestyle-step';

export type ProfileLifestyleStepViewProps = UseProfileLifestyleStepReturn;

export function ProfileLifestyleStepView({
  scales,
  choiceValues,
  scaleOptions,
  choiceGroups,
  submitting,
  submitError,
  canProceed,
  setScale,
  setChoice,
  onScaleComplete,
  onNext,
}: ProfileLifestyleStepViewProps) {
  return (
    <View className="flex-1 bg-white">
      <ScrollView className="flex-1" contentContainerClassName="gap-7 px-5 py-6">
        <View className="gap-1">
          <Text className="text-2xl font-bold text-neutral-900">나의 생활 패턴을</Text>
          <Text className="text-2xl font-bold text-neutral-900">알려주세요</Text>
          <Text className="mt-1 text-sm text-neutral-500">궁합 점수 계산에 사용돼요</Text>
        </View>

        <View className="gap-3">
          {scaleOptions.map((s) => {
            const v = scales[s.key] ?? 3;
            return (
              <View key={s.key} className="rounded-2xl bg-neutral-50 p-4">
                <ScaleSlider
                  label={s.label}
                  valueLabel={s.levels[v - 1] ?? s.levels[0] ?? ''}
                  minLabel={s.minLabel}
                  maxLabel={s.maxLabel}
                  value={scales[s.key] ?? null}
                  onChange={(next) => setScale(s.key, next)}
                  onSlidingComplete={(next) => onScaleComplete(s.key, next)}
                />
              </View>
            );
          })}
        </View>

        {choiceGroups.map((group) => (
          <Pill key={group.key} label={group.label}>
            <SegmentedControl<string>
              options={group.options}
              value={choiceValues[group.key] ?? null}
              onValueChange={(value) => setChoice(group.key, value)}
              className="flex-row gap-2"
              renderItem={({ option, selected }) => (
                <Choice label={option.label} selected={selected} />
              )}
            />
          </Pill>
        ))}
      </ScrollView>

      {submitError ? (
        <View className="px-5 pb-1">
          <Text className="text-sm text-red-500">{submitError}</Text>
        </View>
      ) : null}

      <OnboardingFooter
        canProceed={canProceed}
        primaryLabel="다음"
        loading={submitting}
        onPress={onNext}
      />
    </View>
  );
}

function Choice({ label, selected }: { label: string; selected: boolean }) {
  return (
    <View
      className={`rounded-full border px-5 py-2 ${
        selected ? 'border-[#256EF4] bg-[#256EF4]' : 'border-neutral-300 bg-white'
      }`}
    >
      <Text className={selected ? 'text-sm font-medium text-white' : 'text-sm text-neutral-600'}>
        {label}
      </Text>
    </View>
  );
}

function Pill({ label, children }: { label: string; children: ReactNode }) {
  return (
    <View className="gap-3 rounded-2xl bg-neutral-50 p-4">
      <Text className="text-sm font-semibold text-neutral-800">{label}</Text>
      {children}
    </View>
  );
}
