import { useMemo, useState } from 'react';

import { REGIONS, type Region } from '@/lib/onboarding';

export type UseRegionFilterBodyProps = {
  value: Region[];
  onChange: (next: Region[]) => void;
};

export function useRegionFilterBody({ value, onChange }: UseRegionFilterBodyProps) {
  const cities = useMemo(() => {
    const set = new Set<string>();
    REGIONS.forEach((r) => set.add(r.city));
    return Array.from(set);
  }, []);

  const [activeCity, setActiveCity] = useState<string>(cities[0]);

  const districts = useMemo(() => REGIONS.filter((r) => r.city === activeCity), [activeCity]);

  const toggleRegion = (region: Region) => {
    const exists = value.some((r) => r.id === region.id);
    onChange(exists ? value.filter((r) => r.id !== region.id) : [...value, region]);
  };

  return {
    cities,
    activeCity,
    districts,
    setActiveCity,
    toggleRegion,
  };
}
