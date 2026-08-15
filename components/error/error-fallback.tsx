import type { ErrorBoundaryProps } from 'expo-router';
import { Pressable, Text, View } from 'react-native';

// 다크모드 미지원 — 흰 배경 고정.
export function ErrorFallback({ error, retry }: ErrorBoundaryProps) {
  return (
    <View className="flex-1 items-center justify-center bg-white px-9">
      <Text className="text-center text-[19px] font-bold leading-[29px] text-[#17171B]">
        일시적인 오류가 발생했어요
      </Text>
      <Text className="mt-1 text-center text-sm leading-[21px] text-[#696976]">
        잠시 후 다시 시도해 주세요.
      </Text>

      {__DEV__ ? (
        <Text className="mt-3 text-center text-xs leading-[18px] text-[#AAAABA]">
          {error.message}
        </Text>
      ) : null}

      <Pressable
        onPress={() => void retry()}
        className="mt-6 h-11 w-full max-w-[286px] items-center justify-center rounded-lg bg-[#256EF4] active:opacity-85"
      >
        <Text className="text-[15px] font-semibold text-white">다시 시도</Text>
      </Pressable>
    </View>
  );
}
