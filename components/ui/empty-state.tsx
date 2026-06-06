import { Text, View, type ViewProps } from 'react-native';

interface EmptyStateProps extends ViewProps {
  message?: string;
}

export function EmptyState({ message = '데이터가 없습니다.', className = '', ...props }: EmptyStateProps) {
  return (
    <View
      className={`rounded-2xl border border-dashed border-neutral-200 p-10 ${className}`}
      {...props}
    >
      <Text className="text-center text-sm text-neutral-400">{message}</Text>
    </View>
  );
}
