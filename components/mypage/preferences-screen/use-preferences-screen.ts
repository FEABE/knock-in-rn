import { useLocalSearchParams, useRouter } from 'expo-router';
import { Alert } from 'react-native';
import { useEffect, useMemo, useState } from 'react';

import { setMypageHomeToast } from '@/components/mypage/mypage-home/mypage-home-toast';
import { AnalyticsEvent, logEvent } from '@/lib/analytics';
import {
  EMBEDDED_PREFERENCE_PRIORITIES,
  embeddedPriorityIdFromLabel,
} from '@/lib/domain/preference-priorities';
import { useSession } from '@/lib/domain';
import { useSafeBottomPadding } from '@/hooks/use-safe-bottom-padding';
import {
  getPreferenceAll,
  lifestyleIdsFromPatternOptions,
  lifestyleModifyItemsFromPatternOptions,
  lifestylePatternQuestions,
  lifestyleSelectionsFromProfileItems,
  savePreferenceAll,
  updatePreferenceAll,
  useLifestylePatternOptions,
  type LifestyleChoiceGroup,
  type LifestyleScaleOption,
} from '@/lib/api';
import { goExplore } from '@/lib/navigation/routes';
import { ONBOARDING_WRITE_ENABLED } from '@/lib/onboarding';

/**
 * 중요 조건 = 서버 /meta/lifestyle-patterns 의 문항 그 자체다.
 * (백엔드 preference_condition_weight → life_pattern 참조, conditions[].conditionsId = lifePattern.id)
 * 이름/순서/이모지는 서버 값을 쓰고, 로컬 상수는 부가 설명 문구 폴백으로만 쓴다.
 */
export type PreferencePriority = {
  /** 서버 lifePattern.id */
  id: number;
  name: string;
  desc: string;
  image: string | null;
};

export type PreferencesStep = 0 | 1;

export type UsePreferencesScreenReturn = {
  step: PreferencesStep;
  isPreferenceComplete: boolean;
  scales: Record<string, number>;
  choiceValues: Record<string, string>;
  scaleOptions: LifestyleScaleOption[];
  choiceGroups: LifestyleChoiceGroup[];
  priorities: PreferencePriority[];
  /** 우선순위 탭 스트립에 쓰는 서버 문항명(응답 순서 그대로). */
  questionLabels: string[];
  selected: number[];
  promptBottomPadding: number;
  formBottomPadding: number;
  setScale: (key: string, next: number) => void;
  setChoice: (key: string, next: string) => void;
  start: () => void;
  skip: () => void;
  goBackStep: () => void;
  goPriorityStep: () => void;
  togglePriority: (id: number) => void;
  save: () => Promise<void>;
};

export function usePreferencesScreen(): UsePreferencesScreenReturn {
  const router = useRouter();
  const { session, markPreferenceComplete } = useSession();
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
  const questions = useMemo(() => lifestylePatternQuestions(patternOptions), [patternOptions]);
  const priorities = useMemo<PreferencePriority[]>(
    () =>
      questions.map((question) => ({
        id: question.patternId,
        name: question.label,
        desc: priorityDescription(question.label),
        image: question.image,
      })),
    [questions],
  );
  const questionLabels = useMemo(() => questions.map((question) => question.label), [questions]);
  const promptBottomPadding = useSafeBottomPadding(24, 32);
  const formBottomPadding = useSafeBottomPadding(12, 24);
  const [state, setState] = useState<PreferencesState>({
    // 마이페이지 진입은 안내 팝업(step 0) 없이 바로 관리 화면으로 들어간다.
    // 온보딩(탐색 화면 넛지)에서 들어올 때만 참여 여부를 묻는다.
    step: fromOnboarding ? 0 : 1,
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
      // conditions[].conditionsId 는 lifePattern.id 다. id로 먼저 맞추고, 못 찾으면 이름으로 보완한다.
      const nextSelected = (res.data.conditions ?? []).flatMap((condition) => {
        const byId = priorities.find((priority) => priority.id === condition.conditionsId);
        if (byId) return [byId.id];
        const byName = priorities.find((priority) => priority.name === condition.name?.trim());
        return byName ? [byName.id] : [];
      });
      setState((current) => ({
        ...current,
        selected: nextSelected.slice(0, 3),
        loadedLifestyles,
      }));
    });
    return () => {
      mounted = false;
    };
  }, [priorities]);

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
  }, [step]);

  const togglePriority = (id: number) => {
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
      const conditions = priorities.flatMap((priority) =>
        selected.includes(priority.id) ? [priority.id] : [],
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
      // 수정(PUT)은 "이미 저장된 문항"만 바꿀 수 있다. 새로 답한 문항이 하나라도 있으면
      // 그 답이 통째로 누락되므로 전체 저장(POST)으로 다시 만든다.
      const canModifyAll = !fromOnboarding && modifyItems.length === lifestyles.length;
      const res = canModifyAll
        ? await updatePreferenceAll({
            lifestyles: modifyItems,
            conditions,
          })
        : await savePreferenceAll({
            lifestyles,
            conditions,
          });
      if (res.error || res.status !== 200) {
        Alert.alert('저장 실패', saveErrorMessage(res.error, res.status));
        return;
      }
      await markPreferenceComplete();
    }
    if (!fromOnboarding) setMypageHomeToast('저장되었어요');
    exit();
  };

  return {
    step,
    isPreferenceComplete: session?.preferenceInfo === true,
    scales,
    choiceValues,
    scaleOptions: lifestyleOptions.scaleOptions,
    choiceGroups: lifestyleOptions.choiceGroups,
    priorities,
    questionLabels,
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
    goBackStep: () => {
      if (fromOnboarding) {
        setState((current) => ({ ...current, step: 0 }));
        return;
      }
      exit();
    },
    goPriorityStep: () => {
      logEvent(AnalyticsEvent.PREFERENCE_STEP_NEXT, { step: 'lifestyle_preference' });
      logEvent(AnalyticsEvent.PREFERENCE_STEP_VIEW, { step: 'priority_selection' });
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
  selected: number[];
};

/** 저장 실패 원인을 QA에서 바로 잡을 수 있게 서버 코드/상태까지 함께 보여준다. */
function saveErrorMessage(
  error: { code?: string; message: string } | null,
  status: number,
): string {
  if (!error) return `잠시 후 다시 시도해주세요. (status ${status})`;
  return `${error.message}${error.code ? ` (${error.code})` : ''} (status ${status})`;
}

/** 서버는 조건 부가 설명을 주지 않는다. 로컬 상수에서 문구만 보완하고 없으면 비운다. */
function priorityDescription(name: string): string {
  const embeddedId = embeddedPriorityIdFromLabel(name);
  return (
    EMBEDDED_PREFERENCE_PRIORITIES.find((item) => item.value === embeddedId)?.description ?? ''
  );
}
