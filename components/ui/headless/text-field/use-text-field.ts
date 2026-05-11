import { useCallback, useMemo, useState } from 'react';
import type { AccessibilityState, TextInputProps } from 'react-native';

import { useControllableState } from '../use-controllable-state';

type FocusHandler = NonNullable<TextInputProps['onFocus']>;
type BlurHandler = NonNullable<TextInputProps['onBlur']>;

export type UseTextFieldProps = {
  value?: string;
  defaultValue?: string;
  onChangeValue?: (value: string) => void;
  disabled?: boolean;
  invalid?: boolean;
  onFocus?: FocusHandler;
  onBlur?: BlurHandler;
};

export type UseTextFieldReturn = {
  value: string;
  onChangeText: (text: string) => void;
  onFocus: FocusHandler;
  onBlur: BlurHandler;
  focused: boolean;
  isDisabled: boolean;
  isInvalid: boolean;
  editable: boolean;
  accessibilityState: AccessibilityState;
};

export function useTextField({
  value,
  defaultValue = '',
  onChangeValue,
  disabled,
  invalid,
  onFocus: onFocusProp,
  onBlur: onBlurProp,
}: UseTextFieldProps): UseTextFieldReturn {
  const [internal, setInternal] = useControllableState<string>({
    value,
    defaultValue,
    onChange: onChangeValue,
  });
  const [focused, setFocused] = useState(false);

  const isDisabled = !!disabled;
  const isInvalid = !!invalid;
  const current = internal ?? '';

  const onChangeText = useCallback(
    (text: string) => setInternal(text),
    [setInternal],
  );

  const onFocus = useCallback<FocusHandler>(
    (e) => {
      setFocused(true);
      onFocusProp?.(e);
    },
    [onFocusProp],
  );

  const onBlur = useCallback<BlurHandler>(
    (e) => {
      setFocused(false);
      onBlurProp?.(e);
    },
    [onBlurProp],
  );

  const accessibilityState = useMemo<AccessibilityState>(
    () => ({ disabled: isDisabled }),
    [isDisabled],
  );

  return {
    value: current,
    onChangeText,
    onFocus,
    onBlur,
    focused,
    isDisabled,
    isInvalid,
    editable: !isDisabled,
    accessibilityState,
  };
}
