import { ScrollView, Text, View } from 'react-native';

import { BirthDateField, ChipMultiSelect, RangeSlider } from '@/components/ui/headless';
import {
  BUDGET_BOUNDS,
  ROOM_TYPES,
  useOnboardingPreferences,
  type RoomType,
} from '@/lib/onboarding';

import { OnboardingFooter } from '../onboarding-footer';

export function PreferencesStep() {
  const { preferences, patch } = useOnboardingPreferences();

  return (
    <View className="flex-1 bg-white">
      <ScrollView contentContainerClassName="gap-7 px-5 py-6">
        <View className="gap-1">
          <Text className="text-2xl font-bold text-neutral-900">
            매칭 정확도를{'\n'}높여볼까요?
          </Text>
          <Text className="text-sm text-neutral-500">
            선택 조건은 모두 선택이에요. 나중에 마이페이지에서 설정할 수도 있어요.
          </Text>
        </View>

        <Field
          label="예산 범위"
          helper={
            preferences.budget
              ? `${preferences.budget.min}만원 ~ ${preferences.budget.max}만원`
              : '월세 기준 (만원)'
          }
        >
          <RangeSlider
            min={BUDGET_BOUNDS.min}
            max={BUDGET_BOUNDS.max}
            step={BUDGET_BOUNDS.step}
            value={preferences.budget ? [preferences.budget.min, preferences.budget.max] : [30, 80]}
            onValueChange={([min, max]) => patch({ budget: { min, max } })}
          >
            {({ percents, value, min, max }) => (
              <View className="gap-3">
                <View className="relative h-2 w-full rounded-full bg-neutral-200">
                  <View
                    style={{
                      left: `${percents[0]}%`,
                      width: `${percents[1] - percents[0]}%`,
                    }}
                    className="absolute h-2 rounded-full bg-violet-600"
                  />
                </View>
                <View className="flex-row justify-between">
                  <Text className="text-xs text-neutral-500">{min}만원</Text>
                  <Text className="text-xs text-neutral-900">
                    {value[0]}만원 ~ {value[1]}만원
                  </Text>
                  <Text className="text-xs text-neutral-500">{max}만원</Text>
                </View>
              </View>
            )}
          </RangeSlider>
        </Field>

        <Field label="입주 희망 시기">
          <BirthDateField
            value={preferences.moveInBy}
            onValueChange={(v) => patch({ moveInBy: v })}
            minYear={new Date().getFullYear()}
            maxYear={new Date().getFullYear() + 2}
          >
            {({ yearField, monthField, dayField, isComplete, isValid }) => (
              <View className="gap-1">
                <View className="flex-row gap-2">
                  <View className="flex-[2] rounded-xl border border-neutral-200 px-4 py-3">
                    <Text className="text-base">{yearField.value || yearField.placeholder}</Text>
                  </View>
                  <View className="flex-1 rounded-xl border border-neutral-200 px-4 py-3">
                    <Text className="text-base">{monthField.value || monthField.placeholder}</Text>
                  </View>
                  <View className="flex-1 rounded-xl border border-neutral-200 px-4 py-3">
                    <Text className="text-base">{dayField.value || dayField.placeholder}</Text>
                  </View>
                </View>
                <Text className="text-xs text-neutral-400">
                  날짜 입력 UI는 화면에 맞게 자유롭게 채워주세요.
                </Text>
                {isComplete && !isValid ? (
                  <Text className="text-xs text-red-500">올바른 날짜를 입력해주세요</Text>
                ) : null}
              </View>
            )}
          </BirthDateField>
        </Field>

        <Field label="원하는 방 형태 (복수 선택)">
          <ChipMultiSelect<RoomType>
            options={ROOM_TYPES.map((r) => ({
              value: r.value,
              label: r.label,
            }))}
            value={preferences.roomTypes}
            onValueChange={(v) => patch({ roomTypes: v })}
            className="flex-row flex-wrap gap-2"
            renderItem={({ option, selected }) => (
              <View
                className={`rounded-full border px-4 py-2 ${
                  selected ? 'border-violet-600 bg-violet-600' : 'border-neutral-200 bg-white'
                }`}
              >
                <Text
                  className={
                    selected ? 'text-sm font-medium text-white' : 'text-sm text-neutral-700'
                  }
                >
                  {option.label}
                </Text>
              </View>
            )}
          />
        </Field>
      </ScrollView>

      <OnboardingFooter canProceed={true} primaryLabel="완료" />
    </View>
  );
}

function Field({
  label,
  helper,
  children,
}: {
  label: string;
  helper?: string;
  children: React.ReactNode;
}) {
  return (
    <View className="gap-2">
      <Text className="text-sm font-semibold text-neutral-800">{label}</Text>
      {helper ? <Text className="text-xs text-neutral-500">{helper}</Text> : null}
      {children}
    </View>
  );
}
