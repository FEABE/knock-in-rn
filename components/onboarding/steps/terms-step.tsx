import { Linking, ScrollView, Text, View } from 'react-native';
import { useMemo } from 'react';

import { TermsAgreement } from '@/components/ui/headless';
import { useSupportTerms } from '@/lib/api';
import { TERMS, useOnboarding, useOnboardingTerms } from '@/lib/onboarding';

import { OnboardingFooter } from '../onboarding-footer';

export function TermsStep() {
  const { terms, setTerms, isTermsValid } = useOnboardingTerms();
  const { goNext } = useOnboarding();
  const { data: apiTerms, loading } = useSupportTerms();
  const renderTerms = useMemo(
    () =>
      TERMS.map((term, index) => ({
        ...term,
        label: apiTerms?.[index]?.title ?? term.label,
      })),
    [apiTerms],
  );

  return (
    <View className="flex-1 bg-white">
      <ScrollView contentContainerClassName="gap-6 px-5 py-6">
        <View className="gap-2">
          <Text className="text-2xl font-bold text-neutral-900">
            서비스 이용을 위해{'\n'}약관에 동의해주세요
          </Text>
          <Text className="text-sm text-neutral-500">
            {loading
              ? '약관 목록을 확인하고 있어요.'
              : '필수 약관 동의 후 서비스를 이용할 수 있어요.'}
          </Text>
        </View>

        <TermsAgreement.Root
          terms={renderTerms}
          value={terms}
          onValueChange={setTerms}
          className="gap-3 rounded-2xl border border-neutral-200 p-4"
        >
          <TermsAgreement.ToggleAll className="flex-row items-center gap-3 pb-3">
            {({ checked }) => (
              <>
                <View
                  className={`h-6 w-6 items-center justify-center rounded-full border ${
                    checked ? 'border-[#256EF4] bg-[#256EF4]' : 'border-neutral-300 bg-white'
                  }`}
                >
                  {checked ? <Text className="text-xs font-bold text-white">✓</Text> : null}
                </View>
                <Text className="text-base font-semibold text-neutral-900">전체 동의</Text>
              </>
            )}
          </TermsAgreement.ToggleAll>

          <View className="h-px bg-neutral-100" />

          {renderTerms.map((term) => (
            <TermsAgreement.Item
              key={term.key}
              termKey={term.key}
              className="flex-row items-center gap-3 py-1"
            >
              {({ checked, required, label, href }) => (
                <>
                  <View
                    className={`h-5 w-5 items-center justify-center rounded ${
                      checked ? 'bg-[#256EF4]' : 'bg-neutral-200'
                    }`}
                  >
                    {checked ? <Text className="text-xs font-bold text-white">✓</Text> : null}
                  </View>
                  <View className="flex-1">
                    <Text className="text-sm text-neutral-800">
                      <Text className={required ? 'text-[#256EF4]' : 'text-neutral-400'}>
                        [{required ? '필수' : '선택'}]
                      </Text>{' '}
                      {label}
                    </Text>
                  </View>
                  {href ? (
                    <Text
                      className="text-xs text-neutral-400 underline"
                      onPress={() => Linking.openURL(href)}
                    >
                      보기
                    </Text>
                  ) : null}
                </>
              )}
            </TermsAgreement.Item>
          ))}
        </TermsAgreement.Root>
      </ScrollView>

      <OnboardingFooter canProceed={isTermsValid} onPress={goNext} />
    </View>
  );
}
