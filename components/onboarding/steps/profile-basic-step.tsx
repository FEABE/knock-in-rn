import { useEffect, useState } from 'react';
import { ScrollView, Text, View } from 'react-native';

import { AnalyticsEvent, logEvent, onboardingTiming } from '@/lib/analytics';
import { saveProfileBasic, type ProfileBasicRequest } from '@/lib/api';
import { SegmentedControl, TextField } from '@/components/ui/headless';
import {
  ONBOARDING_WRITE_ENABLED,
  useOnboarding,
  useOnboardingProfile,
  type Gender,
} from '@/lib/onboarding';

import { OnboardingFooter } from '../onboarding-footer';

const GENDER_OPTIONS = [
  { value: 'male', label: '남성' },
  { value: 'female', label: '여성' },
] as const;

function formatBirth(date: Date | null): string {
  if (!date) return '';
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}.${m}.${d}`;
}

/** "YYYY.MM.DD" / "YYYY-MM-DD" 문자열을 Date 로. 유효하지 않으면 null. */
function parseBirth(text: string): Date | null {
  const m = text.match(/^(\d{4})[.\-/](\d{1,2})[.\-/](\d{1,2})$/);
  if (!m) return null;
  const [, y, mo, d] = m;
  const date = new Date(Number(y), Number(mo) - 1, Number(d));
  if (
    date.getFullYear() !== Number(y) ||
    date.getMonth() !== Number(mo) - 1 ||
    date.getDate() !== Number(d)
  ) {
    return null;
  }
  return date;
}

/** API 전송용 생년월일 포맷 "YYYY-MM-DD". */
function toBirthApi(date: Date | null): string {
  if (!date) return '';
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

/** 입력 중 숫자만 받아 "YYYY.MM.DD" 로 자동 포맷한다. (8자리까지) */
function formatBirthInput(text: string): string {
  const digits = text.replace(/\D/g, '').slice(0, 8);
  let out = digits.slice(0, 4);
  if (digits.length > 4) out += '.' + digits.slice(4, 6);
  if (digits.length > 6) out += '.' + digits.slice(6, 8);
  return out;
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/** 와이어프레임의 회색 채움 입력 박스 스타일 */
const INPUT_CLS = 'rounded-xl bg-neutral-100 px-4 py-3.5 text-base text-neutral-900';

export function ProfileBasicStep() {
  const { goNext, isStepSaved, markStepSaved } = useOnboarding();
  const { profile, patch } = useOnboardingProfile();
  const [birthText, setBirthText] = useState(() => formatBirth(profile.birthDate));
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  // 1/3 기본 정보 화면 진입 (스텝 컴포넌트는 진입 시마다 마운트되므로 재진입도 정확히 집계).
  useEffect(() => {
    onboardingTiming.enterStep();
    logEvent(AnalyticsEvent.ONBOARDING_STEP_VIEW, { step_index: 1, step_name: 'basic_info' });
  }, []);

  /** step_next(진입~탭 경과시간 포함) 발화 후 다음 스텝으로. */
  const proceed = () => {
    logEvent(AnalyticsEvent.ONBOARDING_STEP_NEXT, {
      step_index: 1,
      step_name: 'basic_info',
      time_on_step_ms: onboardingTiming.timeOnStepMs(),
    });
    goNext();
  };

  const onBirthChange = (text: string) => {
    const formatted = formatBirthInput(text);
    setBirthText(formatted);
    patch({ birthDate: parseBirth(formatted) });
  };

  const canProceed =
    profile.name.trim().length > 0 &&
    profile.gender !== null &&
    profile.birthDate !== null &&
    EMAIL_RE.test(profile.email);

  /** "다음" → 기본정보1 저장(POST /users/me/profile/basic) 후 다음 스텝으로. */
  const handleNext = async () => {
    // 외부 UT: 저장 비활성화 — API 없이 다음 스텝으로.
    if (!ONBOARDING_WRITE_ENABLED) {
      proceed();
      return;
    }
    if (submitting) return;
    setSubmitting(true);
    setSubmitError(null);
    try {
      const body: ProfileBasicRequest = {
        name: profile.name.trim(),
        birth: toBirthApi(profile.birthDate),
        // 'male' → 'MALE' (백엔드 enum: MALE/FEMALE)
        gender: profile.gender === 'female' ? 'FEMALE' : 'MALE',
        email: profile.email.trim(),
        // ⚠️ 백엔드 약관 테이블이 비어있음(GET /terms → terms:null).
        // 유효한 약관 ID가 없어 임시로 빈 배열 전송. 백엔드가 약관을 시드하면
        // 동의한 약관 ID 배열로 복구할 것.
        terms: [],
      };

      // 같은 데이터로 이미 저장했다면(뒤로 갔다 다시 옴) 재전송하지 않고 넘어간다.
      const signature = JSON.stringify(body);
      if (isStepSaved('profile-basic', signature)) {
        proceed();
        return;
      }

      const res = await saveProfileBasic(body);
      if (res.status !== 200 || res.error) {
        setSubmitError(res.error?.message ?? `저장에 실패했어요 (status ${res.status})`);
        return;
      }
      markStepSaved('profile-basic', signature);
      proceed();
    } catch (e) {
      setSubmitError(e instanceof Error ? e.message : '네트워크 오류가 발생했어요.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <View className="flex-1 bg-white">
      <ScrollView className="flex-1" contentContainerClassName="gap-7 px-5 py-6">
        <View className="gap-1">
          <Text className="text-2xl font-bold text-neutral-900">안녕하세요! 👋</Text>
          <Text className="text-2xl font-bold text-neutral-900">기본 정보를 알려주세요</Text>
          <Text className="mt-1 text-sm text-neutral-500">정확한 매칭을 위해 필요한 정보예요</Text>
        </View>

        <Field label="이름">
          <TextField
            value={profile.name}
            onChangeValue={(v) => patch({ name: v })}
            placeholder="이름을 입력해주세요"
            className={INPUT_CLS}
          />
        </Field>

        <View className="flex-row gap-3">
          <View className="flex-1 gap-2">
            <Text className="text-sm font-semibold text-neutral-800">생년월일</Text>
            <TextField
              value={birthText}
              onChangeValue={onBirthChange}
              placeholder="YYYY.MM.DD"
              keyboardType="numbers-and-punctuation"
              className={INPUT_CLS}
            />
          </View>
          <View className="gap-2">
            <Text className="text-sm font-semibold text-neutral-800">성별</Text>
            <SegmentedControl<Gender>
              options={GENDER_OPTIONS as unknown as { value: Gender; label: string }[]}
              value={profile.gender}
              onValueChange={(v) => patch({ gender: v })}
              className="flex-row gap-2"
              renderItem={({ option, selected }) => (
                <View
                  className={`rounded-full border px-4 py-2.5 ${
                    selected ? 'border-[#256EF4] bg-[#256EF4]/15' : 'border-neutral-300 bg-white'
                  }`}
                >
                  <Text
                    className={
                      selected ? 'text-sm font-medium text-[#256EF4]' : 'text-sm text-neutral-600'
                    }
                  >
                    {option.label}
                  </Text>
                </View>
              )}
            />
          </View>
        </View>

        <Field label="이메일">
          <TextField
            value={profile.email}
            onChangeValue={(v) => patch({ email: v })}
            placeholder="이메일을 입력해주세요"
            keyboardType="email-address"
            autoCapitalize="none"
            className={INPUT_CLS}
          />
        </Field>
      </ScrollView>

      {submitError ? (
        <View className="px-5 pb-1">
          <Text className="text-sm text-red-500">{submitError}</Text>
        </View>
      ) : null}

      <OnboardingFooter
        canProceed={canProceed}
        primaryLabel="다음"
        loading={submitting}
        onPress={handleNext}
      />
    </View>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <View className="gap-2">
      <Text className="text-sm font-semibold text-neutral-800">{label}</Text>
      {children}
    </View>
  );
}
