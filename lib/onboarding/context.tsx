import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from 'react';

import {
  emptyBasicProfile,
  emptyPreferenceConditions,
  emptyRoomCondition,
  isBasicProfileComplete,
  type BasicProfile,
  type OnboardingValues,
  type PreferenceConditions,
  type RoomCondition,
  type TermKey,
  type TermsAgreement,
} from './types';

export type OnboardingStep = 'profile-basic' | 'profile-lifestyle' | 'roominfo';

/**
 * 가입 온보딩 필수 흐름: 기본정보·약관 → 생활패턴 → 방 조건.
 *
 * 선호조건(preferences)은 필수 플로우에서 분리됐다. 방 조건 완료 시점에 온보딩을
 * 완료 처리하고, 선호조건은 탐색 탭의 유도 모달 → 마이페이지 선호 설정 경로로만 입력받는다.
 */
export const ONBOARDING_STEPS: readonly OnboardingStep[] = [
  'profile-basic',
  'profile-lifestyle',
  'roominfo',
];

export const STEP_LABELS: Record<OnboardingStep, string> = {
  'profile-basic': '기본 정보',
  'profile-lifestyle': '생활패턴',
  roominfo: '방 유무 여부',
};

function emptyTerms(): TermsAgreement {
  return {};
}

export type OnboardingContextValue = {
  values: OnboardingValues;
  setTerms: (next: TermsAgreement) => void;
  setProfile: (next: BasicProfile | ((prev: BasicProfile) => BasicProfile)) => void;
  setRoom: (next: RoomCondition | ((prev: RoomCondition) => RoomCondition)) => void;
  setPreferences: (
    next: PreferenceConditions | ((prev: PreferenceConditions) => PreferenceConditions),
  ) => void;
  reset: () => void;

  currentStep: OnboardingStep;
  currentIndex: number;
  goToStep: (step: OnboardingStep) => void;
  goNext: () => void;
  goPrev: () => void;
  isFirst: boolean;
  isLast: boolean;

  isTermsValid: boolean;
  isProfileComplete: boolean;

  /** 해당 스텝이 주어진 데이터 서명으로 이미 저장됐는지. (중복 API 호출 방지) */
  isStepSaved: (step: OnboardingStep, signature: string) => boolean;
  /** 스텝 저장 성공 시 데이터 서명을 기록한다. */
  markStepSaved: (step: OnboardingStep, signature: string) => void;
};

const OnboardingContext = createContext<OnboardingContextValue | null>(null);

export type OnboardingProviderProps = {
  children: ReactNode;
  initialStep?: OnboardingStep;
  initialValues?: Partial<OnboardingValues>;
  onComplete?: (values: OnboardingValues) => void;
};

export function OnboardingProvider({
  children,
  initialStep = 'profile-basic',
  initialValues,
  onComplete,
}: OnboardingProviderProps) {
  const [values, setValues] = useState<OnboardingValues>(() => ({
    terms: initialValues?.terms ?? emptyTerms(),
    profile: initialValues?.profile ?? emptyBasicProfile(),
    room: initialValues?.room ?? emptyRoomCondition(),
    preferences: initialValues?.preferences ?? emptyPreferenceConditions(),
  }));
  const [currentStep, setCurrentStep] = useState<OnboardingStep>(initialStep);
  /** 스텝별 마지막 저장 성공 시점의 데이터 서명. 동일하면 재전송하지 않는다. */
  const [savedSignatures, setSavedSignatures] = useState<Partial<Record<OnboardingStep, string>>>(
    {},
  );

  const isStepSaved = useCallback(
    (step: OnboardingStep, signature: string) => savedSignatures[step] === signature,
    [savedSignatures],
  );

  const markStepSaved = useCallback((step: OnboardingStep, signature: string) => {
    setSavedSignatures((prev) => ({ ...prev, [step]: signature }));
  }, []);

  const setTerms = useCallback((next: TermsAgreement) => {
    setValues((prev) => ({ ...prev, terms: next }));
  }, []);

  const setProfile = useCallback((next: BasicProfile | ((prev: BasicProfile) => BasicProfile)) => {
    setValues((prev) => ({
      ...prev,
      profile:
        typeof next === 'function'
          ? (next as (p: BasicProfile) => BasicProfile)(prev.profile)
          : next,
    }));
  }, []);

  const setRoom = useCallback((next: RoomCondition | ((prev: RoomCondition) => RoomCondition)) => {
    setValues((prev) => ({
      ...prev,
      room:
        typeof next === 'function'
          ? (next as (p: RoomCondition) => RoomCondition)(prev.room)
          : next,
    }));
  }, []);

  const setPreferences = useCallback(
    (next: PreferenceConditions | ((prev: PreferenceConditions) => PreferenceConditions)) => {
      setValues((prev) => ({
        ...prev,
        preferences:
          typeof next === 'function'
            ? (next as (p: PreferenceConditions) => PreferenceConditions)(prev.preferences)
            : next,
      }));
    },
    [],
  );

  const reset = useCallback(() => {
    setValues({
      terms: emptyTerms(),
      profile: emptyBasicProfile(),
      room: emptyRoomCondition(),
      preferences: emptyPreferenceConditions(),
    });
    setCurrentStep('profile-basic');
    setSavedSignatures({});
  }, []);

  const currentIndex = ONBOARDING_STEPS.indexOf(currentStep);

  const goToStep = useCallback((step: OnboardingStep) => {
    setCurrentStep(step);
  }, []);

  const goNext = useCallback(() => {
    setCurrentStep((prev) => {
      const idx = ONBOARDING_STEPS.indexOf(prev);
      if (idx === ONBOARDING_STEPS.length - 1) {
        onComplete?.(values);
        return prev;
      }
      return ONBOARDING_STEPS[idx + 1];
    });
  }, [onComplete, values]);

  const goPrev = useCallback(() => {
    setCurrentStep((prev) => {
      const idx = ONBOARDING_STEPS.indexOf(prev);
      if (idx <= 0) return prev;
      return ONBOARDING_STEPS[idx - 1];
    });
  }, []);

  const termValues = Object.values(values.terms);
  const isTermsValid = termValues.length > 0 && termValues.every(Boolean);
  const isProfileComplete = isBasicProfileComplete(values.profile);

  const ctx = useMemo<OnboardingContextValue>(
    () => ({
      values,
      setTerms,
      setProfile,
      setRoom,
      setPreferences,
      reset,
      currentStep,
      currentIndex,
      goToStep,
      goNext,
      goPrev,
      isFirst: currentIndex === 0,
      isLast: currentIndex === ONBOARDING_STEPS.length - 1,
      isTermsValid,
      isProfileComplete,
      isStepSaved,
      markStepSaved,
    }),
    [
      values,
      setTerms,
      setProfile,
      setRoom,
      setPreferences,
      reset,
      currentStep,
      currentIndex,
      goToStep,
      goNext,
      goPrev,
      isTermsValid,
      isProfileComplete,
      isStepSaved,
      markStepSaved,
    ],
  );

  return <OnboardingContext.Provider value={ctx}>{children}</OnboardingContext.Provider>;
}

export function useOnboarding(): OnboardingContextValue {
  const ctx = useContext(OnboardingContext);
  if (!ctx) {
    throw new Error('useOnboarding must be used inside <OnboardingProvider>');
  }
  return ctx;
}

export function useOnboardingProfile() {
  const { values, setProfile } = useOnboarding();
  const patch = useCallback(
    (next: Partial<BasicProfile>) => {
      setProfile((prev) => ({ ...prev, ...next }));
    },
    [setProfile],
  );
  return { profile: values.profile, setProfile, patch };
}

export function useOnboardingRoom() {
  const { values, setRoom } = useOnboarding();
  const patch = useCallback(
    (next: Partial<RoomCondition>) => {
      setRoom((prev) => ({ ...prev, ...next }));
    },
    [setRoom],
  );
  return { room: values.room, setRoom, patch };
}

export function useOnboardingPreferences() {
  const { values, setPreferences } = useOnboarding();
  const patch = useCallback(
    (next: Partial<PreferenceConditions>) => {
      setPreferences((prev) => ({ ...prev, ...next }));
    },
    [setPreferences],
  );
  return {
    preferences: values.preferences,
    setPreferences,
    patch,
  };
}

export function useOnboardingTerms() {
  const { values, setTerms, isTermsValid } = useOnboarding();
  const patchOne = useCallback(
    (key: TermKey, next: boolean) => {
      setTerms({ ...values.terms, [key]: next });
    },
    [setTerms, values.terms],
  );
  return {
    terms: values.terms,
    setTerms,
    patchOne,
    isTermsValid,
  };
}
