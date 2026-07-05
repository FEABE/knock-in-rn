/**
 * UT Firebase Analytics 래퍼.
 *
 * - 모든 이벤트에 공통 파라미터(session_id, ts)를 자동으로 포함한다.
 * - 네이티브 모듈이 없는 환경(web / 네이티브 리빌드 전)에서는 조용히 무시한다.
 *   analytics는 실패해도 사용자 흐름을 막지 않는다.
 *
 * 사용 예) logEvent(AnalyticsEvent.ROOM_CARD_TAP, { room_id: post.id })
 */
import { Platform } from 'react-native';
import * as Crypto from 'expo-crypto';

// RNFirebase v24의 namespaced 헬퍼(logScreenView 등)는 정상 동작하지만 모듈러 마이그레이션
// deprecation 경고를 콘솔에 찍는다. v24.1.0 에 고정돼 있어 다음 메이저 전까지 안전하므로
// 공식 억제 플래그로 노이즈만 끈다. (screen_view 의 firebase_screen 은 예약어라 logEvent 로는
// 보낼 수 없어, 화면명을 제대로 기록하는 logScreenView 를 계속 사용한다.)
(globalThis as { RNFB_SILENCE_MODULAR_DEPRECATION_WARNINGS?: boolean }).RNFB_SILENCE_MODULAR_DEPRECATION_WARNINGS =
  true;

export { AnalyticsEvent, ONBOARDING_STEP_META } from './events';
export type { AnalyticsEventName } from './events';
export { ScreenViewTracker } from './screen-tracker';

/** 앱 실행 시 1회 생성되는 세션 고유값(UUID). 앱이 켜진 동안 동일 값 유지. */
export const SESSION_ID = Crypto.randomUUID();

export type AnalyticsParams = Record<
  string,
  string | number | boolean | null | undefined
>;

// 네이티브 모듈 지연 로드 (web/리빌드 전엔 null).
let analyticsMod: any = null;
if (Platform.OS !== 'web') {
  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    analyticsMod = require('@react-native-firebase/analytics');
  } catch {
    analyticsMod = null;
  }
}

function getInstance(): any | null {
  if (!analyticsMod) return null;
  try {
    return analyticsMod.getAnalytics();
  } catch {
    return null;
  }
}

/** undefined/null 파라미터 제거 (Firebase는 undefined 값을 거부). */
function clean(params?: AnalyticsParams): Record<string, string | number | boolean> {
  const out: Record<string, string | number | boolean> = {};
  if (!params) return out;
  for (const [k, v] of Object.entries(params)) {
    if (v !== undefined && v !== null) out[k] = v;
  }
  return out;
}

function withCommon(params?: AnalyticsParams) {
  return {
    session_id: SESSION_ID,
    ts: Date.now(),
    ...clean(params),
  };
}

/** 이벤트 발화. 공통 파라미터(session_id, ts)는 자동 포함된다. */
export async function logEvent(name: string, params?: AnalyticsParams): Promise<void> {
  const payload = withCommon(params);
  const instance = getInstance();
  if (!instance) {
    return;
  }
  try {
    await analyticsMod.logEvent(instance, name, payload);
  } catch {
    return;
  }
}

/**
 * 화면 진입 로깅 (Firebase screen_view). 체류 시간은 Firebase가 자동 집계.
 *
 * logScreenView 는 화면명을 예약 파라미터(firebase_screen/_class)로 네이티브에 직접 기록한다.
 * 이 예약어는 logEvent 로는 보낼 수 없으므로(“reserved prefix” 거부) 전용 헬퍼를 쓴다.
 * deprecation 경고는 상단 억제 플래그로 끈다.
 */
export async function logScreenView(screenName: string): Promise<void> {
  const instance = getInstance();
  if (!instance) {
    return;
  }
  try {
    await analyticsMod.logScreenView(instance, {
      screen_name: screenName,
      screen_class: screenName,
    });
  } catch {
    return;
  }
}

/**
 * 온보딩 퍼널 타이밍 측정용 모듈 상태.
 * - start(): onboarding_start 시점 기록 → onboarding_complete 의 duration_ms 계산.
 * - enterStep(): 각 스텝 진입 시점 기록 → onboarding_step_next 의 time_on_step_ms 계산.
 */
let onboardingStartAt: number | null = null;
let stepEnteredAt: number | null = null;

export const onboardingTiming = {
  start() {
    onboardingStartAt = Date.now();
  },
  durationMs(): number | undefined {
    return onboardingStartAt != null ? Date.now() - onboardingStartAt : undefined;
  },
  enterStep() {
    stepEnteredAt = Date.now();
  },
  timeOnStepMs(): number | undefined {
    return stepEnteredAt != null ? Date.now() - stepEnteredAt : undefined;
  },
};
