import { useEffect } from 'react';

import { AnalyticsEvent, logEvent, onboardingTiming } from '@/lib/analytics';
import {
  type LifestyleChoiceGroup,
  type LifestyleScaleOption,
  useLifestylePatternOptions,
} from '@/lib/api';
import {
  useOnboarding,
  useOnboardingProfile,
  type LifestyleScaleKey,
} from '@/lib/onboarding';

export type UseProfileLifestyleStepReturn = {
  scales: ReturnType<typeof useOnboardingProfile>['profile']['scales'];
  choiceValues: Record<string, string>;
  scaleOptions: LifestyleScaleOption[];
  choiceGroups: LifestyleChoiceGroup[];
  submitting: boolean;
  submitError: string | null;
  canProceed: boolean;
  setScale: (key: LifestyleScaleKey, value: number) => void;
  setChoice: (key: string, value: string) => void;
  onScaleComplete: (key: LifestyleScaleKey, value: number) => void;
  onNext: () => Promise<void>;
};

export function useProfileLifestyleStep(): UseProfileLifestyleStepReturn {
  const { goNext } = useOnboarding();
  const { profile, patch } = useOnboardingProfile();
  const lifestyleOptions = useLifestylePatternOptions();
  const scales = profile.scales;
  const choiceValues = profile.lifestyleChoices;

  useEffect(() => {
    onboardingTiming.enterStep();
    logEvent(AnalyticsEvent.ONBOARDING_STEP_VIEW, { step_index: 2, step_name: 'lifestyle' });
  }, []);

  useEffect(() => {
    const nextScales = { ...scales };
    let changed = false;
    for (const scale of lifestyleOptions.scaleOptions) {
      if (nextScales[scale.key] === undefined) {
        nextScales[scale.key] = 3;
        changed = true;
      }
    }
    if (changed) patch({ scales: nextScales });
  }, [lifestyleOptions.scaleOptions, patch, scales]);

  const setScale = (key: LifestyleScaleKey, value: number) =>
    patch({ scales: { ...scales, [key]: value } });

  const setChoice = (key: string, value: string) =>
    patch({ lifestyleChoices: { ...choiceValues, [key]: value } });

  const proceed = () => {
    logEvent(AnalyticsEvent.ONBOARDING_STEP_NEXT, {
      step_index: 2,
      step_name: 'lifestyle',
      time_on_step_ms: onboardingTiming.timeOnStepMs(),
    });
    goNext();
  };

  const allScalesSet = lifestyleOptions.scaleOptions.every((s) => scales[s.key] !== undefined);
  const allChoicesSet = lifestyleOptions.choiceGroups.every((group) => !!choiceValues[group.key]);
  const canProceed =
    !lifestyleOptions.loading &&
    !lifestyleOptions.error &&
    lifestyleOptions.scaleOptions.length + lifestyleOptions.choiceGroups.length > 0 &&
    allScalesSet &&
    allChoicesSet;

  const onNext = async () => {
    proceed();
  };

  return {
    scales,
    choiceValues,
    scaleOptions: lifestyleOptions.scaleOptions,
    choiceGroups: lifestyleOptions.choiceGroups,
    submitting: lifestyleOptions.loading,
    submitError: lifestyleOptions.error,
    canProceed,
    setScale,
    setChoice,
    onScaleComplete: (key, value) =>
      logEvent(AnalyticsEvent.ONBOARDING_SLIDER_SET, {
        scale_name: key,
        value,
      }),
    onNext,
  };
}
