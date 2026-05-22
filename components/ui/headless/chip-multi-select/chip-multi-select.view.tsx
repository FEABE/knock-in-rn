import { type ReactNode } from 'react';
import { Pressable, View, type ViewProps } from 'react-native';

import type {
  ChipItemState,
  UseChipMultiSelectReturn,
} from './use-chip-multi-select';

export type ChipMultiSelectViewProps<V extends string = string> = Omit<
  ViewProps,
  'children'
> &
  UseChipMultiSelectReturn<V> & {
    className?: string;
    itemClassName?: string;
    renderItem: (state: ChipItemState<V>) => ReactNode;
  };

export function ChipMultiSelectView<V extends string = string>({
  items,
  value: _v,
  isDisabled: _disabled,
  isAtMax: _isAtMax,
  max: _max,
  remaining: _remaining,
  toggle: _toggle,
  clear: _clear,
  renderItem,
  itemClassName,
  ...rest
}: ChipMultiSelectViewProps<V>) {
  return (
    <View {...rest}>
      {items.map((item) => (
        <Pressable
          key={item.option.value}
          onPress={item.onPress}
          disabled={item.disabled}
          accessibilityRole="checkbox"
          accessibilityState={{
            checked: item.selected,
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
