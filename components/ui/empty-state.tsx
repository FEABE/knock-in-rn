import { Text, View, type ViewProps } from 'react-native';

import { EmptyHouseArtwork } from './ready-to-dev-assets';

interface EmptyStateProps extends ViewProps {
  message?: string;
}

export function EmptyState({
  message = '데이터가 없습니다.',
  className = '',
  ...props
}: EmptyStateProps) {
  return (
    <View className={`items-center gap-3 px-8 py-10 ${className}`} {...props}>
      <EmptyHouseArtwork size={160} />
      <Text className="text-center text-[17px] font-semibold text-[#17171B]">{message}</Text>
      <Text className="text-center text-sm text-[#AAAABA]">다른 조건으로 다시 찾아보세요</Text>
    </View>
  );
}
