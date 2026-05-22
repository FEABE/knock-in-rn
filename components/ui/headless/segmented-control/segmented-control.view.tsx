import { type ReactNode } from 'react';
import {
  Pressable,
  View,
  type ViewProps,
} from 'react-native';

import type {
  SegmentItemState,
  UseSegmentedControlReturn,
} from './use-segmented-control';

export type SegmentedControlViewProps<V extends string = string> = Omit<
  ViewProps,
  'children'
> &
  UseSegmentedControlReturn<V> & {
    className?: string;
    itemClassName?: string;
    renderItem: (state: SegmentItemState<V>) => ReactNode;
  };

export function SegmentedControlView<V extends string = string>({
  items,
  value: _value,
  isDisabled: _isDisabled,
  setValue: _setValue,
  renderItem,
  itemClassName,
  ...rest
}: SegmentedControlViewProps<V>) {
  return (
    <View accessibilityRole="radiogroup" {...rest}>
      {items.map((item) => (
        <Pressable
          key={item.option.value}
          onPress={item.onPress}
          disabled={item.disabled}
          accessibilityRole="radio"
          accessibilityState={{
            selected: item.selected,
            disabled: item.disabled,
          }}
          className={itemClassName}
        >
          {renderItem(item)}
        </Pressable>
      ))}
    </View>
  );
}
