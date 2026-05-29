import { useState } from 'react';
import { Pressable, Text, View } from 'react-native';

import { FilterSheet } from './filter-sheet';

export type GenderFilterValue = 'any' | 'male' | 'female';

const OPTIONS: { value: GenderFilterValue; label: string }[] = [
  { value: 'any', label: '성별 무관' },
  { value: 'male', label: '남성만' },
  { value: 'female', label: '여성만' },
];

export type GenderFilterSheetProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  value: GenderFilterValue;
  onChange: (next: GenderFilterValue) => void;
};

export function GenderFilterSheet({
  open,
  onOpenChange,
  value,
  onChange,
}: GenderFilterSheetProps) {
  const [draft, setDraft] = useState<GenderFilterValue>(value);

  return (
    <FilterSheet
      open={open}
      onOpenChange={onOpenChange}
      title="성별"
      onReset={() => setDraft('any')}
      onApply={() => onChange(draft)}
    >
      <View className="gap-2">
        {OPTIONS.map((opt) => {
          const selected = draft === opt.value;
          return (
            <Pressable
              key={opt.value}
              onPress={() => setDraft(opt.value)}
              className={`items-center rounded-xl border py-3 active:opacity-80 ${
                selected
                  ? 'border-violet-600 bg-violet-50'
                  : 'border-neutral-200 bg-white'
              }`}
            >
              <Text
                className={
                  selected
                    ? 'text-sm font-medium text-violet-700'
                    : 'text-sm text-neutral-700'
                }
              >
                {opt.label}
              </Text>
            </Pressable>
          );
        })}
      </View>
    </FilterSheet>
  );
}
