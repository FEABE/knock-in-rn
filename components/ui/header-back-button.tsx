import { Ionicons } from '@expo/vector-icons';
import { TouchableOpacity } from 'react-native';

type HeaderBackButtonProps = {
  onPress: () => void;
  color?: string;
  accessibilityLabel?: string;
  className?: string;
};

/**
 * 헤더 뒤로가기 버튼 표준. 박스 44×44 + hitSlop(상하 8 / 좌우 14)로
 * 실효 터치 영역을 최소 48dp 이상(60×72)으로 확보한다. 아이콘 크기는 24 고정.
 */
export function HeaderBackButton({
  onPress,
  color = '#696976',
  accessibilityLabel = '뒤로 가기',
  className = '',
}: HeaderBackButtonProps) {
  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.6}
      hitSlop={{ top: 8, right: 14, bottom: 8, left: 14 }}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      className={`h-11 w-11 items-center justify-center ${className}`}
      style={{ zIndex: 10 }}
    >
      <Ionicons name="chevron-back" size={24} color={color} />
    </TouchableOpacity>
  );
}
