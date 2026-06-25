import { useEffect, useState } from 'react';

import { AnalyticsEvent, logEvent, onboardingTiming } from '@/lib/analytics';
import {
  compactNumbers,
  LIFESTYLE_BACKEND_IDS,
  LIFESTYLE_CHOICE_BACKEND_IDS,
  saveProfileLifestyle,
  type ProfileLifestyleRequest,
} from '@/lib/api';
import {
  ONBOARDING_WRITE_ENABLED,
  useOnboarding,
  useOnboardingProfile,
  type LifestyleScaleKey,
  type PetPolicy,
  type Smoking,
} from '@/lib/onboarding';

export type ScaleConfig = {
  key: LifestyleScaleKey;
  label: string;
  minLabel: string;
  maxLabel: string;
  levels: [string, string, string, string, string];
};

export const SCALES: ScaleConfig[] = [
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

export const SMOKING_OPTIONS = [
  { value: 'no', label: '비흡연' },
  { value: 'yes', label: '흡연' },
] as const;

export const PET_OPTIONS = [
  { value: 'no', label: '없음' },
  { value: 'any', label: '있음' },
] as const;

export type UseProfileLifestyleStepReturn = {
  profile: ReturnType<typeof useOnboardingProfile>['profile'];
  scales: ReturnType<typeof useOnboardingProfile>['profile']['scales'];
  submitting: boolean;
  submitError: string | null;
  canProceed: boolean;
  setScale: (key: LifestyleScaleKey, value: number) => void;
  setSmoking: (value: Smoking) => void;
  setPet: (value: PetPolicy) => void;
  onScaleComplete: (key: LifestyleScaleKey, value: number) => void;
  onNext: () => Promise<void>;
};

export function useProfileLifestyleStep(): UseProfileLifestyleStepReturn {
  const { goNext, isStepSaved, markStepSaved } = useOnboarding();
  const { profile, patch } = useOnboardingProfile();
  const scales = profile.scales;
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  useEffect(() => {
    onboardingTiming.enterStep();
    logEvent(AnalyticsEvent.ONBOARDING_STEP_VIEW, { step_index: 2, step_name: 'lifestyle' });
  }, []);

  const setScale = (key: LifestyleScaleKey, value: number) =>
    patch({ scales: { ...scales, [key]: value } });

  const proceed = () => {
    logEvent(AnalyticsEvent.ONBOARDING_STEP_NEXT, {
      step_index: 2,
      step_name: 'lifestyle',
      time_on_step_ms: onboardingTiming.timeOnStepMs(),
    });
    goNext();
  };

  const allScalesSet = SCALES.every((s) => scales[s.key] !== undefined);
  const canProceed = allScalesSet && !!profile.lifestyle.smoking && !!profile.lifestyle.pet;

  const onNext = async () => {
    if (!ONBOARDING_WRITE_ENABLED) {
      proceed();
      return;
    }
    if (submitting) return;
    setSubmitting(true);
    setSubmitError(null);
    try {
      const body: ProfileLifestyleRequest = {
        lifestyles: compactNumbers([
          ...Object.keys(scales).map(
            (key) => LIFESTYLE_BACKEND_IDS[key as keyof typeof LIFESTYLE_BACKEND_IDS],
          ),
          profile.lifestyle.smoking
            ? LIFESTYLE_CHOICE_BACKEND_IDS.smoking[profile.lifestyle.smoking]
            : undefined,
          profile.lifestyle.pet
            ? LIFESTYLE_CHOICE_BACKEND_IDS.pet[profile.lifestyle.pet]
            : undefined,
        ]),
      };

      const signature = JSON.stringify(body);
      if (isStepSaved('profile-lifestyle', signature)) {
        proceed();
        return;
      }

      const res = await saveProfileLifestyle(body);
      if (res.status !== 200 || res.error) {
        setSubmitError(res.error?.message ?? `저장에 실패했어요 (status ${res.status})`);
        return;
      }
      markStepSaved('profile-lifestyle', signature);
      proceed();
    } catch (e) {
      setSubmitError(e instanceof Error ? e.message : '네트워크 오류가 발생했어요.');
    } finally {
      setSubmitting(false);
    }
  };

  return {
    profile,
    scales,
    submitting,
    submitError,
    canProceed,
    setScale,
    setSmoking: (value) => patch({ lifestyle: { ...profile.lifestyle, smoking: value } }),
    setPet: (value) => patch({ lifestyle: { ...profile.lifestyle, pet: value } }),
    onScaleComplete: (key, value) =>
      logEvent(AnalyticsEvent.ONBOARDING_SLIDER_SET, {
        scale_name: key,
        value,
      }),
    onNext,
  };
}
