import { useEffect, useState } from 'react';

import { AnalyticsEvent, logEvent, onboardingTiming } from '@/lib/analytics';
import { saveProfileBasic, type ProfileBasicRequest } from '@/lib/api';
import {
  ONBOARDING_WRITE_ENABLED,
  useOnboarding,
  useOnboardingProfile,
  type Gender,
} from '@/lib/onboarding';

export const GENDER_OPTIONS = [
  { value: 'male', label: '남성' },
  { value: 'female', label: '여성' },
] as const;

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export type UseProfileBasicStepReturn = {
  profile: ReturnType<typeof useOnboardingProfile>['profile'];
  birthText: string;
  submitting: boolean;
  submitError: string | null;
  canProceed: boolean;
  onNameChange: (value: string) => void;
  onBirthChange: (text: string) => void;
  onGenderChange: (value: Gender) => void;
  onEmailChange: (value: string) => void;
  onNext: () => Promise<void>;
};

export function useProfileBasicStep(): UseProfileBasicStepReturn {
  const { goNext, isStepSaved, markStepSaved } = useOnboarding();
  const { profile, patch } = useOnboardingProfile();
  const [birthText, setBirthText] = useState(() => formatBirth(profile.birthDate));
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  useEffect(() => {
    onboardingTiming.enterStep();
    logEvent(AnalyticsEvent.ONBOARDING_STEP_VIEW, { step_index: 1, step_name: 'basic_info' });
  }, []);

  const proceed = () => {
    logEvent(AnalyticsEvent.ONBOARDING_STEP_NEXT, {
      step_index: 1,
      step_name: 'basic_info',
      time_on_step_ms: onboardingTiming.timeOnStepMs(),
    });
    goNext();
  };

  const onBirthChange = (text: string) => {
    const formatted = formatBirthInput(text);
    setBirthText(formatted);
    patch({ birthDate: parseBirth(formatted) });
  };

  const canProceed =
    profile.name.trim().length > 0 &&
    profile.gender !== null &&
    profile.birthDate !== null &&
    EMAIL_RE.test(profile.email);

  const onNext = async () => {
    if (!ONBOARDING_WRITE_ENABLED) {
      proceed();
      return;
    }
    if (submitting) return;
    setSubmitting(true);
    setSubmitError(null);
    try {
      const body: ProfileBasicRequest = {
        name: profile.name.trim(),
        birth: toBirthApi(profile.birthDate),
        gender: profile.gender === 'female' ? 'FEMALE' : 'MALE',
        email: profile.email.trim(),
        terms: [],
      };

      const signature = JSON.stringify(body);
      if (isStepSaved('profile-basic', signature)) {
        proceed();
        return;
      }

      const res = await saveProfileBasic(body);
      if (res.status !== 200 || res.error) {
        setSubmitError(res.error?.message ?? `저장에 실패했어요 (status ${res.status})`);
        return;
      }
      markStepSaved('profile-basic', signature);
      proceed();
    } catch (e) {
      setSubmitError(e instanceof Error ? e.message : '네트워크 오류가 발생했어요.');
    } finally {
      setSubmitting(false);
    }
  };

  return {
    profile,
    birthText,
    submitting,
    submitError,
    canProceed,
    onNameChange: (value) => patch({ name: value }),
    onBirthChange,
    onGenderChange: (value) => patch({ gender: value }),
    onEmailChange: (value) => patch({ email: value }),
    onNext,
  };
}

function formatBirth(date: Date | null): string {
  if (!date) return '';
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}.${m}.${d}`;
}

function parseBirth(text: string): Date | null {
  const m = text.match(/^(\d{4})[.\-/](\d{1,2})[.\-/](\d{1,2})$/);
  if (!m) return null;
  const [, y, mo, d] = m;
  const date = new Date(Number(y), Number(mo) - 1, Number(d));
  if (
    date.getFullYear() !== Number(y) ||
    date.getMonth() !== Number(mo) - 1 ||
    date.getDate() !== Number(d)
  ) {
    return null;
  }
  return date;
}

function toBirthApi(date: Date | null): string {
  if (!date) return '';
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

function formatBirthInput(text: string): string {
  const digits = text.replace(/\D/g, '').slice(0, 8);
  let out = digits.slice(0, 4);
  if (digits.length > 4) out += '.' + digits.slice(4, 6);
  if (digits.length > 6) out += '.' + digits.slice(6, 8);
  return out;
}
