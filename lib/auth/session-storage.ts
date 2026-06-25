import * as SecureStore from 'expo-secure-store';

const AUTH_SESSION_KEY = 'knock-in.auth-session';

export type StoredAuthSession = {
  accessToken: string;
  basicInfo: boolean;
  preferenceInfo: boolean;
  savedAt: string;
};

let memoryFallback: StoredAuthSession | null = null;

export async function readStoredAuthSession(): Promise<StoredAuthSession | null> {
  try {
    if (!(await SecureStore.isAvailableAsync())) return memoryFallback;
    const raw = await SecureStore.getItemAsync(AUTH_SESSION_KEY);
    if (!raw) return null;
    return parseStoredAuthSession(raw);
  } catch {
    return memoryFallback;
  }
}

export async function writeStoredAuthSession(session: StoredAuthSession): Promise<void> {
  memoryFallback = session;
  try {
    if (await SecureStore.isAvailableAsync()) {
      await SecureStore.setItemAsync(AUTH_SESSION_KEY, JSON.stringify(session));
    }
  } catch {
    // Keep the in-memory fallback for the current app session.
  }
}

export async function clearStoredAuthSession(): Promise<void> {
  memoryFallback = null;
  try {
    if (await SecureStore.isAvailableAsync()) {
      await SecureStore.deleteItemAsync(AUTH_SESSION_KEY);
    }
  } catch {
    // Nothing else to clear.
  }
}

function parseStoredAuthSession(raw: string): StoredAuthSession | null {
  try {
    const parsed = JSON.parse(raw) as Partial<StoredAuthSession>;
    if (!parsed.accessToken) return null;
    return {
      accessToken: parsed.accessToken,
      basicInfo: parsed.basicInfo === true,
      preferenceInfo: parsed.preferenceInfo === true,
      savedAt: parsed.savedAt ?? new Date().toISOString(),
    };
  } catch {
    return null;
  }
}
