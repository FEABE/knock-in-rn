import { forwardRef, type ReactNode } from 'react';
import type { View as RNView } from 'react-native';

import {
  RadioGroupRootView,
  RadioItemView,
  type RadioGroupRootViewProps,
  type RadioItemViewProps,
} from './radio-group.view';
import {
  useRadioGroupRoot,
  useRadioItem,
  type UseRadioGroupRootProps,
  type UseRadioItemProps,
} from './use-radio-group';

type RootProps = UseRadioGroupRootProps &
  Omit<RadioGroupRootViewProps, 'value'> & { children?: ReactNode };

function Root({
  value,
  defaultValue,
  onValueChange,
  disabled,
  name,
  children,
  ...rest
}: RootProps) {
  const ctxValue = useRadioGroupRoot({
    value,
    defaultValue,
    onValueChange,
    disabled,
    name,
  });
  return (
    <RadioGroupRootView value={ctxValue} {...rest}>
      {children}
    </RadioGroupRootView>
  );
}

type ItemProps = UseRadioItemProps &
  Omit<
    RadioItemViewProps,
    keyof ReturnType<typeof useRadioItem>
  >;

const Item = forwardRef<RNView, ItemProps>(function Item(
  { value, disabled, ...rest },
  ref,
) {
  const asks = useRadioItem({ value, disabled });
  return <RadioItemView ref={ref} {...asks} {...rest} />;
});

export const RadioGroup = { Root, Item };
