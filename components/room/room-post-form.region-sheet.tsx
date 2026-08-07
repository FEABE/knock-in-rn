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
 * 방이 있는 경우 실제 주소를 저장하므로 시·도/구·군/동 3단계를 모두 선택한다.
 * (RegionFilterBody는 다중 선택 배열 + 최대 선택 수 카운터가 고정이라 그대로 재사용하지 않았다.)
 */
export function RoomRegionSheet({ open, onOpenChange, value, onSelect }: RoomRegionSheetProps) {
  const { cities, getChildren, getOption, loading, error, reload } = useRegionOptions();
  const [draft, setDraft] = useState<Region | null>(null);
  const [activeCityId, setActiveCityId] = useState<string | null>(null);
  const [activeDistrictId, setActiveDistrictId] = useState<string | null>(null);
  const [step, setStep] = useState<'district' | 'neighborhood'>('district');

  // 시트를 열 때마다 현재 선택값 기준으로 초기화한다.
  useEffect(() => {
    if (!open) return;
    const selected = value ? getOption(value.id) : undefined;
    const parent = getOption(selected?.parentId);
    const grandParent = getOption(parent?.parentId);
    const isNeighborhood = Boolean(grandParent);

    setDraft(isNeighborhood ? value : null);
    setActiveCityId(grandParent?.id ?? parent?.id ?? cities[0]?.id ?? null);
    setActiveDistrictId(grandParent ? (parent?.id ?? null) : (selected?.id ?? null));
    setStep(isNeighborhood ? 'neighborhood' : 'district');
  }, [cities, getOption, open, value]);

  useEffect(() => {
    if (!activeCityId && cities[0]) setActiveCityId(cities[0].id);
  }, [activeCityId, cities]);

  const districts = useMemo(
    () => (activeCityId ? getChildren(activeCityId) : []),
    [activeCityId, getChildren],
  );
  const neighborhoods = useMemo(
    () => (activeDistrictId ? getChildren(activeDistrictId) : []),
    [activeDistrictId, getChildren],
  );

  const confirm = () => {
    if (!draft) return;
    onSelect(draft);
    onOpenChange(false);
  };

  return (
    <FilterSheet
      open={open}
      onOpenChange={onOpenChange}
      onBack={
        step === 'neighborhood'
          ? () => {
              setStep('district');
              setDraft(null);
            }
          : undefined
      }
      title="지역 선택"
    >
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
          <View className="h-[336px] flex-row overflow-hidden border-b border-[#ECECF3]">
            <View className="w-1/2 bg-white">
              <ScrollView showsVerticalScrollIndicator={false}>
                {(step === 'district' ? cities : districts).map((option) => {
                  const active =
                    step === 'district'
                      ? option.id === activeCityId
                      : option.id === activeDistrictId;
                  return (
                    <Pressable
                      key={option.id}
                      onPress={() => {
                        if (step === 'district') {
                          setActiveCityId(option.id);
                          setActiveDistrictId(null);
                          setDraft(null);
                          return;
                        }
                        setActiveDistrictId(option.id);
                        setDraft(null);
                      }}
                      className={`h-12 flex-row items-center px-4 ${
                        active && step === 'district' ? 'bg-[#F6F6FA]' : 'bg-white'
                      }`}
                    >
                      <Text
                        className={`text-[15px] ${
                          active
                            ? step === 'neighborhood'
                              ? 'font-semibold text-[#256EF4]'
                              : 'font-semibold text-[#17171B]'
                            : 'text-[#696976]'
                        }`}
                      >
                        {step === 'district' ? option.label : option.region.district}
                      </Text>
                    </Pressable>
                  );
                })}
              </ScrollView>
            </View>

            <View className="w-1/2 bg-white">
              <ScrollView showsVerticalScrollIndicator={false}>
                {step === 'neighborhood' && activeDistrictId && neighborhoods.length === 0 ? (
                  <View className="h-24 items-center justify-center px-3">
                    <Text className="text-center text-xs text-[#AAAABA]">등록된 동이 없어요.</Text>
                  </View>
                ) : (
                  (step === 'district' ? districts : neighborhoods).map((option) => {
                    const region = option.region;
                    const selected = draft?.id === region.id;
                    return (
                      <Pressable
                        key={region.id}
                        onPress={() => {
                          if (step === 'district') {
                            setActiveDistrictId(option.id);
                            setDraft(null);
                            setStep('neighborhood');
                            return;
                          }
                          setDraft(region);
                        }}
                        className="h-12 flex-row items-center px-4"
                      >
                        <Text
                          className={`text-[15px] ${
                            selected ? 'font-semibold text-[#256EF4]' : 'text-[#696976]'
                          }`}
                          numberOfLines={1}
                        >
                          {option.label.split(' ').at(-1)}
                        </Text>
                      </Pressable>
                    );
                  })
                )}
              </ScrollView>
            </View>
          </View>

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
