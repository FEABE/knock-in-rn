import { Stack, useRouter } from 'expo-router';
import { useEffect, useRef } from 'react';
import { Alert } from 'react-native';

import { AnalyticsEvent, logEvent, onboardingTiming } from '@/lib/analytics';
import { saveProfileAll, type ProfileAllRequest } from '@/lib/api';
import { useSession } from '@/lib/domain';
import {
  ONBOARDING_WRITE_ENABLED,
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
  return {
    name: profile.name,
    birth,
    gender: (profile.gender ?? '').toUpperCase(),
    email: profile.email,
    terms: Object.entries(terms)
      .filter(([, agreed]) => agreed)
      .map(([key]) => TERM_BACKEND_IDS[key as TermKey]),
    lifestyles: Object.entries(profile.scales).map(([k, v]) => `${k}-${v}`),
    type: isHas ? (room.roomType ?? '') : (room.roomTypes[0] ?? ''),
    minDeposit: isHas ? '' : String(room.budgetDeposit.min),
    maxDeposit: isHas ? '' : String(room.budgetDeposit.max),
    minMounthRent: isHas ? '' : String(room.budgetRent.min),
    maxMounthRent: isHas ? '' : String(room.budgetRent.max),
    comeEnableAt: moveDate ? moveDate.toISOString() : '',
    region: isHas ? (room.region ? [room.region.id] : []) : room.regions.map((r) => r.id),
    roomProfile: [],
    deposit: isHas ? String(room.deposit ?? 0) : '',
    mounthRent: isHas ? String(room.monthlyRent ?? 0) : '',
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
    // 3/3(방 상태) "완료" 탭 = 마지막 스텝 완료 시점.
    logEvent(AnalyticsEvent.ONBOARDING_STEP_NEXT, {
      step_index: 3,
      step_name: 'room_status',
      time_on_step_ms: onboardingTiming.timeOnStepMs(),
    });
    logEvent(AnalyticsEvent.ONBOARDING_COMPLETE, {
      duration_ms: onboardingTiming.durationMs(),
      total_steps: 3,
    });

    if (ONBOARDING_WRITE_ENABLED) {
      const res = await saveProfileAll(toRequest(values));
      if (res.error || res.status !== 200) {
        Alert.alert('저장 실패', res.error?.message ?? '잠시 후 다시 시도해주세요.');
        return;
      }
    }
    // 기본 프로필 완성 → 로그인 처리 후 Phase 2(선호조건) 제안 화면으로.
    // from=onboarding 이면 "나중에/완료" 시 탐색으로 빠진다.
    signIn();
    router.replace({ pathname: '/mypage/preferences', params: { from: 'onboarding' } } as never);
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
