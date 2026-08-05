import { Ionicons } from '@expo/vector-icons';
import { useEffect, useMemo, useState } from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';

import { ReadyErrorState, ReadyLoadingState } from '@/components/ui/ready-to-dev-feedback';
import { useRegionOptions } from '@/lib/api';
import type { Region } from '@/lib/onboarding';

import { FilterSheet } from './filters/filter-sheet';

export type RoomRegionSheetProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  value: Region | null;
  onSelect: (next: Region) => void;
};

/**
 * 게시글 등록/수정용 지역 선택 바텀시트.
 * 필터의 RegionFilterBody와 같은 시·도/구·군 2단 리스트 구조를 단일 선택 모드로 재구성했다.
 * (RegionFilterBody는 다중 선택 배열 + 최대 선택 수 카운터가 고정이라 그대로 재사용하지 않았다.)
 */
export function RoomRegionSheet({ open, onOpenChange, value, onSelect }: RoomRegionSheetProps) {
  const { cities, getChildren, getOption, loading, error, reload } = useRegionOptions();
  const [draft, setDraft] = useState<Region | null>(value);
  const [activeCityId, setActiveCityId] = useState<string | null>(null);

  // 시트를 열 때마다 현재 선택값 기준으로 초기화한다.
  useEffect(() => {
    if (!open) return;
    setDraft(value);
    const parentId = value ? getOption(value.id)?.parentId : null;
    setActiveCityId((current) => parentId ?? current ?? cities[0]?.id ?? null);
  }, [cities, getOption, open, value]);

  useEffect(() => {
    if (!activeCityId && cities[0]) setActiveCityId(cities[0].id);
  }, [activeCityId, cities]);

  const districts = useMemo(
    () => (activeCityId ? getChildren(activeCityId) : []),
    [activeCityId, getChildren],
  );

  const confirm = () => {
    if (!draft) return;
    onSelect(draft);
    onOpenChange(false);
  };

  return (
    <FilterSheet open={open} onOpenChange={onOpenChange} title="지역 선택">
      {loading ? (
        <ReadyLoadingState label="지역을 불러오는 중..." compact />
      ) : error ? (
        <ReadyErrorState
          title="지역을 불러오지 못했어요"
          description={error}
          onRetry={reload}
          compact
        />
      ) : (
        <>
          <View
            className="flex-row overflow-hidden border-b border-[#ECECF3]"
            style={{ height: 330 }}
          >
            <View className="w-[132px] bg-white">
              <ScrollView showsVerticalScrollIndicator={false}>
                {cities.map((city) => {
                  const active = city.id === activeCityId;
                  const hasSelection = draft?.city === city.region.city;
                  return (
                    <Pressable
                      key={city.id}
                      onPress={() => setActiveCityId(city.id)}
                      className={`h-12 flex-row items-center justify-between px-3 ${
                        active ? 'bg-[#F6F6FA]' : 'bg-white'
                      }`}
                    >
                      <Text
                        className={
                          active
                            ? 'text-[15px] font-semibold text-[#17171B]'
                            : 'text-[15px] text-[#696976]'
                        }
                      >
                        {city.label}
                      </Text>
                      {hasSelection ? (
                        <Ionicons name="checkmark" size={15} color="#256EF4" />
                      ) : null}
                    </Pressable>
                  );
                })}
              </ScrollView>
            </View>

            <View className="flex-1 border-l border-[#ECECF3] bg-white">
              <ScrollView showsVerticalScrollIndicator={false}>
                {districts.map((option) => {
                  const region = option.region;
                  const selected = draft?.id === region.id;
                  return (
                    <Pressable
                      key={region.id}
                      onPress={() => setDraft(region)}
                      className="h-12 flex-row items-center justify-between px-5"
                    >
                      <Text
                        className={`text-[15px] ${
                          selected ? 'font-semibold text-[#256EF4]' : 'text-[#696976]'
                        }`}
                      >
                        {region.district}
                      </Text>
                      {selected ? <Ionicons name="checkmark" size={17} color="#256EF4" /> : null}
                    </Pressable>
                  );
                })}
              </ScrollView>
            </View>
          </View>

          {draft ? (
            <View className="flex-row pt-3">
              <View className="h-8 flex-row items-center gap-1 rounded-full bg-[#F6F6FA] px-3">
                <Text className="text-[13px] text-[#696976]">
                  {draft.city} {draft.district}
                </Text>
              </View>
            </View>
          ) : null}

          <Pressable
            onPress={confirm}
            disabled={!draft}
            className={`mt-4 h-12 items-center justify-center rounded-lg ${
              draft ? 'bg-[#256EF4] active:opacity-85' : 'bg-[#F1F1F6]'
            }`}
          >
            <Text className={`text-[15px] font-bold ${draft ? 'text-white' : 'text-[#AAAABA]'}`}>
              확인
            </Text>
          </Pressable>
        </>
      )}
    </FilterSheet>
  );
}
