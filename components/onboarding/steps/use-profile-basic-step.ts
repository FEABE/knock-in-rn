import { useEffect, useState } from 'react';

import { AnalyticsEvent, logEvent, onboardingTiming } from '@/lib/analytics';
import {
  PROFILE_NAME_MAX_LENGTH,
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
  const { goNext } = useOnboarding();
  const { profile, patch } = useOnboardingProfile();
  const [birthText, setBirthText] = useState(() => formatBirth(profile.birthDate));

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
    profile.name.trim().length <= PROFILE_NAME_MAX_LENGTH &&
    profile.gender !== null &&
    profile.birthDate !== null &&
    EMAIL_RE.test(profile.email);

  const onNext = async () => {
    proceed();
  };

  return {
    profile,
    birthText,
    submitting: false,
    submitError: null,
    canProceed,
    onNameChange: (value) => patch({ name: value.slice(0, PROFILE_NAME_MAX_LENGTH) }),
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

function formatBirthInput(text: string): string {
  const digits = text.replace(/\D/g, '').slice(0, 8);
  let out = digits.slice(0, 4);
  if (digits.length > 4) out += '.' + digits.slice(4, 6);
  if (digits.length > 6) out += '.' + digits.slice(6, 8);
  return out;
}
