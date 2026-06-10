import { useEffect, useState } from 'react';
import { Pressable, Text, View } from 'react-native';

import { BottomSheet } from '@/components/ui/headless';
import type { Region, RoomType } from '@/lib/onboarding';

import { BudgetFilterBody, type BudgetValues } from './budget-filter-sheet';
import { GenderFilterBody, type GenderFilterValue } from './gender-filter-sheet';
import { RegionFilterBody } from './region-filter-sheet';
import { RoomTypeFilterBody } from './room-type-filter-sheet';

export type FilterTabKey = 'region' | 'gender' | 'budget' | 'roomType';

export type RoomFilterValue = {
  regions: Region[];
  gender: GenderFilterValue;
  rentMin: number;
  rentMax: number;
  depositMin: number;
  depositMax: number;
  roomTypes: RoomType[];
};

export type RoomFilterSheetProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  value: RoomFilterValue;
  onChange: (next: RoomFilterValue) => void;
  /** 시트가 열릴 때 처음 보여줄 탭 */
  defaultTab?: FilterTabKey;
  /** 초기화 버튼이 되돌릴 기본값 */
  initial?: RoomFilterValue;
};

const TABS: { key: FilterTabKey; label: string }[] = [
  { key: 'region', label: '지역' },
  { key: 'gender', label: '성별' },
  { key: 'budget', label: '예산' },
  { key: 'roomType', label: '룸 형태' },
];

export function RoomFilterSheet({
  open,
  onOpenChange,
  value,
  onChange,
  defaultTab = 'region',
  initial,
}: RoomFilterSheetProps) {
  const [draft, setDraft] = useState<RoomFilterValue>(value);
  const [tab, setTab] = useState<FilterTabKey>(defaultTab);

  // 시트가 열릴 때마다 현재 적용값/선택 탭으로 동기화 (RN Modal은 닫혀도 언마운트되지 않음)
  useEffect(() => {
    if (open) {
      setDraft(value);
      setTab(defaultTab);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  const budget: BudgetValues = {
    depositMin: draft.depositMin,
    depositMax: draft.depositMax,
    rentMin: draft.rentMin,
    rentMax: draft.rentMax,
  };

  return (
    <BottomSheet
      open={open}
      onOpenChange={onOpenChange}
      contentClassName="rounded-t-2xl bg-white px-5 pb-8 pt-3"
    >
      <Text className="mb-1 mt-1 text-lg font-bold text-neutral-900">필터</Text>

      <View className="mb-4 flex-row border-b border-neutral-100">
        {TABS.map((t) => {
          const active = t.key === tab;
          return (
            <Pressable
              key={t.key}
              onPress={() => setTab(t.key)}
              className="flex-1 items-center pt-3"
            >
              <View
                className={`border-b-2 pb-2 ${active ? 'border-[#256EF4]' : 'border-transparent'}`}
              >
                <Text
                  className={
                    active ? 'text-sm font-semibold text-[#256EF4]' : 'text-sm text-neutral-400'
                  }
                >
                  {t.label}
                </Text>
              </View>
            </Pressable>
          );
        })}
      </View>

      <View className="gap-4">
        {tab === 'region' ? (
          <RegionFilterBody
            value={draft.regions}
            onChange={(regions) => setDraft((p) => ({ ...p, regions }))}
          />
        ) : null}
        {tab === 'gender' ? (
          <GenderFilterBody
            value={draft.gender}
            onChange={(gender) => setDraft((p) => ({ ...p, gender }))}
          />
        ) : null}
        {tab === 'budget' ? (
          <BudgetFilterBody value={budget} onChange={(b) => setDraft((p) => ({ ...p, ...b }))} />
        ) : null}
        {tab === 'roomType' ? (
          <RoomTypeFilterBody
            value={draft.roomTypes}
            onChange={(roomTypes) => setDraft((p) => ({ ...p, roomTypes }))}
          />
        ) : null}
      </View>

      <View className="mt-6 flex-row gap-3">
        <Pressable
          onPress={() => initial && setDraft(initial)}
          className="h-12 flex-1 items-center justify-center rounded-xl border border-neutral-200 active:bg-neutral-50"
        >
          <Text className="text-sm font-medium text-neutral-700">초기화</Text>
        </Pressable>
        <Pressable
          onPress={() => {
            onChange(draft);
            onOpenChange(false);
          }}
          className="h-12 flex-[2] items-center justify-center rounded-xl bg-[#256EF4] active:opacity-90"
        >
          <Text className="text-sm font-semibold text-white">적용하기</Text>
        </Pressable>
      </View>
    </BottomSheet>
  );
}
