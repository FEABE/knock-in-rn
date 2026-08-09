import { Ionicons } from '@expo/vector-icons';
import { TouchableOpacity } from 'react-native';

type HeaderBackButtonProps = {
  onPress: () => void;
  color?: string;
  accessibilityLabel?: string;
  className?: string;
};

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
      hitSlop={{ top: 12, right: 12, bottom: 12, left: 12 }}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      className={`h-10 w-10 items-center justify-center ${className}`}
      style={{ zIndex: 10 }}
    >
      <Ionicons name="chevron-back" size={24} color={color} />
    </TouchableOpacity>
  );
}
