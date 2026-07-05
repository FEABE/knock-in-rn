import { useMemo } from 'react';

import { getLifestylePatterns, type LifestylePattern } from './meta';
import { useApi } from './use-async';

export type LifestyleScaleOption = {
  key: string;
  label: string;
  minLabel: string;
  maxLabel: string;
  levels: string[];
  backendIdsByValue: Record<number, number>;
};

export type LifestyleChoiceOption = {
  value: string;
  label: string;
  backendId: number;
};

export type LifestyleChoiceGroup = {
  key: string;
  label: string;
  options: LifestyleChoiceOption[];
};

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
};

export type LifestyleModifyItem = {
  id: number;
  lifestyleId: number;
};

export function useLifestylePatternOptions(): LifestylePatternOptionsState {
  const state = useApi(['meta', 'lifestyle-patterns'], () => getLifestylePatterns());
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

export function lifestyleIdsFromPatternOptions(
  options: LifestylePatternOptions,
  scales: Record<string, number | undefined>,
  choices: Record<string, string | null | undefined>,
): number[] {
  const ids = [
    ...options.scaleOptions.flatMap((scale) => {
      const value = scales[scale.key];
      if (value === undefined || value === null) return [];
      const normalized = Math.max(1, Math.min(5, Math.round(value)));
      const id = scale.backendIdsByValue[normalized];
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

export function lifestyleSelectionsFromBackendIds(
  options: LifestylePatternOptions,
  ids: number[],
): { scales: Record<string, number>; choices: Record<string, string> } {
  const idSet = new Set(ids);
  const scales: Record<string, number> = {};
  const choices: Record<string, string> = {};

  for (const scale of options.scaleOptions) {
    for (const [value, id] of Object.entries(scale.backendIdsByValue)) {
      if (idSet.has(id)) scales[scale.key] = Number(value);
    }
  }
  for (const group of options.choiceGroups) {
    const option = group.options.find((item) => idSet.has(item.backendId));
    if (option) choices[group.key] = option.value;
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
      const normalized = Math.max(1, Math.min(5, Math.round(value)));
      const lifestyleId = scale.backendIdsByValue[normalized];
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
  options.scaleOptions.forEach((scale) => {
    Object.values(scale.backendIdsByValue).forEach((id) => map.set(id, scale.key));
  });
  options.choiceGroups.forEach((group) => {
    group.options.forEach((option) => map.set(option.backendId, group.key));
  });
  return map;
}

function buildLifestylePatternOptions(patterns: LifestylePattern[]): LifestylePatternOptions {
  let nextBackendId = 1;
  const scaleOptions: LifestyleScaleOption[] = [];
  const choiceGroups: LifestyleChoiceGroup[] = [];

  for (const pattern of patterns) {
    const details = (pattern.details ?? []).flatMap((detail) => {
      if (!detail.description || !detail.values) return [];
      const backendId = nextBackendId;
      nextBackendId += 1;
      return [{ ...detail, backendId }];
    });
    if (!pattern.id || !pattern.name || !details.length) continue;

    const key = patternKey(pattern);
    if (pattern.type === 'SCALE') {
      const sorted = [...details].sort((a, b) => Number(a.values) - Number(b.values));
      const backendIdsByValue = Object.fromEntries(
        sorted.flatMap((detail) => {
          const value = Number(detail.values);
          return Number.isFinite(value) ? [[value, detail.backendId]] : [];
        }),
      );
      scaleOptions.push({
        key,
        label: pattern.name,
        minLabel: sorted[0]?.description ?? pattern.name,
        maxLabel: sorted[sorted.length - 1]?.description ?? pattern.name,
        levels: sorted.map((detail) => detail.description ?? ''),
        backendIdsByValue,
      });
      continue;
    }

    if (pattern.type === 'SINGLE_CHOICE' || pattern.type === 'BOOLEAN') {
      choiceGroups.push({
        key,
        label: pattern.name,
        options: details.map((detail) => ({
          value: String(detail.backendId),
          label: detail.description ?? '',
          backendId: detail.backendId,
        })),
      });
    }
  }

  return { scaleOptions, choiceGroups };
}

function patternKey(pattern: LifestylePattern): string {
  const name = pattern.name ?? '';
  if (name.includes('청소') || name.includes('청결')) return 'cleanliness';
  if (name.includes('흡연')) return 'smoking';
  if (name.includes('MBTI') || name.includes('성향')) return 'personality';
  return pattern.id ? `pattern-${pattern.id}` : name;
}
