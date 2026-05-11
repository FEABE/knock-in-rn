import { forwardRef } from 'react';
import type { View as RNView } from 'react-native';

import { ButtonView, type ButtonViewProps } from './button.view';
import { useButton } from './use-button';

export type ButtonProps = Omit<
  ButtonViewProps,
  keyof ReturnType<typeof useButton>
> & {
  disabled?: boolean;
  loading?: boolean;
};

export const Button = forwardRef<RNView, ButtonProps>(function Button(
  { disabled, loading, ...rest },
  ref,
) {
  const asks = useButton({ disabled, loading });
  return <ButtonView ref={ref} {...asks} {...rest} />;
});
