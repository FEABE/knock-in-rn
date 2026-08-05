import { Ionicons } from '@expo/vector-icons';
import { useEffect, useState } from 'react';
import { Pressable, Text, View } from 'react-native';

import { BottomSheet } from '@/components/ui/headless';

export type ReportTypeSheetViewProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  options: readonly string[];
  value?: string;
  onConfirm: (type: string) => void;
};

/**
 * 신고 유형 선택 바텀시트 (Figma 3393:50963).
 * 라디오 5종에서 하나를 고른 뒤 확인을 눌러야 선택이 확정된다.
 */
export function ReportTypeSheetView({
  open,
  onOpenChange,
  options,
  value,
  onConfirm,
}: ReportTypeSheetViewProps) {
  const [selected, setSelected] = useState<string | undefined>(value);

  useEffect(() => {
    if (open) setSelected(value);
  }, [open, value]);

  return (
    <BottomSheet
      open={open}
      onOpenChange={onOpenChange}
      showHandle={false}
      contentClassName="rounded-t-[20px] bg-white px-4 pb-5 pt-6"
    >
      <View className="flex-row items-center justify-between">
        <Text className="text-lg font-bold text-[#17171B]">신고 유형을 선택해주세요</Text>
        <Pressable
          onPress={() => onOpenChange(false)}
          hitSlop={10}
          accessibilityRole="button"
          accessibilityLabel="닫기"
          className="h-9 w-9 items-center justify-center rounded-full active:bg-[#F6F6FA]"
        >
          <Ionicons name="close" size={23} color="#696976" />
        </Pressable>
      </View>

      <View className="mt-2">
        {options.map((option) => {
          const isSelected = selected === option;
          return (
            <Pressable
              key={option}
              onPress={() => setSelected(option)}
              accessibilityRole="radio"
              accessibilityState={{ selected: isSelected }}
              className="h-12 flex-row items-center gap-3 active:opacity-80"
            >
              <View
                className={`h-6 w-6 items-center justify-center rounded-full ${
                  isSelected ? 'bg-[#4C87F6]' : 'bg-[#DADAE8]'
                }`}
              >
                <View className="h-2.5 w-2.5 rounded-full bg-white" />
              </View>
              <Text className="text-[15px] text-[#17171B]">{option}</Text>
            </Pressable>
          );
        })}
      </View>

      <Pressable
        onPress={() => {
          if (selected) onConfirm(selected);
        }}
        disabled={!selected}
        accessibilityRole="button"
        accessibilityLabel="확인"
        accessibilityState={{ disabled: !selected }}
        className={`mt-4 h-12 items-center justify-center rounded-lg ${
          selected ? 'bg-[#256EF4] active:opacity-85' : 'bg-[#ECECF3]'
        }`}
      >
        <Text className={`text-[15px] font-bold ${selected ? 'text-white' : 'text-[#AAAABA]'}`}>
          확인
        </Text>
      </Pressable>
    </BottomSheet>
  );
}
