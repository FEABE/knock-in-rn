import { useMemo } from 'react';

import { embeddedPriorityIdFromLabel } from '@/lib/domain/preference-priorities';

import { getLifestylePatterns, type LifestylePattern } from './meta';
import { useApi } from './use-async';

export type LifestyleScaleOption = {
  patternId: number;
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
  detailValue: string;
};

export type LifestyleChoiceGroup = {
  patternId: number;
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
  options.scaleOptions.forEach((scale) => map.set(scale.patternId, scale.key));
  options.choiceGroups.forEach((group) => map.set(group.patternId, group.key));
  return map;
}

function buildLifestylePatternOptions(patterns: LifestylePattern[]): LifestylePatternOptions {
  const scaleOptions: LifestyleScaleOption[] = [];
  const choiceGroups: LifestyleChoiceGroup[] = [];

  for (const pattern of patterns) {
    const details = (pattern.details ?? []).flatMap((detail) => {
      if (!detail.id || !detail.description || !detail.values) return [];
      return [{ ...detail, backendId: detail.id }];
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
        patternId: pattern.id,
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
        patternId: pattern.id,
        key,
        label: pattern.name,
        options: details.map((detail) => ({
          value: String(detail.backendId),
          label: detail.description ?? '',
          backendId: detail.backendId,
          detailValue: detail.values ?? '',
        })),
      });
    }
  }

  return { scaleOptions, choiceGroups };
}

function patternKey(pattern: LifestylePattern): string {
  const name = pattern.name ?? '';
  const embeddedPriorityId = embeddedPriorityIdFromLabel(name);
  if (embeddedPriorityId) return embeddedPriorityId;
  return pattern.id ? `pattern-${pattern.id}` : name;
}
