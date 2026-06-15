import { useSafeAreaInsets } from 'react-native-safe-area-context';

export function useSafeBottomPadding(extra = 12, min = 12): number {
  const { bottom } = useSafeAreaInsets();
  return Math.max(min, bottom + extra);
}
