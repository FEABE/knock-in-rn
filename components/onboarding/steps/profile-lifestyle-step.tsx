import { useState } from 'react';
import { ScrollView, Text, View } from 'react-native';

import { saveProfileLifestyle, type ProfileLifestyleRequest } from '@/lib/api';
import { SegmentedControl } from '@/components/ui/headless';
import {
  ONBOARDING_WRITE_ENABLED,
  useOnboarding,
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
  const { goNext, isStepSaved, markStepSaved } = useOnboarding();
  const { profile, patch } = useOnboardingProfile();
  const scales = profile.scales;
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const setScale = (key: LifestyleScaleKey, value: number) =>
    patch({ scales: { ...scales, [key]: value } });

  const allScalesSet = SCALES.every((s) => scales[s.key] !== undefined);
  const canProceed = allScalesSet && !!profile.lifestyle.smoking && !!profile.lifestyle.pet;

  /** "다음" → 생활패턴 저장(POST /users/me/profile/lifestyle) 후 다음 스텝으로. */
  const handleNext = async () => {
    // 외부 UT: 저장 비활성화 — API 없이 다음 스텝으로.
    if (!ONBOARDING_WRITE_ENABLED) {
      goNext();
      return;
    }
    if (submitting) return;
    setSubmitting(true);
    setSubmitError(null);
    try {
      const body: ProfileLifestyleRequest = {
        // ⚠️ 매핑 미확정: 백엔드 lifestyles 원소 형식 확인 필요
        //    (GET /meta/lifestyle-patterns 의 id/detail 과 맞춰야 함).
        //    현재는 "key-값" 문자열로 임시 인코딩.
        lifestyles: [
          ...Object.entries(scales).map(([k, v]) => `${k}-${v}`),
          `smoking-${profile.lifestyle.smoking}`,
          `pet-${profile.lifestyle.pet}`,
        ],
      };

      const signature = JSON.stringify(body);
      if (isStepSaved('profile-lifestyle', signature)) {
        goNext();
        return;
      }

      const res = await saveProfileLifestyle(body);
      if (res.status !== 200 || res.error) {
        setSubmitError(res.error?.message ?? `저장에 실패했어요 (status ${res.status})`);
        return;
      }
      markStepSaved('profile-lifestyle', signature);
      goNext();
    } catch (e) {
      setSubmitError(e instanceof Error ? e.message : '네트워크 오류가 발생했어요.');
    } finally {
      setSubmitting(false);
    }
  };

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

      {submitError ? (
        <View className="px-5 pb-1">
          <Text className="text-sm text-red-500">{submitError}</Text>
        </View>
      ) : null}

      <OnboardingFooter
        canProceed={canProceed}
        primaryLabel="다음"
        showBack
        loading={submitting}
        onPress={handleNext}
      />
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
