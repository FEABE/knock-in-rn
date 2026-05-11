import { forwardRef } from 'react';
import type { View as RNView } from 'react-native';

import { CheckboxView, type CheckboxViewProps } from './checkbox.view';
import { useCheckbox, type UseCheckboxProps } from './use-checkbox';

export type CheckboxProps = Omit<
  CheckboxViewProps,
  keyof ReturnType<typeof useCheckbox>
> &
  UseCheckboxProps;

export const Checkbox = forwardRef<RNView, CheckboxProps>(function Checkbox(
  { checked, defaultChecked, onCheckedChange, disabled, ...rest },
  ref,
) {
  const asks = useCheckbox({ checked, defaultChecked, onCheckedChange, disabled });
  return <CheckboxView ref={ref} {...asks} {...rest} />;
});
