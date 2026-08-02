import * as SecureStore from 'expo-secure-store';

const PREFERENCE_NUDGE_SNOOZE_KEY = 'knockin.preference-nudge.snoozed-until';
const ONE_WEEK_MS = 7 * 24 * 60 * 60 * 1000;

let memorySnoozedUntil = 0;

export async function isPreferenceNudgeSnoozed(): Promise<boolean> {
  try {
    if (!(await SecureStore.isAvailableAsync())) return memorySnoozedUntil > Date.now();
    const value = await SecureStore.getItemAsync(PREFERENCE_NUDGE_SNOOZE_KEY);
    const snoozedUntil = Number(value);
    return Number.isFinite(snoozedUntil) && snoozedUntil > Date.now();
  } catch {
    return memorySnoozedUntil > Date.now();
  }
}

export async function snoozePreferenceNudgeForWeek(): Promise<void> {
  const snoozedUntil = Date.now() + ONE_WEEK_MS;
  memorySnoozedUntil = snoozedUntil;
  try {
    if (await SecureStore.isAvailableAsync()) {
      await SecureStore.setItemAsync(PREFERENCE_NUDGE_SNOOZE_KEY, String(snoozedUntil));
    }
  } catch {
    // 저장소를 사용할 수 없는 실행에서는 메모리 값으로 현재 실행 동안만 유지한다.
  }
}
