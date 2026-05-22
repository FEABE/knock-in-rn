import { type ReactNode } from 'react';
import { View, type ViewProps } from 'react-native';

import type { UseRegionPickerReturn } from './use-region-picker';

export type RegionPickerViewProps = Omit<ViewProps, 'children'> &
  UseRegionPickerReturn & {
    className?: string;
    children: (value: UseRegionPickerReturn) => ReactNode;
  };

export function RegionPickerView({
  children,
  value,
  query,
  setQuery,
  clearQuery,
  items,
  filteredCount,
  totalCount,
  isDisabled,
  isAtMax,
  remaining,
  toggle,
  remove,
  clear,
  ...rest
}: RegionPickerViewProps) {
  return (
    <View {...rest}>
      {children({
        value,
        query,
        setQuery,
        clearQuery,
        items,
        filteredCount,
        totalCount,
        isDisabled,
        isAtMax,
        remaining,
        toggle,
        remove,
        clear,
      })}
    </View>
  );
}
