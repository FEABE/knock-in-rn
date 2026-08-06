import { Ionicons } from '@expo/vector-icons';
import { Pressable, Text, View } from 'react-native';

import {
  EmailVerification,
  TextField,
  type EmailVerificationProps,
} from '@/components/ui/headless';

export type EmailVerificationFormProps = {
  title: string;
  description: string;
  emailPlaceholder: string;
  domainSuffix?: string;
  onVerified?: () => void;
} & Pick<EmailVerificationProps, 'sendCode' | 'verifyCode'>;

export function EmailVerificationForm({
  title,
  description,
  emailPlaceholder,
  domainSuffix,
  onVerified,
  sendCode,
  verifyCode,
}: EmailVerificationFormProps) {
  return (
    <View className="gap-6">
      <View className="gap-1">
        <Text className="text-2xl font-bold text-neutral-900">{title}</Text>
        <Text className="text-sm text-neutral-500">{description}</Text>
      </View>

      <EmailVerification
        domainSuffix={domainSuffix}
        sendCode={
          sendCode ??
          (async () => {
            await new Promise((r) => setTimeout(r, 300));
          })
        }
        verifyCode={
          verifyCode ??
          (async (_, code) => {
            await new Promise((r) => setTimeout(r, 300));
            return code === '123456';
          })
        }
      >
        {({
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
        }) => (
          <View className="gap-4">
            <View className="gap-2">
              <Text className="text-sm font-semibold text-neutral-800">이메일</Text>
              <TextField
                value={email}
                onChangeValue={setEmail}
                placeholder={emailPlaceholder}
                autoCapitalize="none"
                keyboardType="email-address"
                disabled={step !== 'enter-email'}
                className={`rounded-xl border px-4 py-3 text-base ${
                  step === 'enter-email'
                    ? 'border-neutral-200 bg-white'
                    : 'border-neutral-100 bg-neutral-50 text-neutral-500'
                }`}
              />
              {step === 'enter-email' ? (
                <Pressable
                  onPress={sendCode}
                  disabled={!isEmailValid || isSending}
                  className={`h-12 items-center justify-center rounded-xl ${
                    isEmailValid && !isSending ? 'bg-[#256EF4] active:opacity-90' : 'bg-neutral-300'
                  }`}
                >
                  <Text className="text-sm font-semibold text-white">
                    {isSending ? '전송 중...' : '인증코드 받기'}
                  </Text>
                </Pressable>
              ) : null}
            </View>

            {step !== 'enter-email' ? (
              <View className="gap-2">
                <View className="flex-row items-center justify-between">
                  <Text className="text-sm font-semibold text-neutral-800">
                    인증코드 ({codeLength}자리)
                  </Text>
                  {isVerified ? (
                    <View className="flex-row items-center gap-1">
                      <Ionicons name="checkmark-circle" size={14} color="#059669" />
                      <Text className="text-xs text-emerald-600">인증 완료</Text>
                    </View>
                  ) : cooldown > 0 ? (
                    <Text className="text-xs text-neutral-400">{cooldown}초 후 재전송 가능</Text>
                  ) : null}
                </View>
                <TextField
                  value={code}
                  onChangeValue={(t) =>
                    setCode(t.replace(/[^0-9a-zA-Z]/g, '').slice(0, codeLength))
                  }
                  placeholder="인증코드 입력"
                  keyboardType="default"
                  autoCapitalize="none"
                  maxLength={codeLength}
                  disabled={isVerified}
                  className={`rounded-xl border px-4 py-3 text-center text-xl tracking-[8px] ${
                    isVerified
                      ? 'border-emerald-300 bg-emerald-50 text-emerald-700'
                      : 'border-neutral-200 bg-white'
                  }`}
                />
                {!isVerified ? (
                  <View className="flex-row gap-2">
                    <Pressable
                      onPress={resend}
                      disabled={!canResend}
                      className={`flex-1 items-center justify-center rounded-xl border py-3 ${
                        canResend
                          ? 'border-neutral-300 bg-white'
                          : 'border-neutral-100 bg-neutral-50'
                      }`}
                    >
                      <Text
                        className={
                          canResend
                            ? 'text-sm font-medium text-neutral-800'
                            : 'text-sm text-neutral-400'
                        }
                      >
                        재전송
                      </Text>
                    </Pressable>
                    <Pressable
                      onPress={verify}
                      disabled={!isCodeFilled || isVerifying}
                      className={`flex-[2] items-center justify-center rounded-xl py-3 ${
                        isCodeFilled && !isVerifying
                          ? 'bg-[#256EF4] active:opacity-90'
                          : 'bg-neutral-300'
                      }`}
                    >
                      <Text className="text-sm font-semibold text-white">
                        {isVerifying ? '확인 중...' : '인증하기'}
                      </Text>
                    </Pressable>
                  </View>
                ) : (
                  <Pressable
                    onPress={() => onVerified?.()}
                    className="h-12 items-center justify-center rounded-xl bg-[#256EF4] active:opacity-90"
                  >
                    <Text className="text-sm font-semibold text-white">완료</Text>
                  </Pressable>
                )}
              </View>
            ) : null}

            {error ? <Text className="text-xs text-red-500">{error}</Text> : null}

            {step !== 'enter-email' && !isVerified ? (
              <Pressable onPress={reset} className="self-start">
                <Text className="text-xs text-neutral-400 underline">이메일 다시 입력</Text>
              </Pressable>
            ) : null}
          </View>
        )}
      </EmailVerification>
    </View>
  );
}
