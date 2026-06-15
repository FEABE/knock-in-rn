import { VerificationEmailFlowScreen } from './verification-email-flow-screen';

export function SchoolVerificationScreen() {
  return (
    <VerificationEmailFlowScreen
      kind="student"
      title="학교 이메일 인증"
      label="학교 이메일"
      iconName="school-outline"
      defaultEmail="honggildong1234@yonsei.ac.kr"
      placeholder="example@univ.ac.kr"
    />
  );
}
