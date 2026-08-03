import { useGlobalSearchParams, useRouter } from 'expo-router';
import { useEffect, useMemo, useRef, useState } from 'react';
import { Keyboard } from 'react-native';

import { AnalyticsEvent, logEvent, onboardingTiming } from '@/lib/analytics';
import { getTerms, useApi } from '@/lib/api';
import { goKakaoLogin } from '@/lib/navigation/routes';
import {
  MARKETING_PUSH_TERM_KEY,
  PROFILE_NAME_MAX_LENGTH,
  isValidProfileEmail,
  isValidProfileName,
  useOnboarding,
  useOnboardingProfile,
  useOnboardingTerms,
  type Gender,
  type Term,
} from '@/lib/onboarding';

export const GENDER_OPTIONS = [
  { value: 'male', label: '남성' },
  { value: 'female', label: '여성' },
] as const;

export type ProfileBasicStage = 'intro' | 'name' | 'birth' | 'gender' | 'email';
export type ProfileBasicDialog = 'cancel' | 'underage' | null;
type ProfileBasicPreview =
  | 'cancel'
  | 'underage'
  | 'terms'
  | 'terms-selected'
  | 'terms-toast'
  | 'name-error'
  | 'birth-future'
  | 'birth-format'
  | 'email-error';

const PROFILE_BASIC_STAGES: ProfileBasicStage[] = ['intro', 'name', 'birth', 'gender', 'email'];
const UNDERAGE_ERROR = '만 14세 미만은 가입할 수 없어요';
const OPTIONAL_NOTIFICATION_TERM: Term = {
  key: MARKETING_PUSH_TERM_KEY,
  label: '정보성 알림 동의',
  required: false,
};
const FALLBACK_REQUIRED_TERMS: Term[] = [
  { key: 'terms-of-service', label: '서비스 이용약관', required: true },
  { key: 'privacy-policy', label: '개인정보 처리방침', required: true },
];

export type UseProfileBasicStepReturn = {
  profile: ReturnType<typeof useOnboardingProfile>['profile'];
  stage: ProfileBasicStage;
  birthText: string;
  fieldError: string | null;
  dialog: ProfileBasicDialog;
  termsOpen: boolean;
  terms: ReturnType<typeof useOnboardingTerms>['terms'];
  termOptions: Term[];
  termsLoading: boolean;
  termsError: string | null;
  termsToastVisible: boolean;
  canAcceptTerms: boolean;
  submitting: boolean;
  submitError: string | null;
  canProceed: boolean;
  onBack: () => void;
  onContinue: () => void;
  onNameChange: (value: string) => void;
  onBirthChange: (text: string) => void;
  onGenderChange: (value: Gender) => void;
  onEmailChange: (value: string) => void;
  onDialogClose: () => void;
  onExit: () => void;
  onTermsOpenChange: (open: boolean) => void;
  onTermsChange: ReturnType<typeof useOnboardingTerms>['setTerms'];
  onTermsContinue: () => void;
};

export function useProfileBasicStep(): UseProfileBasicStepReturn {
  const router = useRouter();
  const { basicStage, basicPreview } = useGlobalSearchParams<{
    basicStage?: string;
    basicPreview?: string;
  }>();
  const { goNext } = useOnboarding();
  const { profile, patch } = useOnboardingProfile();
  const { terms, setTerms } = useOnboardingTerms();
  const termsQuery = useApi(['meta', 'terms'], () => getTerms(), { retry: false });
  const termOptions = useMemo<Term[]>(() => {
    const requiredTerms = (termsQuery.data?.terms ?? []).flatMap((term) =>
      term.id === undefined || !term.title
        ? []
        : [
            {
              key: String(term.id),
              label: normalizeTermLabel(term.title),
              required: true,
            },
          ],
    );

    return [
      ...(requiredTerms.length ? requiredTerms : FALLBACK_REQUIRED_TERMS),
      OPTIONAL_NOTIFICATION_TERM,
    ];
  }, [termsQuery.data?.terms]);
  const [stage, setStage] = useState<ProfileBasicStage>(() =>
    __DEV__ && isProfileBasicStage(basicStage) ? basicStage : 'intro',
  );
  const [birthText, setBirthText] = useState(() => formatBirth(profile.birthDate));
  const [fieldError, setFieldError] = useState<string | null>(null);
  const [dialog, setDialog] = useState<ProfileBasicDialog>(null);
  const [termsOpen, setTermsOpen] = useState(false);
  const [termsToastVisible, setTermsToastVisible] = useState(false);
  const termsToastTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    onboardingTiming.enterStep();
    logEvent(AnalyticsEvent.ONBOARDING_STEP_VIEW, { step_index: 1, step_name: 'basic_info' });
  }, []);

  useEffect(() => {
    if (!__DEV__ || !isProfileBasicStage(basicStage)) return;
    setStage(basicStage);
    setFieldError(null);
  }, [basicStage]);

  useEffect(() => {
    if (!__DEV__ || !isProfileBasicPreview(basicPreview)) return;

    const sampleProfile = {
      name: '최동준',
      birthDate: new Date(1993, 3, 17),
      gender: 'male' as const,
      email: 'knockin@example.com',
    };
    patch(sampleProfile);
    setBirthText('1993.04.17');
    setFieldError(null);
    setDialog(null);
    setTermsOpen(false);
    setTermsToastVisible(false);

    if (basicPreview === 'cancel') {
      setStage('name');
      setDialog('cancel');
      return;
    }
    if (basicPreview === 'underage') {
      const underageBirth = new Date(new Date().getFullYear() - 10, 0, 1);
      setStage('birth');
      setBirthText(formatBirth(underageBirth));
      patch({ ...sampleProfile, birthDate: underageBirth });
      setDialog('underage');
      return;
    }
    if (basicPreview === 'name-error') {
      setStage('name');
      patch({ ...sampleProfile, name: 'Choi' });
      setFieldError('한글로 최소 2자~10자까지 입력 가능해요');
      return;
    }
    if (basicPreview === 'birth-future') {
      setStage('birth');
      setBirthText('2099.01.01');
      patch({ ...sampleProfile, birthDate: new Date(2099, 0, 1) });
      setFieldError('미래 날짜는 입력이 불가해요');
      return;
    }
    if (basicPreview === 'birth-format') {
      setStage('birth');
      setBirthText('1993.13.40');
      patch({ ...sampleProfile, birthDate: null });
      setFieldError('YYYY.MM.DD 형식으로 입력해주세요');
      return;
    }
    if (basicPreview === 'email-error') {
      setStage('email');
      patch({ ...sampleProfile, email: 'knockin.example.com' });
      setFieldError('올바르지 않은 이메일 형식이에요');
      return;
    }

    setStage('email');
    setTermsOpen(true);
    setTerms(
      basicPreview === 'terms-selected'
        ? Object.fromEntries(termOptions.map((term) => [term.key, true]))
        : {},
    );
    setTermsToastVisible(basicPreview === 'terms-toast');
  }, [basicPreview, patch, setTerms, termOptions]);

  useEffect(
    () => () => {
      if (termsToastTimer.current) clearTimeout(termsToastTimer.current);
    },
    [],
  );

  const onBirthChange = (text: string) => {
    const formatted = formatBirthInput(text);
    setBirthText(formatted);
    patch({ birthDate: parseBirth(formatted) });
    setFieldError(null);
  };

  const canProceed =
    stage === 'intro'
      ? true
      : stage === 'name'
        ? profile.name.trim().length > 0
        : stage === 'birth'
          ? birthText.replace(/\D/g, '').length === 8
          : stage === 'gender'
            ? profile.gender !== null
            : profile.email.trim().length > 0;
  const requiredTerms = termOptions.filter((term) => term.required);
  const canAcceptTerms =
    requiredTerms.length > 0 && requiredTerms.every((term) => terms[term.key] === true);

  const onContinue = () => {
    const error = validateStage(stage, profile.name, birthText, profile.gender, profile.email);
    if (error) {
      if (error === UNDERAGE_ERROR) {
        setFieldError(null);
        setDialog('underage');
        return;
      }
      setFieldError(error);
      return;
    }

    const stageIndex = PROFILE_BASIC_STAGES.indexOf(stage);
    if (stageIndex < PROFILE_BASIC_STAGES.length - 1) {
      setFieldError(null);
      setStage(PROFILE_BASIC_STAGES[stageIndex + 1]);
      return;
    }

    Keyboard.dismiss();
    setTermsOpen(true);
  };

  const onTermsContinue = () => {
    if (!canAcceptTerms) {
      setTermsToastVisible(true);
      if (termsToastTimer.current) clearTimeout(termsToastTimer.current);
      termsToastTimer.current = setTimeout(() => setTermsToastVisible(false), 1800);
      return;
    }

    setTermsOpen(false);
    logEvent(AnalyticsEvent.ONBOARDING_STEP_NEXT, {
      step_index: 1,
      step_name: 'basic_info',
      time_on_step_ms: onboardingTiming.timeOnStepMs(),
    });
    goNext();
  };

  const onBack = () => {
    if (stage === 'intro') {
      goKakaoLogin(router, 'replace');
      return;
    }
    if (stage === 'name') {
      setDialog('cancel');
      return;
    }

    const stageIndex = PROFILE_BASIC_STAGES.indexOf(stage);
    setFieldError(null);
    setStage(PROFILE_BASIC_STAGES[stageIndex - 1]);
  };

  return {
    profile,
    stage,
    birthText,
    fieldError,
    dialog,
    termsOpen,
    terms,
    termOptions,
    termsLoading: termsQuery.loading,
    termsError: termsQuery.error,
    termsToastVisible,
    canAcceptTerms,
    submitting: false,
    submitError: null,
    canProceed,
    onBack,
    onContinue,
    onNameChange: (value) => {
      patch({ name: value.slice(0, PROFILE_NAME_MAX_LENGTH) });
      setFieldError(null);
    },
    onBirthChange,
    onGenderChange: (value) => {
      patch({ gender: value });
      setFieldError(null);
    },
    onEmailChange: (value) => {
      patch({ email: value });
      setFieldError(null);
    },
    onDialogClose: () => setDialog(null),
    onExit: () => {
      setDialog(null);
      setTermsOpen(false);
      goKakaoLogin(router, 'replace');
    },
    onTermsOpenChange: (open) => {
      setTermsOpen(open);
      if (!open) setTermsToastVisible(false);
    },
    onTermsChange: setTerms,
    onTermsContinue,
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

function validateStage(
  stage: ProfileBasicStage,
  name: string,
  birthText: string,
  gender: Gender | null,
  email: string,
): string | null {
  if (stage === 'name') {
    if (!isValidProfileName(name)) return '한글로 최소 2자~10자까지 입력 가능해요';
  }
  if (stage === 'birth') return validateBirth(birthText);
  if (stage === 'gender' && !gender) return '성별을 선택해주세요.';
  if (stage === 'email' && !isValidProfileEmail(email)) {
    return '올바르지 않은 이메일 형식이에요';
  }
  return null;
}

export function validateBirth(text: string): string | null {
  if (text.replace(/\D/g, '').length < 8) return 'YYYY.MM.DD 형식으로 입력해주세요';
  const birth = parseBirth(text);
  if (!birth) return 'YYYY.MM.DD 형식으로 입력해주세요';

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  if (birth > today) return '미래 날짜는 입력이 불가해요';
  if (getAge(birth, today) < 14) return UNDERAGE_ERROR;
  return null;
}

function isProfileBasicStage(value: string | undefined): value is ProfileBasicStage {
  return PROFILE_BASIC_STAGES.includes(value as ProfileBasicStage);
}

function isProfileBasicPreview(value: string | undefined): value is ProfileBasicPreview {
  return [
    'cancel',
    'underage',
    'terms',
    'terms-selected',
    'terms-toast',
    'name-error',
    'birth-future',
    'birth-format',
    'email-error',
  ].includes(value as ProfileBasicPreview);
}

function normalizeTermLabel(value: string): string {
  if (value.includes('개인정보')) return '개인정보 처리방침';
  if (value.includes('서비스') || value.includes('이용약관')) return '서비스 이용약관';
  return value;
}

function getAge(birth: Date, today: Date): number {
  let age = today.getFullYear() - birth.getFullYear();
  const monthDiff = today.getMonth() - birth.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) age -= 1;
  return age;
}
