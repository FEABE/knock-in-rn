import * as SecureStore from 'expo-secure-store';

const RECENT_SEARCHES_KEY = 'knockin.recent-searches.v1';
let memorySearches: string[] = [];

export async function readRecentSearches(): Promise<string[]> {
  try {
    if (!(await SecureStore.isAvailableAsync())) return memorySearches;
    const raw = await SecureStore.getItemAsync(RECENT_SEARCHES_KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed)
      ? parsed.filter((item): item is string => typeof item === 'string')
      : [];
  } catch {
    return memorySearches;
  }
}

export async function writeRecentSearches(searches: string[]): Promise<void> {
  memorySearches = searches;
  try {
    if (await SecureStore.isAvailableAsync()) {
      await SecureStore.setItemAsync(RECENT_SEARCHES_KEY, JSON.stringify(searches));
    }
  } catch {
    // 메모리 값은 현재 실행 중인 세션에서 계속 사용한다.
  }
}
