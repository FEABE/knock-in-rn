import { ScrollView, Text, View } from 'react-native';

import { SegmentedControl } from '@/components/ui/headless';
import {
  useOnboardingProfile,
  type LifestyleScaleKey,
  type PetPolicy,
  type Smoking,
} from '@/lib/onboarding';

import { OnboardingFooter } from '../onboarding-footer';
import { ScaleSlider } from '../scale-slider';

type ScaleConfig = {
  key: LifestyleScaleKey;
  label: string;
  minLabel: string;
  maxLabel: string;
  /** 1~5 각 단계의 값 라벨 */
  levels: [string, string, string, string, string];
};

const SCALES: ScaleConfig[] = [
  {
    key: 'sleep',
    label: '취침 시간',
    minLabel: '일찍 자요',
    maxLabel: '늦게 자요',
    levels: ['일찍(저녁)', '조금 일찍', '보통(자정)', '조금 늦게', '늦게(새벽)'],
  },
  {
    key: 'cleanliness',
    label: '청결 민감도',
    minLabel: '신경 안 써요',
    maxLabel: '매우 청결해요',
    levels: ['신경 안 써요', '조금', '보통', '깔끔해요', '매우 청결해요'],
  },
  {
    key: 'noise',
    label: '소음 민감도',
    minLabel: '둔감해요',
    maxLabel: '매우 민감해요',
    levels: ['둔감해요', '조금 둔감', '보통', '조금 민감', '매우 민감해요'],
  },
  {
    key: 'personality',
    label: '성격 스타일',
    minLabel: '내향적이에요',
    maxLabel: '외향적이에요',
    levels: ['내향적', '조금 내향', '중간', '조금 외향', '외향적'],
  },
  {
    key: 'privacy',
    label: '개인 공간 중요도',
    minLabel: '상관 없어요',
    maxLabel: '매우 중요해요',
    levels: ['상관 없어요', '조금', '보통', '중요해요', '매우 중요해요'],
  },
  {
    key: 'visitor',
    label: '방문객 빈도',
    minLabel: '거의 없어요',
    maxLabel: '자주 있어요',
    levels: ['거의 없어요', '드물게', '가끔', '종종', '자주 있어요'],
  },
];

const SMOKING_OPTIONS = [
  { value: 'no', label: '비흡연' },
  { value: 'yes', label: '흡연' },
] as const;

const PET_OPTIONS = [
  { value: 'no', label: '없음' },
  { value: 'any', label: '있음' },
] as const;

export function ProfileLifestyleStep() {
  const { profile, patch } = useOnboardingProfile();
  const scales = profile.scales;

  const setScale = (key: LifestyleScaleKey, value: number) =>
    patch({ scales: { ...scales, [key]: value } });

  const allScalesSet = SCALES.every((s) => scales[s.key] !== undefined);
  const canProceed = allScalesSet && !!profile.lifestyle.smoking && !!profile.lifestyle.pet;

  return (
    <View className="flex-1 bg-white">
      <ScrollView className="flex-1" contentContainerClassName="gap-7 px-5 py-6">
        <View className="gap-1">
          <Text className="text-2xl font-bold text-neutral-900">나의 생활 패턴을</Text>
          <Text className="text-2xl font-bold text-neutral-900">알려주세요</Text>
          <Text className="mt-1 text-sm text-neutral-500">궁합 점수 계산에 사용돼요</Text>
        </View>

        <View className="gap-3">
          {SCALES.map((s) => {
            const v = scales[s.key] ?? 3;
            return (
              <View key={s.key} className="rounded-2xl bg-neutral-50 p-4">
                <ScaleSlider
                  label={s.label}
                  valueLabel={s.levels[v - 1]}
                  minLabel={s.minLabel}
                  maxLabel={s.maxLabel}
                  value={scales[s.key] ?? null}
                  onChange={(next) => setScale(s.key, next)}
                />
              </View>
            );
          })}
        </View>

        <Pill label="흡연">
          <SegmentedControl<Smoking>
            options={SMOKING_OPTIONS as unknown as { value: Smoking; label: string }[]}
            value={profile.lifestyle.smoking ?? null}
            onValueChange={(v) => patch({ lifestyle: { ...profile.lifestyle, smoking: v } })}
            className="flex-row gap-2"
            renderItem={({ option, selected }) => (
              <Choice label={option.label} selected={selected} />
            )}
          />
        </Pill>

        <Pill label="반려동물">
          <SegmentedControl<PetPolicy>
            options={PET_OPTIONS as unknown as { value: PetPolicy; label: string }[]}
            value={profile.lifestyle.pet ?? null}
            onValueChange={(v) => patch({ lifestyle: { ...profile.lifestyle, pet: v } })}
            className="flex-row gap-2"
            renderItem={({ option, selected }) => (
              <Choice label={option.label} selected={selected} />
            )}
          />
        </Pill>
      </ScrollView>

      <OnboardingFooter canProceed={canProceed} primaryLabel="다음" showBack />
    </View>
  );
}

function Choice({ label, selected }: { label: string; selected: boolean }) {
  return (
    <View
      className={`rounded-full border px-5 py-2 ${
        selected ? 'border-violet-600 bg-violet-600' : 'border-neutral-300 bg-white'
      }`}
    >
      <Text className={selected ? 'text-sm font-medium text-white' : 'text-sm text-neutral-600'}>
        {label}
      </Text>
    </View>
  );
}

function Pill({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <View className="gap-3 rounded-2xl bg-neutral-50 p-4">
      <Text className="text-sm font-semibold text-neutral-800">{label}</Text>
      {children}
    </View>
  );
}
