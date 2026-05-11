import { forwardRef } from 'react';
import type { View as RNView } from 'react-native';

import { ToggleView, type ToggleViewProps } from './toggle.view';
import { useToggle, type UseToggleProps } from './use-toggle';

export type ToggleProps = Omit<
  ToggleViewProps,
  keyof ReturnType<typeof useToggle>
> &
  UseToggleProps;

export const Toggle = forwardRef<RNView, ToggleProps>(function Toggle(
  { checked, defaultChecked, onCheckedChange, disabled, ...rest },
  ref,
) {
  const asks = useToggle({ checked, defaultChecked, onCheckedChange, disabled });
  return <ToggleView ref={ref} {...asks} {...rest} />;
});
