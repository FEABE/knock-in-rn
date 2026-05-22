import { ScrollView, Text, TextInput, View } from 'react-native';

import {
  ChipMultiSelect,
  LifestyleSurvey,
  SegmentedControl,
  TextField,
} from '@/components/ui/headless';
import {
  IMPORTANT_CONDITIONS,
  useOnboardingProfile,
  type CleanlinessLevel,
  type NoiseSensitivity,
  type PetPolicy,
  type Smoking,
} from '@/lib/onboarding';

import { OnboardingFooter } from '../onboarding-footer';

const SMOKING_OPTIONS = [
  { value: 'no', label: '비흡연' },
  { value: 'outdoor', label: '실외 흡연' },
  { value: 'yes', label: '흡연' },
] as const;

const PET_OPTIONS = [
  { value: 'no', label: '없음' },
  { value: 'small', label: '소형만' },
  { value: 'any', label: '제한 없음' },
] as const;

const LEVEL_LABELS = ['매우 낮음', '낮음', '보통', '높음', '매우 높음'];

export function ProfileLifestyleStep() {
  const { profile, patch } = useOnboardingProfile();

  return (
    <View className="flex-1 bg-white">
      <ScrollView contentContainerClassName="gap-7 px-5 py-6">
        <View className="gap-1">
          <Text className="text-2xl font-bold text-neutral-900">
            생활 패턴을 알려주세요
          </Text>
          <Text className="text-sm text-neutral-500">
            궁합 점수 산출에 활용됩니다.
          </Text>
        </View>

        <LifestyleSurvey
          value={profile.lifestyle}
          onValueChange={(v) => patch({ lifestyle: v })}
        >
          {({
            value,
            setSleepTime,
            setWakeTime,
            setCleanliness,
            setNoise,
            setSmoking,
            setPet,
            filledCount,
            totalCount,
            isComplete,
          }) => (
            <View className="gap-6">
              <Text className="text-xs text-neutral-400">
                {filledCount} / {totalCount} 문항 완료
                {isComplete ? ' · 모두 입력했어요' : ''}
              </Text>

              <Field label="취침 / 기상 시간">
                <View className="flex-row gap-2">
                  <TextInput
                    value={value.sleepTime ?? ''}
                    onChangeText={setSleepTime}
                    placeholder="취침 (예: 23:30)"
                    className="flex-1 rounded-xl border border-neutral-200 px-4 py-3 text-base"
                  />
                  <TextInput
                    value={value.wakeTime ?? ''}
                    onChangeText={setWakeTime}
                    placeholder="기상 (예: 07:00)"
                    className="flex-1 rounded-xl border border-neutral-200 px-4 py-3 text-base"
                  />
                </View>
              </Field>

              <Field label="청결 민감도">
                <LevelPicker
                  value={value.cleanliness ?? null}
                  onChange={(v) => setCleanliness(v as CleanlinessLevel)}
                />
              </Field>

              <Field label="소음 민감도">
                <LevelPicker
                  value={value.noise ?? null}
                  onChange={(v) => setNoise(v as NoiseSensitivity)}
                />
              </Field>

              <Field label="흡연">
                <SegmentedControl<Smoking>
                  options={
                    SMOKING_OPTIONS as unknown as {
                      value: Smoking;
                      label: string;
                    }[]
                  }
                  value={value.smoking ?? null}
                  onValueChange={setSmoking}
                  className="flex-row gap-2"
                  renderItem={({ option, selected }) => (
                    <View
                      className={`flex-1 items-center rounded-xl border px-4 py-3 ${
                        selected
                          ? 'border-blue-600 bg-blue-50'
                          : 'border-neutral-200 bg-white'
                      }`}
                    >
                      <Text
                        className={
                          selected
                            ? 'text-sm font-medium text-blue-600'
                            : 'text-sm font-medium text-neutral-700'
                        }
                      >
                        {option.label}
                      </Text>
                    </View>
                  )}
                />
              </Field>

              <Field label="반려동물">
                <SegmentedControl<PetPolicy>
                  options={
                    PET_OPTIONS as unknown as {
                      value: PetPolicy;
                      label: string;
                    }[]
                  }
                  value={value.pet ?? null}
                  onValueChange={setPet}
                  className="flex-row gap-2"
                  renderItem={({ option, selected }) => (
                    <View
                      className={`flex-1 items-center rounded-xl border px-4 py-3 ${
                        selected
                          ? 'border-blue-600 bg-blue-50'
                          : 'border-neutral-200 bg-white'
                      }`}
                    >
                      <Text
                        className={
                          selected
                            ? 'text-sm font-medium text-blue-600'
                            : 'text-sm font-medium text-neutral-700'
                        }
                      >
                        {option.label}
                      </Text>
                    </View>
                  )}
                />
              </Field>
            </View>
          )}
        </LifestyleSurvey>

        <View className="gap-2">
          <Text className="text-sm font-semibold text-neutral-800">
            중요 조건 (최대 3개)
          </Text>
          <Text className="text-xs text-neutral-500">
            룸메이트에게 가장 중요한 조건을 선택하세요.
          </Text>
          <ChipMultiSelect
            options={IMPORTANT_CONDITIONS.map((c) => ({
              value: c.id,
              label: c.label,
            }))}
            value={profile.importantConditionIds}
            onValueChange={(v) => patch({ importantConditionIds: v })}
            max={3}
            className="flex-row flex-wrap gap-2"
            renderItem={({ option, selected, disabled }) => (
              <View
                className={`rounded-full border px-4 py-2 ${
                  selected
                    ? 'border-blue-600 bg-blue-600'
                    : disabled
                      ? 'border-neutral-100 bg-neutral-50'
                      : 'border-neutral-200 bg-white'
                }`}
              >
                <Text
                  className={`text-sm ${
                    selected
                      ? 'font-medium text-white'
                      : disabled
                        ? 'text-neutral-300'
                        : 'text-neutral-700'
                  }`}
                >
                  {option.label}
                </Text>
              </View>
            )}
          />
        </View>

        <Field
          label="딜브레이커"
          helper="절대 함께 살 수 없는 조건이 있다면 적어주세요."
        >
          <TextField
            value={profile.dealbreaker}
            onChangeValue={(v) => patch({ dealbreaker: v })}
            placeholder="예: 잦은 방문객, 야간 통화 등"
            multiline
            numberOfLines={3}
            className="min-h-[80px] rounded-xl border border-neutral-200 px-4 py-3 text-base"
          />
        </Field>
      </ScrollView>

      <OnboardingFooter
        canProceed={
          !!profile.lifestyle.sleepTime &&
          !!profile.lifestyle.wakeTime &&
          profile.lifestyle.cleanliness !== undefined &&
          profile.lifestyle.noise !== undefined &&
          !!profile.lifestyle.smoking &&
          !!profile.lifestyle.pet &&
          profile.importantConditionIds.length > 0 &&
          profile.dealbreaker.trim().length > 0
        }
      />
    </View>
  );
}

function LevelPicker({
  value,
  onChange,
}: {
  value: number | null;
  onChange: (level: 1 | 2 | 3 | 4 | 5) => void;
}) {
  return (
    <View className="flex-row gap-2">
      {[1, 2, 3, 4, 5].map((lvl) => {
        const selected = value === lvl;
        return (
          <View
            key={lvl}
            onTouchEnd={() => onChange(lvl as 1 | 2 | 3 | 4 | 5)}
            className={`flex-1 items-center rounded-xl border py-3 ${
              selected
                ? 'border-blue-600 bg-blue-50'
                : 'border-neutral-200 bg-white'
            }`}
          >
            <Text
              className={`text-base font-semibold ${
                selected ? 'text-blue-600' : 'text-neutral-700'
              }`}
            >
              {lvl}
            </Text>
            <Text className="text-[10px] text-neutral-400">
              {LEVEL_LABELS[lvl - 1]}
            </Text>
          </View>
        );
      })}
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
      {helper ? (
        <Text className="text-xs text-neutral-500">{helper}</Text>
      ) : null}
      {children}
    </View>
  );
}
