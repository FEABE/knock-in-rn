import { useCallback, useMemo, useState } from 'react';

import type { Region } from '@/lib/onboarding';

import { useControllableState } from '../use-controllable-state';

export type UseRegionPickerProps = {
  regions: readonly Region[];
  value?: Region[];
  defaultValue?: Region[];
  onValueChange?: (value: Region[]) => void;
  max?: number;
  onMaxReached?: () => void;
  disabled?: boolean;
  initialQuery?: string;
};

export type RegionItemState = {
  region: Region;
  selected: boolean;
  disabled: boolean;
  onPress: () => void;
};

export type UseRegionPickerReturn = {
  value: Region[];
  query: string;
  setQuery: (next: string) => void;
  clearQuery: () => void;
  items: RegionItemState[];
  filteredCount: number;
  totalCount: number;
  isDisabled: boolean;
  isAtMax: boolean;
  remaining: number | null;
  toggle: (region: Region) => void;
  remove: (id: string) => void;
  clear: () => void;
};

function matches(region: Region, q: string): boolean {
  if (!q) return true;
  const needle = q.toLowerCase().trim();
  if (!needle) return true;
  return (
    region.city.toLowerCase().includes(needle) ||
    region.district.toLowerCase().includes(needle) ||
    `${region.city} ${region.district}`.toLowerCase().includes(needle)
  );
}

export function useRegionPicker({
  regions,
  value,
  defaultValue,
  onValueChange,
  max,
  onMaxReached,
  disabled,
  initialQuery = '',
}: UseRegionPickerProps): UseRegionPickerReturn {
  const [current, setCurrent] = useControllableState<Region[]>({
    value,
    defaultValue: defaultValue ?? [],
    onChange: onValueChange,
  });
  const [query, setQuery] = useState(initialQuery);
  const list = current ?? [];
  const selectedIds = useMemo(() => new Set(list.map((r) => r.id)), [list]);

  const toggle = useCallback(
    (region: Region) => {
      if (disabled) return;
      if (selectedIds.has(region.id)) {
        setCurrent(list.filter((r) => r.id !== region.id));
        return;
      }
      if (max !== undefined && list.length >= max) {
        onMaxReached?.();
        return;
      }
      setCurrent([...list, region]);
    },
    [disabled, selectedIds, list, max, onMaxReached, setCurrent],
  );

  const remove = useCallback(
    (id: string) => {
      if (disabled) return;
      setCurrent(list.filter((r) => r.id !== id));
    },
    [disabled, list, setCurrent],
  );

  const clear = useCallback(() => {
    if (disabled) return;
    setCurrent([]);
  }, [disabled, setCurrent]);

  const clearQuery = useCallback(() => setQuery(''), []);

  const isAtMax = max !== undefined && list.length >= max;

  const items = useMemo<RegionItemState[]>(
    () =>
      regions
        .filter((r) => matches(r, query))
        .map((r) => {
          const selected = selectedIds.has(r.id);
          return {
            region: r,
            selected,
            disabled: !!disabled || (!selected && isAtMax),
            onPress: () => toggle(r),
          };
        }),
    [regions, query, selectedIds, disabled, isAtMax, toggle],
  );

  return {
    value: list,
    query,
    setQuery,
    clearQuery,
    items,
    filteredCount: items.length,
    totalCount: regions.length,
    isDisabled: !!disabled,
    isAtMax,
    remaining: max === undefined ? null : Math.max(0, max - list.length),
    toggle,
    remove,
    clear,
  };
}
