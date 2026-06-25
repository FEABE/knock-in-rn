import { useLocalSearchParams, useRouter } from 'expo-router';
import { Alert } from 'react-native';
import { useEffect, useState } from 'react';

import { AnalyticsEvent, logEvent } from '@/lib/analytics';
import {
  compactNumbers,
  CONDITION_BACKEND_IDS,
  LIFESTYLE_BACKEND_IDS,
  LIFESTYLE_CHOICE_BACKEND_IDS,
  savePreferenceAll,
} from '@/lib/api';
import { ONBOARDING_WRITE_ENABLED } from '@/lib/onboarding';

export const PREFERENCE_PRIORITIES = [
  { id: 'sleep', name: '취침 시간', desc: '비슷한 수면 패턴', icon: '🌙' },
  { id: 'clean', name: '청결', desc: '청결 기준이 비슷한 분', icon: '🧹' },
  { id: 'noise', name: '소음', desc: '소음 민감도가 비슷한 분', icon: '🔇' },
  { id: 'smoking', name: '흡연 여부', desc: '흡연 / 비흡연 여부', icon: '🚬' },
  { id: 'pet', name: '반려동물', desc: '반려동물 유무', icon: '🐾' },
  { id: 'visitor', name: '방문객 빈도', desc: '손님 초청 빈도', icon: '🚪' },
  { id: 'personality', name: '성격 스타일', desc: '내향적 / 외향적', icon: '😊' },
  { id: 'privacy', name: '개인 공간', desc: '개인 공간 중요도', icon: '🏠' },
];

export type PreferencesStep = 0 | 1 | 2;

export type UsePreferencesScreenReturn = {
  step: PreferencesStep;
  gender: string | null;
  personality: number | null;
  privacy: number | null;
  visitor: number | null;
  smoking: string | null;
  pet: string | null;
  selected: string[];
  setGender: (next: string) => void;
  setPersonality: (next: number) => void;
  setPrivacy: (next: number) => void;
  setVisitor: (next: number) => void;
  setSmoking: (next: string) => void;
  setPet: (next: string) => void;
  start: () => void;
  skip: () => void;
  goBackStep: () => void;
  goPriorityStep: () => void;
  togglePriority: (id: string) => void;
  save: () => Promise<void>;
};

export function usePreferencesScreen(): UsePreferencesScreenReturn {
  const router = useRouter();
  const { from } = useLocalSearchParams<{ from?: string }>();
  const fromOnboarding = from === 'onboarding';
  const [step, setStep] = useState<PreferencesStep>(0);
  const [gender, setGender] = useState<string | null>('same');
  const [personality, setPersonality] = useState<number | null>(3);
  const [privacy, setPrivacy] = useState<number | null>(3);
  const [visitor, setVisitor] = useState<number | null>(3);
  const [smoking, setSmoking] = useState<string | null>('any');
  const [pet, setPet] = useState<string | null>('any');
  const [selected, setSelected] = useState<string[]>([]);

  const exit = () => {
    if (fromOnboarding) router.replace('/explore' as never);
    else router.back();
  };

  useEffect(() => {
    if (step === 1) logEvent(AnalyticsEvent.PREFERENCE_STEP_VIEW, { step: 'lifestyle_preference' });
    else if (step === 2)
      logEvent(AnalyticsEvent.PREFERENCE_STEP_VIEW, { step: 'priority_selection' });
  }, [step]);

  const togglePriority = (id: string) => {
    const name = PREFERENCE_PRIORITIES.find((priority) => priority.id === id)?.name ?? id;
    if (selected.includes(id)) {
      logEvent(AnalyticsEvent.PREFERENCE_PRIORITY_DESELECT, { condition_name: name });
      setSelected((prev) => prev.filter((item) => item !== id));
      return;
    }
    if (selected.length >= 3) return;
    logEvent(AnalyticsEvent.PREFERENCE_PRIORITY_SELECT, {
      condition_name: name,
      rank: selected.length + 1,
    });
    setSelected((prev) => [...prev, id]);
  };

  const save = async () => {
    logEvent(AnalyticsEvent.PREFERENCE_COMPLETE);
    if (ONBOARDING_WRITE_ENABLED) {
      const res = await savePreferenceAll({
        lifestyles: compactNumbers([
          LIFESTYLE_BACKEND_IDS.personality,
          LIFESTYLE_BACKEND_IDS.privacy,
          LIFESTYLE_BACKEND_IDS.visitor,
          smoking === 'no' || smoking === 'outdoor' || smoking === 'yes'
            ? LIFESTYLE_CHOICE_BACKEND_IDS.smoking[smoking]
            : undefined,
          pet === 'no' || pet === 'small' || pet === 'any'
            ? LIFESTYLE_CHOICE_BACKEND_IDS.pet[pet]
            : undefined,
        ]),
        conditions: compactNumbers(selected.map((id) => CONDITION_BACKEND_IDS[id])),
      });
      if (res.error) {
        Alert.alert('저장 실패');
        return;
      }
    }
    Alert.alert('저장 완료', '선호 조건이 저장되었어요.', [{ text: '확인', onPress: exit }]);
  };

  return {
    step,
    gender,
    personality,
    privacy,
    visitor,
    smoking,
    pet,
    selected,
    setGender,
    setPersonality,
    setPrivacy,
    setVisitor,
    setSmoking,
    setPet,
    start: () => {
      logEvent(AnalyticsEvent.PREFERENCE_PROMPT_START);
      setStep(1);
    },
    skip: () => {
      logEvent(AnalyticsEvent.PREFERENCE_PROMPT_SKIP);
      exit();
    },
    goBackStep: () => setStep((prev) => (prev === 1 ? 0 : 1)),
    goPriorityStep: () => {
      logEvent(AnalyticsEvent.PREFERENCE_STEP_NEXT, { step: 'lifestyle_preference' });
      setStep(2);
    },
    togglePriority,
    save,
  };
}
