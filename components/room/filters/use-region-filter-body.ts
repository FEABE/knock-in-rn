import { useEffect, useMemo, useState } from 'react';

import { useRegionOptions } from '@/lib/api';
import type { Region } from '@/lib/onboarding';

export type UseRegionFilterBodyProps = {
  value: Region[];
  onChange: (next: Region[]) => void;
  maxSelection?: number;
};

export function useRegionFilterBody({
  value,
  onChange,
  maxSelection = 10,
}: UseRegionFilterBodyProps) {
  const regionOptions = useRegionOptions();
  const cities = regionOptions.cities;
  const [activeCity, setActiveCity] = useState<string | null>(cities[0]?.id ?? null);

  useEffect(() => {
    if (!activeCity && cities[0]) setActiveCity(cities[0].id);
  }, [activeCity, cities]);

  const districts = useMemo(
    () => regionOptions.getChildren(activeCity),
    [activeCity, regionOptions],
  );

  const toggleRegion = (region: Region) => {
    const exists = value.some((r) => r.id === region.id);
    if (exists) {
      onChange(value.filter((r) => r.id !== region.id));
      return;
    }
    if (value.length < maxSelection) onChange([...value, region]);
  };

  return {
    cities,
    activeCity,
    districts,
    loading: regionOptions.loading,
    error: regionOptions.error,
    reload: regionOptions.reload,
    setActiveCity,
    toggleRegion,
  };
}
