import { Pressable, Text, View } from 'react-native';

import { FilterSheet } from './filter-sheet';
import { useGenderFilterSheet } from './use-gender-filter-sheet';

export type GenderFilterValue = 'any' | 'male' | 'female';

const OPTIONS: { value: GenderFilterValue; label: string }[] = [
  { value: 'any', label: '전체' },
  { value: 'female', label: '여성' },
];

export function GenderFilterBody({
  value,
  onChange,
}: {
  value: GenderFilterValue;
  onChange: (next: GenderFilterValue) => void;
}) {
  return (
    <View className="gap-5 pb-2">
      {OPTIONS.map((opt) => {
        const selected = value === opt.value;
        return (
          <Pressable
            key={opt.value}
            onPress={() => onChange(opt.value)}
            className="flex-row items-center gap-3 active:opacity-70"
          >
            <View
              className={`h-5 w-5 items-center justify-center rounded-full border-2 ${
                selected ? 'border-[#256EF4]' : 'border-[#DADAE8]'
              }`}
            >
              {selected ? <View className="h-2.5 w-2.5 rounded-full bg-[#256EF4]" /> : null}
            </View>
            <Text className="text-[15px] leading-[23px] text-[#17171B]">{opt.label}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}

export type GenderFilterSheetProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  value: GenderFilterValue;
  onChange: (next: GenderFilterValue) => void;
};

export function GenderFilterSheet({ open, onOpenChange, value, onChange }: GenderFilterSheetProps) {
  const { draft, setDraft } = useGenderFilterSheet({ open, value, onChange });

  const handleChange = (next: GenderFilterValue) => {
    setDraft(next);
    onChange(next);
  };

  return (
    <FilterSheet open={open} onOpenChange={onOpenChange} title="성별">
      <GenderFilterBody value={draft} onChange={handleChange} />
    </FilterSheet>
  );
}
