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
  const {
    cities,
    activeCity,
    districts,
    loading,
    error,
    limitToastVisible,
    reload,
    setActiveCity,
    toggleRegion,
  } = useRegionFilterBody({ value, onChange, maxSelection });

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
    <View>
      <View className="h-[336px] flex-row overflow-hidden border-b border-[#ECECF3]">
        <View className="w-1/2 bg-white">
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
                  className={`h-12 flex-row items-center gap-1 px-4 ${selected ? 'bg-[#F6F6FA]' : 'bg-white'}`}
                >
                  <Text
                    className={
                      selected
                        ? 'text-[16px] font-semibold text-[#17171B]'
                        : 'text-[16px] text-[#696976]'
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

        <View className="w-1/2 bg-white">
          <ScrollView showsVerticalScrollIndicator={false}>
            {districts.map((option) => {
              const r = option.region;
              const selected = value.some((d) => d.id === r.id);
              return (
                <Pressable
                  key={r.id}
                  onPress={() => toggleRegion(r)}
                  className="h-12 flex-row items-center px-4"
                >
                  <Text
                    className={`text-[16px] ${selected ? 'font-semibold text-[#256EF4]' : 'text-[#696976]'}`}
                  >
                    {r.district}
                  </Text>
                </Pressable>
              );
            })}
          </ScrollView>
        </View>
      </View>

      <View className="gap-3 pt-3">
        <View className="flex-row items-center justify-between">
          <Text className="text-xs leading-[18px] text-[#696976]">
            선택 지역 <Text className="text-[#17171B]">{value.length}</Text>
            <Text className="text-[#AAAABA]">/{maxSelection}</Text>
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
                <Text className="text-[14px] text-[#696976]">{r.district}</Text>
                <Ionicons name="close" size={18} color="#AAAABA" />
              </Pressable>
            ))}
          </ScrollView>
        ) : null}
      </View>

      {limitToastVisible ? (
        <View
          pointerEvents="none"
          className="absolute bottom-[68px] left-0 right-0 z-10 items-center px-4"
        >
          <View className="min-h-[34px] flex-row items-center justify-center gap-2 rounded-lg bg-[#696976] px-4 py-2">
            <View className="h-4 w-4 items-center justify-center rounded-full bg-[#FFB114]">
              <Text className="text-[11px] font-bold leading-4 text-[#8A5C00]">!</Text>
            </View>
            <Text className="text-[13px] leading-5 text-white">
              지역은 최대 {maxSelection}개까지 선택 가능해요
            </Text>
          </View>
        </View>
      ) : null}
    </View>
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
