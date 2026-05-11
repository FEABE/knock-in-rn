import { forwardRef } from 'react';
import type { TextInput as RNTextInput, TextInputProps } from 'react-native';

import { TextFieldView, type TextFieldViewProps } from './text-field.view';
import { useTextField, type UseTextFieldProps } from './use-text-field';

export type TextFieldProps = Omit<
  TextInputProps,
  'value' | 'onChangeText' | 'editable'
> &
  UseTextFieldProps & {
    className?: string;
  };

export const TextField = forwardRef<RNTextInput, TextFieldProps>(
  function TextField(
    {
      value,
      defaultValue,
      onChangeValue,
      disabled,
      invalid,
      onFocus,
      onBlur,
      ...rest
    },
    ref,
  ) {
    const asks = useTextField({
      value,
      defaultValue,
      onChangeValue,
      disabled,
      invalid,
      onFocus,
      onBlur,
    });
    return (
      <TextFieldView ref={ref} {...asks} {...(rest as TextFieldViewProps)} />
    );
  },
);
