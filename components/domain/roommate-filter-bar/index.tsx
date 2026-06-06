import { ScrollView, Text, View } from 'react-native';

import { Chip } from '@/components/ui/chip';
import { SegmentedControl } from '@/components/ui/headless';
import type { ListFilter, SortKey } from '@/lib/domain';

export const SORT_OPTIONS = [
  { value: 'latest', label: '최신순' },
  { value: 'likes', label: '관심순' },
  { value: 'views', label: '조회순' },
] as const;

export const GENDER_OPTIONS = [
  { value: 'any', label: '전체' },
  { value: 'male', label: '남성' },
  { value: 'female', label: '여성' },
] as const;

interface RoommateFilterBarProps {
  filter: ListFilter;
  onFilterChange: (updater: (prev: ListFilter) => ListFilter) => void;
  onOpenSheet: () => void;
}

export function RoommateFilterBar({ filter, onFilterChange, onOpenSheet }: RoommateFilterBarProps) {
  return (
    <View className="gap-3 border-b border-neutral-100 px-5 py-3">
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerClassName="gap-2"
      >
        <Chip
          label={
            filter.rentMin !== undefined || filter.rentMax !== undefined
              ? `월세 ${filter.rentMin ?? 0}~${filter.rentMax ?? '∞'}만원`
              : '월세'
          }
          active={filter.rentMin !== undefined || filter.rentMax !== undefined}
          onPress={onOpenSheet}
        />
        <Chip
          label={
            filter.gender && filter.gender !== 'any'
              ? `성별: ${GENDER_OPTIONS.find((g) => g.value === filter.gender)?.label}`
              : '성별'
          }
          active={!!filter.gender && filter.gender !== 'any'}
          onPress={onOpenSheet}
        />
        <Chip
          label={filter.regionIds?.length ? `지역 ${filter.regionIds.length}` : '지역'}
          active={!!filter.regionIds?.length}
          onPress={onOpenSheet}
        />
      </ScrollView>

      <SegmentedControl<SortKey>
        options={SORT_OPTIONS as unknown as { value: SortKey; label: string }[]}
        value={filter.sort}
        onValueChange={(v) => onFilterChange((p) => ({ ...p, sort: v }))}
        className="flex-row gap-2"
        renderItem={({ option, selected }) => (
          <View
            className={`rounded-full border px-3 py-1.5 ${
              selected ? 'border-neutral-900 bg-neutral-900' : 'border-neutral-200 bg-white'
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
    </View>
  );
}
