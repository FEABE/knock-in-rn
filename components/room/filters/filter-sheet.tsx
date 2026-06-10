import { Pressable, Text, View } from 'react-native';

import { BottomSheet } from '@/components/ui/headless';

export type FilterSheetProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  onReset: () => void;
  onApply: () => void;
  children: React.ReactNode;
};

export function FilterSheet({
  open,
  onOpenChange,
  title,
  onReset,
  onApply,
  children,
}: FilterSheetProps) {
  return (
    <BottomSheet
      open={open}
      onOpenChange={onOpenChange}
      contentClassName="rounded-t-2xl bg-white px-5 pb-8 pt-3"
    >
      <Text className="mb-4 mt-1 text-lg font-bold text-neutral-900">
        {title}
      </Text>

      <View className="gap-4">{children}</View>

      <View className="mt-6 flex-row gap-3">
        <Pressable
          onPress={onReset}
          className="h-12 flex-1 items-center justify-center rounded-xl border border-neutral-200 active:bg-neutral-50"
        >
          <Text className="text-sm font-medium text-neutral-700">초기화</Text>
        </Pressable>
        <Pressable
          onPress={() => {
            onApply();
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
