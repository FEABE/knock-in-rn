import { Stack, useRouter } from 'expo-router';
import { useEffect, useRef } from 'react';
import { Alert } from 'react-native';

import { AnalyticsEvent, logEvent, onboardingTiming } from '@/lib/analytics';
import {
  compactNumbers,
  LIFESTYLE_BACKEND_IDS,
  LIFESTYLE_CHOICE_BACKEND_IDS,
  regionBackendId,
  roomTypeBackendId,
  saveProfileAll,
  type ProfileAllRequest,
} from '@/lib/api';
import { useSession } from '@/lib/domain';
import {
  ONBOARDING_WRITE_ENABLED,
  ONBOARDING_STEPS,
  OnboardingProvider,
  TERM_BACKEND_IDS,
  type OnboardingValues,
  type TermKey,
} from '@/lib/onboarding';

function toRequest(values: OnboardingValues): ProfileAllRequest {
  const { profile, room, terms } = values;
  const birth = profile.birthDate
    ? `${profile.birthDate.getFullYear()}-${String(profile.birthDate.getMonth() + 1).padStart(
        2,
        '0',
      )}-${String(profile.birthDate.getDate()).padStart(2, '0')}`
    : '';
  const isHas = room.hasRoom === true;
  const moveDate = isHas ? room.moveInDate : room.moveInBy;
  const roomTypeId = roomTypeBackendId(isHas ? room.roomType : room.roomTypes[0]);
  return {
    name: profile.name,
    birth,
    gender: profile.gender === 'female' ? 'FEMALE' : 'MALE',
    email: profile.email,
    terms: Object.entries(terms)
      .filter(([, agreed]) => agreed)
      .map(([key]) => TERM_BACKEND_IDS[key as TermKey]),
    lifestyles: compactNumbers([
      ...Object.keys(profile.scales).map(
        (key) => LIFESTYLE_BACKEND_IDS[key as keyof typeof LIFESTYLE_BACKEND_IDS],
      ),
      profile.lifestyle.smoking
        ? LIFESTYLE_CHOICE_BACKEND_IDS.smoking[profile.lifestyle.smoking]
        : undefined,
      profile.lifestyle.pet ? LIFESTYLE_CHOICE_BACKEND_IDS.pet[profile.lifestyle.pet] : undefined,
    ]),
    type: isHas ? 'OFFER' : 'SEEKER',
    minDeposit: isHas ? undefined : room.budgetDeposit.min,
    maxDeposit: isHas ? undefined : room.budgetDeposit.max,
    minMounthRent: isHas ? undefined : room.budgetRent.min,
    maxMounthRent: isHas ? undefined : room.budgetRent.max,
    comeEnableAt: moveDate ? moveDate.toISOString() : '',
    region: compactNumbers(
      isHas ? [regionBackendId(room.region)] : room.regions.map(regionBackendId),
    ),
    roomProfile: compactNumbers([roomTypeId]),
    deposit: isHas ? (room.deposit ?? 0) : undefined,
    mounthRent: isHas ? (room.monthlyRent ?? 0) : undefined,
    comeableAtNegotiable: false,
  };
}

export default function OnboardingLayout() {
  const router = useRouter();
  const { signIn } = useSession();

  // 온보딩 진입 시 1회: 퍼널의 분모가 되는 onboarding_start.
  const startedRef = useRef(false);
  useEffect(() => {
    if (startedRef.current) return;
    startedRef.current = true;
    onboardingTiming.start();
    logEvent(AnalyticsEvent.ONBOARDING_START);
  }, []);

  const onComplete = async (values: OnboardingValues) => {
    // 마지막 스텝 "완료" 탭 = 온보딩 완료 시점.
    logEvent(AnalyticsEvent.ONBOARDING_STEP_NEXT, {
      step_index: ONBOARDING_STEPS.length,
      step_name: 'preferences',
      time_on_step_ms: onboardingTiming.timeOnStepMs(),
    });
    logEvent(AnalyticsEvent.ONBOARDING_COMPLETE, {
      duration_ms: onboardingTiming.durationMs(),
      total_steps: ONBOARDING_STEPS.length,
    });

    if (ONBOARDING_WRITE_ENABLED) {
      const res = await saveProfileAll(toRequest(values));
      if (res.error || res.status !== 200) {
        Alert.alert('저장 실패', res.error?.message ?? '잠시 후 다시 시도해주세요.');
        return;
      }
    }
    // 기본 프로필 완성 → 로그인 처리 후 탐색으로 진입.
    const signInResult = await signIn();
    if (signInResult.status !== 'success') {
      Alert.alert('로그인 필요', signInResult.message, [
        { text: '나중에', style: 'cancel', onPress: () => router.replace('/explore' as never) },
        { text: '로그인', onPress: () => router.replace('/kakao-login' as never) },
      ]);
      return;
    }
    router.replace('/explore' as never);
  };

  return (
    <OnboardingProvider onComplete={onComplete}>
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: '#ffffff' },
        }}
      />
    </OnboardingProvider>
  );
}
