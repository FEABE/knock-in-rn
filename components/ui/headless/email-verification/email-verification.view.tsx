import { type ReactNode } from 'react';
import { View, type ViewProps } from 'react-native';

import type { UseEmailVerificationReturn } from './use-email-verification';

export type EmailVerificationViewProps = Omit<ViewProps, 'children'> &
  UseEmailVerificationReturn & {
    className?: string;
    children: (value: UseEmailVerificationReturn) => ReactNode;
  };

export function EmailVerificationView({
  children,
  ...value
}: EmailVerificationViewProps) {
  const {
    step,
    email,
    setEmail,
    isEmailValid,
    code,
    setCode,
    isCodeFilled,
    codeLength,
    sendCode,
    verify,
    resend,
    reset,
    isSending,
    isVerifying,
    error,
    cooldown,
    canResend,
    isVerified,
    ...rest
  } = value;
  return (
    <View {...rest}>
      {children({
        step,
        email,
        setEmail,
        isEmailValid,
        code,
        setCode,
        isCodeFilled,
        codeLength,
        sendCode,
        verify,
        resend,
        reset,
        isSending,
        isVerifying,
        error,
        cooldown,
        canResend,
        isVerified,
      })}
    </View>
  );
}
