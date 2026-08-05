import { useMemo } from 'react';

import { embeddedPriorityIdFromLabel } from '@/lib/domain/preference-priorities';

import { getLifestylePatterns, type LifestylePattern } from './meta';
import { useApi } from './use-async';

/** 서버 details 한 칸. value는 details.values(숫자), backendId는 details.id 그대로. */
export type LifestyleScaleLevel = {
  value: number;
  label: string;
  backendId: number;
};

/** 서버 /meta/lifestyle-patterns 문항 공통 필드. */
type LifestylePatternCommon = {
  patternId: number;
  key: string;
  /** 서버 name (문항명). 로컬 축약 라벨로 덮어쓰지 않는다. */
  label: string;
  /** 내 생활패턴 화면 질문 문구 (lifePatternDescription). */
  question: string;
  /** 선호 조건 화면 질문 문구 (preferenceDescription). */
  preferenceQuestion: string;
  /** 서버 image 필드(이모지 문자열 또는 URL). 파일명뿐이면 렌더 측에서 폴백한다. */
  image: string | null;
  /** 서버 응답 순서(= lifePattern.sort). 화면 정렬 기준. */
  order: number;
};

export type LifestyleScaleOption = LifestylePatternCommon & {
  minLabel: string;
  maxLabel: string;
  levels: LifestyleScaleLevel[];
  backendIdsByValue: Record<number, number>;
};

export type LifestyleChoiceOption = {
  value: string;
  label: string;
  backendId: number;
  detailValue: string;
};

export type LifestyleChoiceGroup = LifestylePatternCommon & {
  options: LifestyleChoiceOption[];
};

export type LifestylePatternQuestion =
  | ({ kind: 'scale' } & LifestyleScaleOption)
  | ({ kind: 'choice' } & LifestyleChoiceGroup);

export type LifestylePatternOptions = {
  scaleOptions: LifestyleScaleOption[];
  choiceGroups: LifestyleChoiceGroup[];
};

export type LifestylePatternOptionsState = LifestylePatternOptions & {
  loading: boolean;
  error: string | null;
  reload: () => void;
};

export type LifestyleExistingSelection = {
  id?: number;
  lifestyleId?: number;
  value?: string;
};

export type LifestyleModifyItem = {
  id: number;
  lifestyleId: number;
};

export function useLifestylePatternOptions(): LifestylePatternOptionsState {
  const state = useApi(['meta', 'lifestyle-patterns'], () => getLifestylePatterns(), {
    retry: false,
  });
  const options = useMemo(
    () => buildLifestylePatternOptions(state.data?.patterns ?? []),
    [state.data?.patterns],
  );

  return {
    ...options,
    loading: state.loading,
    error: state.error,
    reload: state.reload,
  };
}

/** 척도/선택 문항을 서버 응답 순서(lifePattern.sort)대로 합친다. */
export function lifestylePatternQuestions(
  options: LifestylePatternOptions,
): LifestylePatternQuestion[] {
  return [
    ...options.scaleOptions.map((option) => ({ kind: 'scale' as const, ...option })),
    ...options.choiceGroups.map((group) => ({ kind: 'choice' as const, ...group })),
  ].sort((a, b) => a.order - b.order);
}

export function lifestyleIdsFromPatternOptions(
  options: LifestylePatternOptions,
  scales: Record<string, number | undefined>,
  choices: Record<string, string | null | undefined>,
): number[] {
  const ids = [
    ...options.scaleOptions.flatMap((scale) => {
      const value = scales[scale.key];
      if (value === undefined || value === null) return [];
      const id = scale.backendIdsByValue[Math.round(value)];
      return id === undefined ? [] : [id];
    }),
    ...options.choiceGroups.flatMap((group) => {
      const value = choices[group.key];
      if (!value) return [];
      const direct = Number(value);
      if (Number.isFinite(direct)) return [direct];
      const option = group.options.find((item) => item.value === value);
      return option ? [option.backendId] : [];
    }),
  ];
  return [...new Set(ids)];
}

export function lifestyleModifyItemsFromPatternOptions(
  options: LifestylePatternOptions,
  existing: LifestyleExistingSelection[],
  scales: Record<string, number | undefined>,
  choices: Record<string, string | null | undefined>,
): LifestyleModifyItem[] {
  const keyByLifestyleId = lifestyleKeyByBackendId(options);
  const existingByKey = new Map<string, number>();
  existing.forEach((item) => {
    if (item.id === undefined || item.lifestyleId === undefined) return;
    const key = keyByLifestyleId.get(item.lifestyleId);
    if (key) existingByKey.set(key, item.id);
  });

  return lifestyleSelectionsWithKeys(options, scales, choices).flatMap(({ key, lifestyleId }) => {
    const id = existingByKey.get(key);
    return id === undefined ? [] : [{ id, lifestyleId }];
  });
}

export function lifestyleSelectionsFromProfileItems(
  options: LifestylePatternOptions,
  items: LifestyleExistingSelection[],
): { scales: Record<string, number>; choices: Record<string, string> } {
  const scales: Record<string, number> = {};
  const choices: Record<string, string> = {};

  for (const item of items) {
    if (item.lifestyleId === undefined || item.value == null) continue;
    const scale = options.scaleOptions.find((option) => option.patternId === item.lifestyleId);
    if (scale) {
      const value = Number(item.value);
      if (Number.isFinite(value) && scale.backendIdsByValue[value] !== undefined) {
        scales[scale.key] = value;
      }
      continue;
    }
    const group = options.choiceGroups.find((option) => option.patternId === item.lifestyleId);
    const choice = group?.options.find((option) => option.detailValue === String(item.value));
    if (group && choice) choices[group.key] = choice.value;
  }

  return { scales, choices };
}

function lifestyleSelectionsWithKeys(
  options: LifestylePatternOptions,
  scales: Record<string, number | undefined>,
  choices: Record<string, string | null | undefined>,
): { key: string; lifestyleId: number }[] {
  return [
    ...options.scaleOptions.flatMap((scale) => {
      const value = scales[scale.key];
      if (value === undefined || value === null) return [];
      const lifestyleId = scale.backendIdsByValue[Math.round(value)];
      return lifestyleId === undefined ? [] : [{ key: scale.key, lifestyleId }];
    }),
    ...options.choiceGroups.flatMap((group) => {
      const value = choices[group.key];
      if (!value) return [];
      const direct = Number(value);
      const lifestyleId = Number.isFinite(direct)
        ? direct
        : group.options.find((item) => item.value === value)?.backendId;
      return lifestyleId === undefined ? [] : [{ key: group.key, lifestyleId }];
    }),
  ];
}

function lifestyleKeyByBackendId(options: LifestylePatternOptions): Map<number, string> {
  const map = new Map<number, string>();
  options.scaleOptions.forEach((scale) => map.set(scale.patternId, scale.key));
  options.choiceGroups.forEach((group) => map.set(group.patternId, group.key));
  return map;
}

/**
 * 서버 /meta/lifestyle-patterns를 화면 옵션으로 변환한다.
 * - patterns는 lifePattern.sort 순으로 오지만 details는 정렬이 보증되지 않는다(실측 id 18,15,16,17,19).
 *   그래서 details는 항상 values 오름차순으로 재정렬한다.
 * - 문항명/질문/선택지는 서버 값을 그대로 쓰고, 배열 index를 값이나 id로 쓰지 않는다.
 */
function buildLifestylePatternOptions(patterns: LifestylePattern[]): LifestylePatternOptions {
  const scaleOptions: LifestyleScaleOption[] = [];
  const choiceGroups: LifestyleChoiceGroup[] = [];

  patterns.forEach((pattern, index) => {
    const details = (pattern.details ?? [])
      .flatMap((detail) => {
        if (!detail.id || !detail.description || !detail.values) return [];
        const value = Number(detail.values);
        if (!Number.isFinite(value)) return [];
        return [{ ...detail, backendId: detail.id, value }];
      })
      .sort((a, b) => a.value - b.value);
    if (!pattern.id || !pattern.name || !details.length) return;

    const question = pattern.lifePatternDescription?.trim() || pattern.name;
    const common: LifestylePatternCommon = {
      patternId: pattern.id,
      key: patternKey(pattern),
      label: pattern.name,
      question,
      preferenceQuestion: pattern.preferenceDescription?.trim() || question,
      image: pattern.image?.trim() || null,
      order: index,
    };

    if (pattern.type === 'SCALE') {
      scaleOptions.push({
        ...common,
        minLabel: details[0]?.description ?? pattern.name,
        maxLabel: details[details.length - 1]?.description ?? pattern.name,
        levels: details.map((detail) => ({
          value: detail.value,
          label: detail.description ?? '',
          backendId: detail.backendId,
        })),
        backendIdsByValue: Object.fromEntries(
          details.map((detail) => [detail.value, detail.backendId]),
        ),
      });
      return;
    }

    if (pattern.type === 'SINGLE_CHOICE' || pattern.type === 'BOOLEAN') {
      choiceGroups.push({
        ...common,
        options: details.map((detail) => ({
          value: String(detail.backendId),
          label: detail.description ?? '',
          backendId: detail.backendId,
          detailValue: detail.values ?? '',
        })),
      });
    }
  });

  return { scaleOptions, choiceGroups };
}

function patternKey(pattern: LifestylePattern): string {
  const name = pattern.name ?? '';
  const embeddedPriorityId = embeddedPriorityIdFromLabel(name);
  if (embeddedPriorityId) return embeddedPriorityId;
  return pattern.id ? `pattern-${pattern.id}` : name;
}
