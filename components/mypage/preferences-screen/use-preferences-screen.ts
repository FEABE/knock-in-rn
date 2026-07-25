import { useLocalSearchParams, useRouter } from 'expo-router';
import { Alert } from 'react-native';
import { useEffect, useMemo, useState } from 'react';

import { AnalyticsEvent, logEvent } from '@/lib/analytics';
import { markStoredPreferenceComplete } from '@/lib/auth/session-storage';
import {
  EMBEDDED_PREFERENCE_PRIORITIES,
  embeddedPriorityIdFromLabel,
  type EmbeddedPreferencePriorityId,
} from '@/lib/domain/preference-priorities';
import { useSafeBottomPadding } from '@/hooks/use-safe-bottom-padding';
import {
  getPreferenceAll,
  lifestyleIdsFromPatternOptions,
  lifestyleModifyItemsFromPatternOptions,
  lifestyleSelectionsFromProfileItems,
  savePreferenceAll,
  updatePreferenceAll,
  useLifestylePatternOptions,
  type LifestyleChoiceGroup,
  type LifestyleScaleOption,
} from '@/lib/api';
import { goExplore } from '@/lib/navigation/routes';
import { ONBOARDING_WRITE_ENABLED } from '@/lib/onboarding';

export type PreferencePriority = {
  id: EmbeddedPreferencePriorityId;
  name: string;
  desc: string;
  backendId?: number;
};

export type PreferencesStep = 0 | 1 | 2;

export type UsePreferencesScreenReturn = {
  step: PreferencesStep;
  scales: Record<string, number>;
  choiceValues: Record<string, string>;
  scaleOptions: LifestyleScaleOption[];
  choiceGroups: LifestyleChoiceGroup[];
  priorities: PreferencePriority[];
  selected: EmbeddedPreferencePriorityId[];
  promptBottomPadding: number;
  formBottomPadding: number;
  setScale: (key: string, next: number) => void;
  setChoice: (key: string, next: string) => void;
  start: () => void;
  skip: () => void;
  goBackStep: () => void;
  goPriorityStep: () => void;
  togglePriority: (id: EmbeddedPreferencePriorityId) => void;
  save: () => Promise<void>;
};

export function usePreferencesScreen(): UsePreferencesScreenReturn {
  const router = useRouter();
  const { from } = useLocalSearchParams<{ from?: string }>();
  const fromOnboarding = from === 'onboarding';
  const lifestyleOptions = useLifestylePatternOptions();
  const patternOptions = useMemo(
    () => ({
      scaleOptions: lifestyleOptions.scaleOptions,
      choiceGroups: lifestyleOptions.choiceGroups,
    }),
    [lifestyleOptions.choiceGroups, lifestyleOptions.scaleOptions],
  );
  const priorities = useMemo<PreferencePriority[]>(() => {
    const backendIdByEmbeddedId = new Map<EmbeddedPreferencePriorityId, number>();
    [...lifestyleOptions.scaleOptions, ...lifestyleOptions.choiceGroups].forEach((option) => {
      const embeddedId = embeddedPriorityIdFromLabel(option.label);
      if (embeddedId) backendIdByEmbeddedId.set(embeddedId, option.patternId);
    });

    return EMBEDDED_PREFERENCE_PRIORITIES.map((option) => ({
      id: option.value,
      name: option.label,
      desc: option.description,
      backendId: backendIdByEmbeddedId.get(option.value),
    }));
  }, [lifestyleOptions.choiceGroups, lifestyleOptions.scaleOptions]);
  const promptBottomPadding = useSafeBottomPadding(24, 32);
  const formBottomPadding = useSafeBottomPadding(12, 24);
  const [state, setState] = useState<PreferencesState>({
    step: 0,
    scales: {},
    choiceValues: {},
    loadedLifestyles: [],
    selected: [],
  });
  const { step, scales, choiceValues, loadedLifestyles, selected } = state;

  useEffect(() => {
    let mounted = true;
    getPreferenceAll().then((res) => {
      if (!mounted || res.error || res.status !== 200 || !res.data) return;
      const loadedLifestyles = (res.data.lifestyles ?? []).map((item) => ({
        id: item.id,
        lifestyleId: item.lifestyleId,
        value: item.value,
      }));
      const nextSelected = (res.data.conditions ?? []).flatMap((condition) => {
        const embeddedId =
          embeddedPriorityIdFromLabel(condition.name) ??
          priorities.find((priority) => priority.backendId === condition.conditionsId)?.id;
        return embeddedId ? [embeddedId] : [];
      });
      const hasSavedPreferences = loadedLifestyles.length > 0 || nextSelected.length > 0;
      setState((current) => ({
        ...current,
        step: !fromOnboarding && hasSavedPreferences ? 1 : current.step,
        selected: nextSelected.slice(0, 3),
        loadedLifestyles,
      }));
    });
    return () => {
      mounted = false;
    };
  }, [fromOnboarding, priorities]);

  useEffect(() => {
    if (!loadedLifestyles.length) return;
    const next = lifestyleSelectionsFromProfileItems(patternOptions, loadedLifestyles);
    setState((current) => ({
      ...current,
      scales:
        Object.keys(next.scales).length > 0
          ? { ...current.scales, ...next.scales }
          : current.scales,
      choiceValues:
        Object.keys(next.choices).length > 0
          ? { ...current.choiceValues, ...next.choices }
          : current.choiceValues,
    }));
  }, [loadedLifestyles, patternOptions]);

  const exit = () => {
    if (fromOnboarding) goExplore(router, 'replace');
    else router.back();
  };

  useEffect(() => {
    if (step === 1) logEvent(AnalyticsEvent.PREFERENCE_STEP_VIEW, { step: 'lifestyle_preference' });
    else if (step === 2)
      logEvent(AnalyticsEvent.PREFERENCE_STEP_VIEW, { step: 'priority_selection' });
  }, [step]);

  const togglePriority = (id: EmbeddedPreferencePriorityId) => {
    const name = priorities.find((priority) => priority.id === id)?.name ?? String(id);
    if (selected.includes(id)) {
      logEvent(AnalyticsEvent.PREFERENCE_PRIORITY_DESELECT, { condition_name: name });
      setState((current) => ({
        ...current,
        selected: current.selected.filter((item) => item !== id),
      }));
      return;
    }
    if (selected.length >= 3) return;
    logEvent(AnalyticsEvent.PREFERENCE_PRIORITY_SELECT, {
      condition_name: name,
      rank: selected.length + 1,
    });
    setState((current) => ({ ...current, selected: [...current.selected, id] }));
  };

  const save = async () => {
    logEvent(AnalyticsEvent.PREFERENCE_COMPLETE);
    if (ONBOARDING_WRITE_ENABLED) {
      const lifestyles = lifestyleIdsFromPatternOptions(patternOptions, scales, choiceValues);
      const unmappedPriorities = priorities.filter(
        (priority) => selected.includes(priority.id) && priority.backendId === undefined,
      );
      if (unmappedPriorities.length) {
        Alert.alert(
          '저장할 수 없는 조건이 있어요',
          `${unmappedPriorities.map((priority) => priority.name).join(', ')} 항목의 서버 기준값이 아직 준비되지 않았어요.`,
        );
        return;
      }
      const conditions = priorities.flatMap((priority) =>
        selected.includes(priority.id) && priority.backendId !== undefined
          ? [priority.backendId]
          : [],
      );
      const modifyItems = lifestyleModifyItemsFromPatternOptions(
        patternOptions,
        loadedLifestyles,
        scales,
        choiceValues,
      );
      if (!lifestyles.length && !conditions.length) {
        Alert.alert('입력 확인 필요', '생활 패턴 또는 중요 조건을 하나 이상 선택해주세요.');
        return;
      }
      const res =
        !fromOnboarding && modifyItems.length
          ? await updatePreferenceAll({
              lifestyles: modifyItems,
              conditions,
            })
          : await savePreferenceAll({
              lifestyles,
              conditions,
            });
      if (res.error || res.status !== 200) {
        Alert.alert('저장 실패', res.error?.message ?? '잠시 후 다시 시도해주세요.');
        return;
      }
      await markStoredPreferenceComplete();
    }
    Alert.alert('저장 완료', '선호 조건이 저장되었어요.', [{ text: '확인', onPress: exit }]);
  };

  return {
    step,
    scales,
    choiceValues,
    scaleOptions: lifestyleOptions.scaleOptions,
    choiceGroups: lifestyleOptions.choiceGroups,
    priorities,
    selected,
    promptBottomPadding,
    formBottomPadding,
    setScale: (key, next) =>
      setState((current) => ({
        ...current,
        scales: { ...current.scales, [key]: next },
      })),
    setChoice: (key, next) =>
      setState((current) => ({
        ...current,
        choiceValues: { ...current.choiceValues, [key]: next },
      })),
    start: () => {
      logEvent(AnalyticsEvent.PREFERENCE_PROMPT_START);
      setState((current) => ({ ...current, step: 1 }));
    },
    skip: () => {
      logEvent(AnalyticsEvent.PREFERENCE_PROMPT_SKIP);
      exit();
    },
    goBackStep: () => setState((current) => ({ ...current, step: current.step === 1 ? 0 : 1 })),
    goPriorityStep: () => {
      logEvent(AnalyticsEvent.PREFERENCE_STEP_NEXT, { step: 'lifestyle_preference' });
      setState((current) => ({ ...current, step: 2 }));
    },
    togglePriority,
    save,
  };
}

type PreferencesState = {
  step: PreferencesStep;
  scales: Record<string, number>;
  choiceValues: Record<string, string>;
  loadedLifestyles: { id?: number; lifestyleId?: number; value?: string }[];
  selected: EmbeddedPreferencePriorityId[];
};
