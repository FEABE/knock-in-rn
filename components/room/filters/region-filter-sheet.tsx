import { Ionicons } from '@expo/vector-icons';
import { Pressable, ScrollView, Text, View } from 'react-native';

import { ReadyErrorState, ReadyLoadingState } from '@/components/ui/ready-to-dev-feedback';
import type { Region } from '@/lib/onboarding';

import { FilterSheet } from './filter-sheet';
import { useRegionFilterBody } from './use-region-filter-body';
import { useRegionFilterSheet } from './use-region-filter-sheet';

export function RegionFilterBody({
  value,
  onChange,
  maxSelection = 10,
}: {
  value: Region[];
  onChange: (next: Region[]) => void;
  maxSelection?: number;
}) {
  const { cities, activeCity, districts, loading, error, reload, setActiveCity, toggleRegion } =
    useRegionFilterBody({ value, onChange, maxSelection });

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
      <View className="flex-row overflow-hidden border-b border-[#ECECF3]" style={{ height: 330 }}>
        <View className="w-[132px] bg-white">
          <ScrollView showsVerticalScrollIndicator={false}>
            {cities.map((city) => {
              const selected = city.id === activeCity;
              const selectedCount = value.filter(
                (region) => region.city === city.region.city,
              ).length;
              return (
                <Pressable
                  key={city.id}
                  onPress={() => setActiveCity(city.id)}
                  className={`h-12 flex-row items-center justify-between px-3 ${selected ? 'bg-[#F6F6FA]' : 'bg-white'}`}
                >
                  <Text
                    className={
                      selected
                        ? 'text-[15px] font-semibold text-[#17171B]'
                        : 'text-[15px] text-[#696976]'
                    }
                  >
                    {city.label}
                  </Text>
                  {selectedCount > 0 ? (
                    <Text className="text-sm font-semibold text-[#256EF4]">{selectedCount}</Text>
                  ) : null}
                </Pressable>
              );
            })}
          </ScrollView>
        </View>

        <View className="flex-1 border-l border-[#ECECF3] bg-white">
          <ScrollView showsVerticalScrollIndicator={false}>
            {districts.map((option) => {
              const r = option.region;
              const selected = value.some((d) => d.id === r.id);
              return (
                <Pressable
                  key={r.id}
                  onPress={() => toggleRegion(r)}
                  className="h-12 flex-row items-center justify-between px-5"
                >
                  <Text
                    className={`text-[15px] ${selected ? 'font-semibold text-[#256EF4]' : 'text-[#696976]'}`}
                  >
                    {r.district}
                  </Text>
                  {selected ? <Ionicons name="checkmark" size={17} color="#256EF4" /> : null}
                </Pressable>
              );
            })}
          </ScrollView>
        </View>
      </View>

      <View className="gap-3 pt-3">
        <View className="flex-row items-center justify-between">
          <Text className="text-xs leading-[18px] text-[#696976]">
            선택 지역 {value.length}/{maxSelection}
          </Text>
          <Pressable
            onPress={() => onChange([])}
            className="flex-row items-center gap-1 active:opacity-70"
          >
            <Ionicons name="refresh-outline" size={15} color="#696976" />
            <Text className="text-xs leading-[18px] text-[#696976]">초기화</Text>
          </Pressable>
        </View>
        {value.length > 0 ? (
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerClassName="gap-2"
          >
            {value.map((r) => (
              <Pressable
                key={r.id}
                onPress={() => toggleRegion(r)}
                className="h-8 flex-row items-center gap-1 rounded-full bg-[#F6F6FA] px-3"
              >
                <Text className="text-[13px] text-[#696976]">{r.district}</Text>
                <Ionicons name="close" size={13} color="#AAAABA" />
              </Pressable>
            ))}
          </ScrollView>
        ) : null}
      </View>
    </>
  );
}

export type RegionFilterSheetProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  value: Region[];
  onChange: (next: Region[]) => void;
  maxSelection?: number;
};

export function RegionFilterSheet({
  open,
  onOpenChange,
  value,
  onChange,
  maxSelection = 10,
}: RegionFilterSheetProps) {
  const { draft, setDraft, apply } = useRegionFilterSheet({ open, value, onChange });

  return (
    <FilterSheet open={open} onOpenChange={onOpenChange} title="지역 선택">
      <RegionFilterBody value={draft} onChange={setDraft} maxSelection={maxSelection} />
      <Pressable
        onPress={() => {
          apply();
          onOpenChange(false);
        }}
        className="mt-4 h-12 items-center justify-center rounded-lg bg-[#256EF4] active:opacity-85"
      >
        <Text className="text-[15px] font-bold text-white">확인</Text>
      </Pressable>
    </FilterSheet>
  );
}
