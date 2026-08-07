import { forwardRef, type ReactNode } from 'react';
import {
  Platform,
  TextInput,
  View,
  type StyleProp,
  type TextInputProps,
  type TextInput as RNTextInput,
  type TextStyle,
  type ViewProps,
} from 'react-native';

import type { UseTextFieldReturn } from './use-text-field';

export type TextFieldState = {
  focused: boolean;
  disabled: boolean;
  invalid: boolean;
};

export type TextFieldViewProps = Omit<
  TextInputProps,
  'value' | 'onChangeText' | 'onFocus' | 'onBlur' | 'editable'
> &
  UseTextFieldReturn & {
    className?: string;
  };

export const TextFieldView = forwardRef<RNTextInput, TextFieldViewProps>(function TextFieldView(
  {
    focused: _focused,
    isDisabled: _disabled,
    isInvalid: _invalid,
    placeholderTextColor = '#AAAABA',
    selectionColor = '#256EF4',
    multiline,
    textAlignVertical = multiline ? 'top' : 'center',
    style,
    ...inputProps
  },
  ref,
) {
  const normalizedStyle: StyleProp<TextStyle> = [
    !multiline
      ? {
          includeFontPadding: false,
          paddingBottom: 0,
          paddingTop: 0,
          ...(Platform.OS === 'ios' ? { lineHeight: undefined } : null),
        }
      : null,
    style,
  ];

  return (
    <TextInput
      ref={ref}
      placeholderTextColor={placeholderTextColor}
      selectionColor={selectionColor}
      multiline={multiline}
      textAlignVertical={textAlignVertical}
      style={normalizedStyle}
      {...inputProps}
    />
  );
});

export type TextFieldFrameProps = ViewProps & {
  state: TextFieldState;
  children: ReactNode;
  className?: string;
};

export function TextFieldFrame({ state: _state, children, ...rest }: TextFieldFrameProps) {
  return <View {...rest}>{children}</View>;
}
