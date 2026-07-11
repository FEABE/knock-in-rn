import { Stack, useGlobalSearchParams, useRouter } from 'expo-router';
import { useEffect, useRef } from 'react';
import { Alert } from 'react-native';

import { AnalyticsEvent, logEvent, onboardingTiming } from '@/lib/analytics';
import {
  compactNumbers,
  formatApiLocalDateTime,
  getAccessToken,
  lifestyleIdsFromPatternOptions,
  regionBackendId,
  roomTypeBackendId,
  saveProfileAll,
  updateVisibility,
  withComeableAtNegotiable,
  type ProfileAllRuntimeRequest,
  useLifestylePatternOptions,
  type LifestylePatternOptions,
} from '@/lib/api';
import { useSession } from '@/lib/domain';
import {
  ONBOARDING_WRITE_ENABLED,
  ONBOARDING_STEPS,
  OnboardingProvider,
  agreedTermBackendIds,
  type OnboardingValues,
  type OnboardingStep,
} from '@/lib/onboarding';
import { goExplore, goKakaoLogin } from '@/lib/navigation/routes';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function toRequest(
  values: OnboardingValues,
  lifestyleOptions: LifestylePatternOptions,
): ProfileAllRuntimeRequest {
  const { profile, room, terms, preferences } = values;
  const birth = profile.birthDate
    ? `${profile.birthDate.getFullYear()}-${String(profile.birthDate.getMonth() + 1).padStart(
        2,
        '0',
      )}-${String(profile.birthDate.getDate()).padStart(2, '0')}`
    : '';
  const isHas = room.hasRoom === true;
  const moveDate = isHas ? room.moveInDate : (preferences.moveInBy ?? room.moveInBy);
  const seekerRoomTypes = preferences.roomTypes.length ? preferences.roomTypes : room.roomTypes;
  const seekerBudgetRent = preferences.budget ?? room.budgetRent;
  const regionIds = selectedRegionIds(values);
  const roomProfileIds = compactNumbers(
    isHas ? [roomTypeBackendId(room.roomType)] : seekerRoomTypes.map(roomTypeBackendId),
  );
  return withComeableAtNegotiable({
    name: profile.name.trim(),
    birth,
    gender: profile.gender === 'female' ? 'FEMALE' : 'MALE',
    email: profile.email.trim(),
    terms: agreedTermBackendIds(terms),
    lifestyles: lifestyleIdsFromPatternOptions(
      lifestyleOptions,
      profile.scales,
      profile.lifestyleChoices,
    ),
    type: isHas ? 'OFFER' : 'SEEKER',
    minDeposit: isHas ? undefined : room.budgetDeposit.min,
    maxDeposit: isHas ? undefined : room.budgetDeposit.max,
    minMounthRent: isHas ? undefined : seekerBudgetRent.min,
    maxMounthRent: isHas ? undefined : seekerBudgetRent.max,
    comeEnableAt: moveDate ? formatApiLocalDateTime(moveDate) : '',
    region: regionIds,
    roomProfile: roomProfileIds,
    deposit: isHas ? (room.deposit ?? 0) : undefined,
    mounthRent: isHas ? (room.monthlyRent ?? 0) : undefined,
    comeableAtNegotiable: false,
  });
}

function selectedRegionIds(values: OnboardingValues): number[] {
  const { room } = values;
  return compactNumbers(
    room.hasRoom === true ? [regionBackendId(room.region)] : room.regions.map(regionBackendId),
  );
}

function validateOnboarding(
  values: OnboardingValues,
  lifestyleOptions: LifestylePatternOptions,
): string[] {
  const missing: string[] = [];
  const { profile, room, terms, preferences } = values;
  const agreedTerms = agreedTermBackendIds(terms);
  const missingScales = lifestyleOptions.scaleOptions
    .filter((scale) => profile.scales[scale.key] === undefined)
    .map((scale) => scale.label);
  const missingChoices = lifestyleOptions.choiceGroups
    .filter((group) => !profile.lifestyleChoices[group.key])
    .map((group) => group.label);

  if (!agreedTerms.length) missing.push('약관 동의: 필수 약관');
  if (!profile.name.trim()) missing.push('기본 정보: 이름');
  if (!profile.birthDate) missing.push('기본 정보: 생년월일');
  if (profile.gender !== 'male' && profile.gender !== 'female') missing.push('기본 정보: 성별');
  if (!profile.email.trim()) {
    missing.push('기본 정보: 이메일');
  } else if (!EMAIL_RE.test(profile.email.trim())) {
    missing.push('기본 정보: 올바른 이메일 형식');
  }
  if (lifestyleOptions.scaleOptions.length + lifestyleOptions.choiceGroups.length === 0) {
    missing.push('생활 패턴: 서버 기준값');
  }
  if (missingScales.length) missing.push(`생활 패턴: ${missingScales.join(', ')}`);
  if (missingChoices.length) missing.push(`생활 패턴: ${missingChoices.join(', ')}`);

  const hasRoom = room.hasRoom === true;
  const noRoom = room.hasRoom === false;
  const moveDate = hasRoom ? room.moveInDate : (preferences.moveInBy ?? room.moveInBy);
  const seekerRoomTypes = preferences.roomTypes.length ? preferences.roomTypes : room.roomTypes;
  const regionIds = selectedRegionIds(values);
  const roomProfileIds = compactNumbers(
    hasRoom ? [roomTypeBackendId(room.roomType)] : seekerRoomTypes.map(roomTypeBackendId),
  );

  if (!hasRoom && !noRoom) {
    missing.push('방 정보: 방 유무');
  } else if (hasRoom) {
    if (!room.region) missing.push('방 정보: 방 위치');
    else if (!regionIds.length) missing.push('방 정보: 저장 가능한 방 위치');
    if (room.deposit == null) missing.push('방 정보: 보증금');
    if (room.monthlyRent == null) missing.push('방 정보: 월세');
    if (!room.roomType) missing.push('방 정보: 방 형태');
    else if (!roomProfileIds.length) missing.push('방 정보: 저장 가능한 방 형태');
    if (!moveDate) missing.push('방 정보: 입주 가능 시기');
  } else {
    if (!room.regions.length) missing.push('방 정보: 선호 방 위치');
    else if (!regionIds.length) missing.push('방 정보: 저장 가능한 선호 방 위치');
    if (!seekerRoomTypes.length) missing.push('방 정보: 선호 방 형태');
    else if (!roomProfileIds.length) missing.push('방 정보: 저장 가능한 선호 방 형태');
    if (!moveDate) missing.push('방 정보: 입주 희망 시기');
  }

  return missing;
}

function validationMessage(missing: string[]): string {
  return `다음 항목을 입력해주세요.\n\n${missing.map((item) => `- ${item}`).join('\n')}`;
}

function profileSaveErrorMessage(
  message: string | undefined,
  request: ProfileAllRuntimeRequest,
): string {
  if (message && message !== '잘못된 요청입니다.') return message;

  const invalid: string[] = [];
  if (!request.terms?.length) invalid.push('필수 약관 동의');
  if (!request.lifestyles?.length) invalid.push('생활 패턴');
  if (!request.region?.length) invalid.push('방 위치');
  if (!request.roomProfile?.length) invalid.push('방 형태');
  if (!request.comeEnableAt) invalid.push('입주 가능/희망 시기');
  if (request.comeableAtNegotiable == null && request.isComeableAtNegotiable == null) {
    invalid.push('입주일 협의 여부');
  }

  if (invalid.length) {
    return `서버에 저장할 수 없는 값이 있어요.\n\n${invalid.map((item) => `- ${item}`).join('\n')}`;
  }
  return '입력값 일부가 서버 형식과 맞지 않습니다. 지역, 방 형태, 입주일을 다시 확인해주세요.';
}

export default function OnboardingLayout() {
  const router = useRouter();
  const { step } = useGlobalSearchParams<{ step?: string }>();
  const { signIn } = useSession();
  const lifestyleOptions = useLifestylePatternOptions();
  const initialStep = __DEV__ && isOnboardingStep(step) ? step : undefined;

  // 온보딩 진입 시 1회: 퍼널의 분모가 되는 onboarding_start.
  const startedRef = useRef(false);
  useEffect(() => {
    if (startedRef.current) return;
    startedRef.current = true;
    onboardingTiming.start();
    logEvent(AnalyticsEvent.ONBOARDING_START);
  }, []);

  const onComplete = async (values: OnboardingValues) => {
    const missing = validateOnboarding(values, lifestyleOptions);
    if (missing.length) {
      Alert.alert('입력 확인 필요', validationMessage(missing));
      return;
    }

    // 마지막 스텝 "완료" 탭 = 온보딩 완료 시점.
    logEvent(AnalyticsEvent.ONBOARDING_STEP_NEXT, {
      step_index: 15,
      step_name: 'room_status',
      time_on_step_ms: onboardingTiming.timeOnStepMs(),
    });
    logEvent(AnalyticsEvent.ONBOARDING_COMPLETE, {
      duration_ms: onboardingTiming.durationMs(),
      total_steps: 15,
    });

    if (ONBOARDING_WRITE_ENABLED && !getAccessToken()) {
      const signInResult = await signIn();
      if (signInResult.status !== 'success') {
        Alert.alert('로그인 필요', signInResult.message, [
          { text: '나중에', style: 'cancel', onPress: () => goExplore(router, 'replace') },
          { text: '로그인', onPress: () => goKakaoLogin(router, 'replace') },
        ]);
        return;
      }
    }

    if (ONBOARDING_WRITE_ENABLED) {
      const request = toRequest(values, lifestyleOptions);
      const res = await saveProfileAll(request);
      if (res.error || res.status !== 200) {
        Alert.alert('저장 실패', profileSaveErrorMessage(res.error?.message, request));
        return;
      }
      // profile/all 명세에는 노출 상태가 없어 완료 시점에만 분리 저장한다.
      const visibilityRes = await updateVisibility({
        status: values.profile.visibility === 'public' ? 'PUBLIC' : 'PRIVATE',
      });
      if (visibilityRes.error || visibilityRes.status !== 200) {
        Alert.alert('저장 실패', visibilityRes.error?.message ?? '잠시 후 다시 시도해주세요.');
        return;
      }
    }
    goExplore(router, 'replace');
  };

  return (
    <OnboardingProvider initialStep={initialStep} onComplete={onComplete}>
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: '#ffffff' },
        }}
      />
    </OnboardingProvider>
  );
}

function isOnboardingStep(value: string | undefined): value is OnboardingStep {
  return ONBOARDING_STEPS.includes(value as OnboardingStep);
}
