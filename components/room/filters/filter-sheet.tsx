import { Ionicons } from '@expo/vector-icons';
import { Pressable, Text, View } from 'react-native';

import { BottomSheet } from '@/components/ui/headless';

export type FilterSheetProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onBack?: () => void;
  title: string;
  subtitle?: string;
  children: React.ReactNode;
};

export function FilterSheet({
  open,
  onOpenChange,
  onBack,
  title,
  subtitle,
  children,
}: FilterSheetProps) {
  return (
    <BottomSheet
      open={open}
      onOpenChange={onOpenChange}
      showHandle={false}
      contentClassName="rounded-t-[20px] bg-white px-4 pb-5 pt-4"
    >
      <View className="mb-5 flex-row items-center justify-between">
        <View className="flex-row items-center gap-2">
          {onBack ? (
            <Pressable
              onPress={onBack}
              hitSlop={10}
              accessibilityRole="button"
              accessibilityLabel="이전 지역 단계"
              className="h-8 w-8 items-center justify-center active:opacity-70"
            >
              <Ionicons name="chevron-back" size={23} color="#696976" />
            </Pressable>
          ) : null}
          <Text className="text-[17px] font-bold leading-6 text-[#17171B]">{title}</Text>
          {subtitle ? (
            <Text className="text-xs leading-[18px] text-[#AAAABA]">{subtitle}</Text>
          ) : null}
        </View>
        <Pressable
          onPress={() => onOpenChange(false)}
          hitSlop={10}
          accessibilityRole="button"
          accessibilityLabel="닫기"
          className="h-8 w-8 items-center justify-center rounded-full active:bg-[#F6F6FA]"
        >
          <Ionicons name="close" size={23} color="#696976" />
        </Pressable>
      </View>

      {children}
    </BottomSheet>
  );
}
