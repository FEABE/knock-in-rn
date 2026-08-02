import { Ionicons } from '@expo/vector-icons';
import { Pressable, ScrollView, Text, View } from 'react-native';

import {
  ReadyErrorState,
  ReadyLoadingState,
} from '@/components/ui/ready-to-dev-feedback';
import type { Region } from '@/lib/onboarding';

import { FilterSheet } from './filter-sheet';
import { useRegionFilterBody } from './use-region-filter-body';
import { useRegionFilterSheet } from './use-region-filter-sheet';

export function RegionFilterBody({
  value,
  onChange,
}: {
  value: Region[];
  onChange: (next: Region[]) => void;
}) {
  const {
    cities,
    activeCity,
    districts,
    loading,
    error,
    reload,
    setActiveCity,
    toggleRegion,
  } = useRegionFilterBody({ value, onChange });

  if (loading) return <ReadyLoadingState label="지역을 불러오는 중..." compact />;
  if (error) {
    return (
      <ReadyErrorState
        title="지역을 불러오지 못했어요"
        description={error}
        onRetry={reload}
        compact
      />
    );
  }

  return (
    <>
      <View className="flex-row gap-3" style={{ height: 280 }}>
        <View className="w-24 rounded-xl bg-neutral-50">
          <ScrollView showsVerticalScrollIndicator={false}>
            {cities.map((city) => {
              const selected = city.id === activeCity;
              return (
                <Pressable
                  key={city.id}
                  onPress={() => setActiveCity(city.id)}
                  className={`px-3 py-3 ${selected ? 'bg-white' : ''}`}
                >
                  <Text
                    className={
                      selected ? 'text-sm font-semibold text-[#256EF4]' : 'text-sm text-neutral-500'
                    }
                  >
                    {city.label}
                  </Text>
                </Pressable>
              );
            })}
          </ScrollView>
        </View>

        <View className="flex-1 rounded-xl border border-neutral-100">
          <ScrollView showsVerticalScrollIndicator={false}>
            {districts.map((option) => {
              const r = option.region;
              const selected = value.some((d) => d.id === r.id);
              return (
                <Pressable
                  key={r.id}
                  onPress={() => toggleRegion(r)}
                  className="flex-row items-center justify-between border-b border-neutral-50 px-4 py-3"
                >
                  <Text className="text-sm text-neutral-800">{r.district}</Text>
                  {selected ? <Ionicons name="checkmark" size={16} color="#256EF4" /> : null}
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
                onPress={() => toggleRegion(r)}
                className="flex-row items-center gap-1 rounded-full bg-[#256EF4]/10 px-3 py-1.5"
              >
                <Text className="text-xs text-[#256EF4]">
                  {r.city} {r.district}
                </Text>
                <Ionicons name="close" size={12} color="#256EF4" />
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

export function RegionFilterSheet({ open, onOpenChange, value, onChange }: RegionFilterSheetProps) {
  const { draft, setDraft, reset, apply } = useRegionFilterSheet({ open, value, onChange });

  return (
    <FilterSheet
      open={open}
      onOpenChange={onOpenChange}
      title="지역"
      onReset={reset}
      onApply={apply}
    >
      <RegionFilterBody value={draft} onChange={setDraft} />
    </FilterSheet>
  );
}
