import { useCallback, useMemo } from 'react';

import type { Region } from '@/lib/onboarding';

import { getRegions, type RegionMeta } from './meta';
import { useApi } from './use-async';

export type RegionSelectOption = {
  id: string;
  parentId: string | null;
  label: string;
  region: Region;
};

export type RegionOptionsState = {
  cities: RegionSelectOption[];
  selectableRegions: RegionSelectOption[];
  getChildren: (parentId: string | null | undefined) => RegionSelectOption[];
  getOption: (id: string | null | undefined) => RegionSelectOption | undefined;
  loading: boolean;
  error: string | null;
  reload: () => void;
};

export function useRegionOptions(): RegionOptionsState {
  const state = useApi(['meta', 'regions'], () => getRegions(), { retry: false });
  const metas = useMemo(() => state.data?.region ?? [], [state.data?.region]);
  const tree = useMemo(() => buildRegionTree(metas), [metas]);

  const getChildren = useCallback(
    (parentId: string | null | undefined) => tree.childrenByParent.get(parentId ?? null) ?? [],
    [tree],
  );

  const getOption = useCallback(
    (id: string | null | undefined) => (id ? tree.optionsById.get(id) : undefined),
    [tree],
  );

  return {
    cities: tree.cities,
    selectableRegions: tree.selectableRegions,
    getChildren,
    getOption,
    loading: state.loading,
    error: state.error,
    reload: state.reload,
  };
}

function buildRegionTree(metas: RegionMeta[]) {
  const metaById = new Map<string, RegionMeta>();
  metas.forEach((meta) => {
    if (meta.id !== undefined) metaById.set(String(meta.id), meta);
  });

  const childrenMetaByParent = new Map<string | null, RegionMeta[]>();
  metas.forEach((meta) => {
    const parentId =
      meta.parentId === undefined || meta.parentId === null ? null : String(meta.parentId);
    const list = childrenMetaByParent.get(parentId) ?? [];
    list.push(meta);
    childrenMetaByParent.set(parentId, list);
  });

  const optionsById = new Map<string, RegionSelectOption>();
  metas.forEach((meta) => {
    if (meta.id === undefined) return;
    optionsById.set(String(meta.id), metaToOption(meta, metaById));
  });

  const childrenByParent = new Map<string | null, RegionSelectOption[]>();
  childrenMetaByParent.forEach((children, parentId) => {
    childrenByParent.set(
      parentId,
      children.flatMap((child) => {
        const option = child.id === undefined ? undefined : optionsById.get(String(child.id));
        return option ? [option] : [];
      }),
    );
  });

  const cities = childrenByParent.get(null) ?? [];
  const selectableRegions = metas.flatMap((meta) => {
    if (meta.parentId === undefined || meta.parentId === null || meta.id === undefined) return [];
    const option = optionsById.get(String(meta.id));
    return option ? [option] : [];
  });

  return { cities, selectableRegions, childrenByParent, optionsById };
}

function metaToOption(meta: RegionMeta, metaById: Map<string, RegionMeta>): RegionSelectOption {
  const id = String(meta.id);
  const parent =
    meta.parentId === undefined || meta.parentId === null
      ? undefined
      : metaById.get(String(meta.parentId));
  const grandParent =
    parent?.parentId === undefined || parent.parentId === null
      ? undefined
      : metaById.get(String(parent.parentId));
  const city = grandParent
    ? shortCityName(grandParent.name)
    : parent
      ? shortCityName(parent.name)
      : shortCityName(meta.name);
  const district = grandParent
    ? `${parent?.name ?? ''} ${meta.name}`.trim()
    : parent
      ? (meta.name ?? '')
      : '전체';

  return {
    id,
    parentId: meta.parentId === undefined || meta.parentId === null ? null : String(meta.parentId),
    label: parent ? district : city,
    region: {
      id,
      city,
      district,
    },
  };
}

function shortCityName(value: string | undefined): string {
  if (!value) return '';
  if (value === '서울특별시') return '서울';
  if (value === '경기도') return '경기';
  return value;
}
