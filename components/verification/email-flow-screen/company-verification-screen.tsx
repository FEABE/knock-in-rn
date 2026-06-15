import { VerificationEmailFlowScreen } from './verification-email-flow-screen';

export function CompanyVerificationScreen() {
  return (
    <VerificationEmailFlowScreen
      kind="company"
      title="회사 이메일 인증"
      label="회사 이메일"
      iconName="business-outline"
      defaultEmail="honggildong1234@samsung.com"
      placeholder="name@company.com"
    />
  );
}
