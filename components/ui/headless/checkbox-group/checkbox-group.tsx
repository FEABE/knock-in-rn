import { forwardRef, type ReactNode } from 'react';
import type { View as RNView } from 'react-native';

import {
  CheckboxGroupItemView,
  CheckboxGroupRootView,
  type CheckboxGroupItemViewProps,
  type CheckboxGroupRootViewProps,
} from './checkbox-group.view';
import {
  useCheckboxGroupItem,
  useCheckboxGroupRoot,
  type UseCheckboxGroupItemProps,
  type UseCheckboxGroupRootProps,
} from './use-checkbox-group';

type RootProps = UseCheckboxGroupRootProps &
  Omit<CheckboxGroupRootViewProps, 'value'> & { children?: ReactNode };

function Root({
  value,
  defaultValue,
  onValueChange,
  disabled,
  max,
  onMaxReached,
  children,
  ...rest
}: RootProps) {
  const ctxValue = useCheckboxGroupRoot({
    value,
    defaultValue,
    onValueChange,
    disabled,
    max,
    onMaxReached,
  });
  return (
    <CheckboxGroupRootView value={ctxValue} {...rest}>
      {children}
    </CheckboxGroupRootView>
  );
}

type ItemProps = UseCheckboxGroupItemProps &
  Omit<CheckboxGroupItemViewProps, keyof ReturnType<typeof useCheckboxGroupItem>>;

const Item = forwardRef<RNView, ItemProps>(function Item(
  { value, disabled, ...rest },
  ref,
) {
  const asks = useCheckboxGroupItem({ value, disabled });
  return <CheckboxGroupItemView ref={ref} {...asks} {...rest} />;
});

export const CheckboxGroup = { Root, Item };
