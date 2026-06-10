import { useMemo, useState } from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';

import { REGIONS, type Region } from '@/lib/onboarding';

import { FilterSheet } from './filter-sheet';

export function RegionFilterBody({
  value,
  onChange,
}: {
  value: Region[];
  onChange: (next: Region[]) => void;
}) {
  const cities = useMemo(() => {
    const set = new Set<string>();
    REGIONS.forEach((r) => set.add(r.city));
    return Array.from(set);
  }, []);

  const [activeCity, setActiveCity] = useState<string>(cities[0]);

  const districts = useMemo(
    () => REGIONS.filter((r) => r.city === activeCity),
    [activeCity],
  );

  const toggle = (region: Region) => {
    const exists = value.some((r) => r.id === region.id);
    onChange(exists ? value.filter((r) => r.id !== region.id) : [...value, region]);
  };

  return (
    <>
      <View className="flex-row gap-3" style={{ height: 280 }}>
        <View className="w-24 rounded-xl bg-neutral-50">
          <ScrollView showsVerticalScrollIndicator={false}>
            {cities.map((city) => {
              const selected = city === activeCity;
              return (
                <Pressable
                  key={city}
                  onPress={() => setActiveCity(city)}
                  className={`px-3 py-3 ${selected ? 'bg-white' : ''}`}
                >
                  <Text
                    className={
                      selected
                        ? 'text-sm font-semibold text-[#256EF4]'
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
              const selected = value.some((d) => d.id === r.id);
              return (
                <Pressable
                  key={r.id}
                  onPress={() => toggle(r)}
                  className="flex-row items-center justify-between border-b border-neutral-50 px-4 py-3"
                >
                  <Text className="text-sm text-neutral-800">{r.district}</Text>
                  {selected ? <Text className="text-sm text-[#256EF4]">✓</Text> : null}
                </Pressable>
              );
            })}
          </ScrollView>
        </View>
      </View>

      <View className="gap-2">
        <Text className="text-xs font-semibold text-neutral-700">선택된 지역</Text>
        {value.length === 0 ? (
          <View className="flex-row flex-wrap gap-2">
            <View className="rounded-full bg-[#256EF4]/10 px-3 py-1.5">
              <Text className="text-xs text-[#256EF4]">전체</Text>
            </View>
          </View>
        ) : (
          <View className="flex-row flex-wrap gap-2">
            {value.map((r) => (
              <Pressable
                key={r.id}
                onPress={() => toggle(r)}
                className="flex-row items-center gap-1 rounded-full bg-[#256EF4]/10 px-3 py-1.5"
              >
                <Text className="text-xs text-[#256EF4]">
                  {r.city} {r.district}
                </Text>
                <Text className="text-xs text-[#256EF4]/60">×</Text>
              </Pressable>
            ))}
          </View>
        )}
      </View>
    </>
  );
}

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
  const [draft, setDraft] = useState<Region[]>(value);

  return (
    <FilterSheet
      open={open}
      onOpenChange={onOpenChange}
      title="지역"
      onReset={() => setDraft([])}
      onApply={() => onChange(draft)}
    >
      <RegionFilterBody value={draft} onChange={setDraft} />
    </FilterSheet>
  );
}
