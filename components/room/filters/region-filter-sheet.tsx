import { useMemo, useState } from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';

import { REGIONS, type Region } from '@/lib/onboarding';

import { FilterSheet } from './filter-sheet';

export type RegionFilterSheetProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  value: Region[];
  onChange: (next: Region[]) => void;
};

export function RegionFilterSheet({
  open,
  onOpenChange,
  value,
  onChange,
}: RegionFilterSheetProps) {
  const cities = useMemo(() => {
    const set = new Set<string>();
    REGIONS.forEach((r) => set.add(r.city));
    return Array.from(set);
  }, []);

  const [draft, setDraft] = useState<Region[]>(value);
  const [activeCity, setActiveCity] = useState<string>(cities[0]);

  const districts = useMemo(
    () => REGIONS.filter((r) => r.city === activeCity),
    [activeCity],
  );

  const toggle = (region: Region) => {
    setDraft((prev) => {
      const exists = prev.some((r) => r.id === region.id);
      return exists ? prev.filter((r) => r.id !== region.id) : [...prev, region];
    });
  };

  return (
    <FilterSheet
      open={open}
      onOpenChange={onOpenChange}
      title="지역"
      onReset={() => setDraft([])}
      onApply={() => onChange(draft)}
    >
      <View className="flex-row gap-3" style={{ height: 280 }}>
        <View className="w-24 rounded-xl bg-neutral-50">
          <ScrollView showsVerticalScrollIndicator={false}>
            {cities.map((city) => {
              const selected = city === activeCity;
              return (
                <Pressable
                  key={city}
                  onPress={() => setActiveCity(city)}
                  className={`px-3 py-3 ${
                    selected ? 'bg-white' : ''
                  }`}
                >
                  <Text
                    className={
                      selected
                        ? 'text-sm font-semibold text-violet-700'
                        : 'text-sm text-neutral-500'
                    }
                  >
                    {city}
                  </Text>
                </Pressable>
              );
            })}
          </ScrollView>
        </View>

        <View className="flex-1 rounded-xl border border-neutral-100">
          <ScrollView showsVerticalScrollIndicator={false}>
            {districts.map((r) => {
              const selected = draft.some((d) => d.id === r.id);
              return (
                <Pressable
                  key={r.id}
                  onPress={() => toggle(r)}
                  className="flex-row items-center justify-between border-b border-neutral-50 px-4 py-3"
                >
                  <Text className="text-sm text-neutral-800">
                    {r.district}
                  </Text>
                  {selected ? (
                    <Text className="text-sm text-violet-600">✓</Text>
                  ) : null}
                </Pressable>
              );
            })}
          </ScrollView>
        </View>
      </View>

      <View className="gap-2">
        <Text className="text-xs font-semibold text-neutral-700">
          선택된 지역
        </Text>
        {draft.length === 0 ? (
          <View className="flex-row flex-wrap gap-2">
            <View className="rounded-full bg-violet-50 px-3 py-1.5">
              <Text className="text-xs text-violet-700">전체</Text>
            </View>
          </View>
        ) : (
          <View className="flex-row flex-wrap gap-2">
            {draft.map((r) => (
              <Pressable
                key={r.id}
                onPress={() => toggle(r)}
                className="flex-row items-center gap-1 rounded-full bg-violet-50 px-3 py-1.5"
              >
                <Text className="text-xs text-violet-700">
                  {r.city} {r.district}
                </Text>
                <Text className="text-xs text-violet-400">×</Text>
              </Pressable>
            ))}
          </View>
        )}
      </View>
    </FilterSheet>
  );
}
