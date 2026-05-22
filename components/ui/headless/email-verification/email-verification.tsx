import {
  EmailVerificationView,
  type EmailVerificationViewProps,
} from './email-verification.view';
import {
  useEmailVerification,
  type UseEmailVerificationProps,
} from './use-email-verification';

export type EmailVerificationProps = UseEmailVerificationProps &
  Omit<
    EmailVerificationViewProps,
    keyof ReturnType<typeof useEmailVerification>
  >;

export function EmailVerification({
  domainSuffix,
  codeLength,
  resendCooldownSec,
  sendCode,
  verifyCode,
  initialEmail,
  ...rest
}: EmailVerificationProps) {
  const asks = useEmailVerification({
    domainSuffix,
    codeLength,
    resendCooldownSec,
    sendCode,
    verifyCode,
    initialEmail,
  });
  return <EmailVerificationView {...asks} {...rest} />;
}
