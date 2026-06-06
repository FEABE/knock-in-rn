import { Pressable, Text, View, type ViewProps } from 'react-native';

interface ErrorStateProps extends ViewProps {
  message?: string;
  detail?: string;
  onRetry?: () => void;
}

export function ErrorState({
  message = '문제가 발생했습니다',
  detail,
  onRetry,
  className = '',
  ...props
}: ErrorStateProps) {
  return (
    <View className={`items-center gap-3 py-16 ${className}`} {...props}>
      <Text className="text-sm text-neutral-500">{message}</Text>
      {detail ? <Text className="text-xs text-neutral-400">{detail}</Text> : null}
      {onRetry ? (
        <Pressable
          onPress={onRetry}
          className="rounded-full bg-neutral-100 px-5 py-2.5 active:opacity-80"
        >
          <Text className="text-sm text-neutral-700">다시 시도</Text>
        </Pressable>
      ) : null}
    </View>
  );
}
