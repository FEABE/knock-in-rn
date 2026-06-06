import { Pressable, ScrollView, Text, View } from 'react-native';

import { BottomSheet, ChipMultiSelect, SegmentedControl } from '@/components/ui/headless';
import type { ListFilter } from '@/lib/domain';
import { REGIONS } from '@/lib/onboarding';

import { GENDER_OPTIONS } from '../roommate-filter-bar';

interface RoommateFilterSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  filter: ListFilter;
  onFilterChange: (updater: (prev: ListFilter) => ListFilter) => void;
}

export function RoommateFilterSheet({
  open,
  onOpenChange,
  filter,
  onFilterChange,
}: RoommateFilterSheetProps) {
  return (
    <BottomSheet
      open={open}
      onOpenChange={onOpenChange}
      contentClassName="rounded-t-2xl bg-white px-5 pb-8 pt-3"
    >
      <Text className="mb-4 text-lg font-bold text-neutral-900">상세 조건</Text>

      <View className="gap-5">
        <View className="gap-2">
          <Text className="text-sm font-semibold text-neutral-800">월세 (만원)</Text>
          <View className="flex-row flex-wrap gap-2">
            {[
              { min: 0, max: 40, label: '~40' },
              { min: 40, max: 60, label: '40~60' },
              { min: 60, max: 80, label: '60~80' },
              { min: 80, max: 100, label: '80~100' },
              { min: 100, max: undefined, label: '100~' },
            ].map((r) => {
              const active = filter.rentMin === r.min && filter.rentMax === r.max;
              return (
                <Pressable
                  key={r.label}
                  onPress={() =>
                    onFilterChange((p) => ({
                      ...p,
                      rentMin: active ? undefined : r.min,
                      rentMax: active ? undefined : r.max,
                    }))
                  }
                  className={`rounded-full border px-3 py-1.5 ${
                    active ? 'border-violet-600 bg-violet-600' : 'border-neutral-200 bg-white'
                  }`}
                >
                  <Text
                    className={
                      active ? 'text-xs font-medium text-white' : 'text-xs text-neutral-700'
                    }
                  >
                    {r.label}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        </View>

        <View className="gap-2">
          <Text className="text-sm font-semibold text-neutral-800">성별</Text>
          <SegmentedControl<'any' | 'male' | 'female'>
            options={
              GENDER_OPTIONS as unknown as {
                value: 'any' | 'male' | 'female';
                label: string;
              }[]
            }
            value={(filter.gender ?? 'any') as 'male' | 'female' | 'any'}
            onValueChange={(v) =>
              onFilterChange((p) => ({ ...p, gender: v as 'male' | 'female' | 'any' }))
            }
            className="flex-row gap-2"
            renderItem={({ option, selected }) => (
              <View
                className={`flex-1 items-center rounded-xl border py-3 ${
                  selected ? 'border-violet-600 bg-violet-50' : 'border-neutral-200 bg-white'
                }`}
              >
                <Text
                  className={
                    selected ? 'text-sm font-medium text-violet-600' : 'text-sm text-neutral-700'
                  }
                >
                  {option.label}
                </Text>
              </View>
            )}
          />
        </View>

        <View className="gap-2">
          <Text className="text-sm font-semibold text-neutral-800">지역</Text>
          <ScrollView style={{ maxHeight: 220 }}>
            <ChipMultiSelect
              options={REGIONS.map((r) => ({
                value: r.id,
                label: `${r.city} ${r.district}`,
              }))}
              value={filter.regionIds ?? []}
              onValueChange={(v) => onFilterChange((p) => ({ ...p, regionIds: v }))}
              max={5}
              className="flex-row flex-wrap gap-2"
              renderItem={({ option, selected }) => (
                <View
                  className={`rounded-full border px-3 py-1.5 ${
                    selected ? 'border-violet-600 bg-violet-600' : 'border-neutral-200 bg-white'
                  }`}
                >
                  <Text
                    className={
                      selected ? 'text-xs font-medium text-white' : 'text-xs text-neutral-700'
                    }
                  >
                    {option.label}
                  </Text>
                </View>
              )}
            />
          </ScrollView>
        </View>

        <Pressable
          onPress={() => onOpenChange(false)}
          className="mt-2 h-12 items-center justify-center rounded-xl bg-violet-600 active:opacity-90"
        >
          <Text className="text-sm font-semibold text-white">적용하기</Text>
        </Pressable>
      </View>
    </BottomSheet>
  );
}
