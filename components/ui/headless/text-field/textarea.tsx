import { forwardRef } from 'react';
import type { TextInput as RNTextInput } from 'react-native';

import { TextField, type TextFieldProps } from './text-field';

export type TextareaProps = TextFieldProps;

export const Textarea = forwardRef<RNTextInput, TextareaProps>(function Textarea(
  { multiline = true, textAlignVertical = 'top', numberOfLines = 4, ...rest },
  ref,
) {
  return (
    <TextField
      ref={ref}
      multiline={multiline}
      textAlignVertical={textAlignVertical}
      numberOfLines={numberOfLines}
      {...rest}
    />
  );
});
