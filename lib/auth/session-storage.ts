import * as SecureStore from 'expo-secure-store';

const AUTH_SESSION_KEY = 'knock-in.auth-session';

export type StoredAuthIdentity = {
  name?: string;
  birth?: string;
  age?: number;
  gender?: 'MALE' | 'FEMALE';
  preferredGender?: 'same' | 'any';
  profileImageUrl?: string;
};

export type StoredAuthSession = {
  accessToken: string;
  basicInfo: boolean;
  preferenceInfo: boolean;
  savedAt: string;
  identity?: StoredAuthIdentity;
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

export async function markStoredProfileComplete(identity?: StoredAuthIdentity): Promise<void> {
  const stored = await readStoredAuthSession();
  if (!stored) return;
  if (stored.basicInfo && !identity) return;

  await writeStoredAuthSession({
    ...stored,
    basicInfo: true,
    identity: {
      ...stored.identity,
      ...identity,
    },
  });
}

export async function markStoredPreferenceComplete(): Promise<void> {
  const stored = await readStoredAuthSession();
  if (!stored || stored.preferenceInfo) return;

  await writeStoredAuthSession({
    ...stored,
    preferenceInfo: true,
  });
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
      identity: parseIdentity(parsed.identity),
    };
  } catch {
    return null;
  }
}

function parseIdentity(value: unknown): StoredAuthIdentity | undefined {
  if (!value || typeof value !== 'object') return undefined;
  const identity = value as StoredAuthIdentity;
  return {
    name: typeof identity.name === 'string' ? identity.name : undefined,
    birth: typeof identity.birth === 'string' ? identity.birth : undefined,
    age: typeof identity.age === 'number' ? identity.age : undefined,
    gender:
      identity.gender === 'MALE' || identity.gender === 'FEMALE' ? identity.gender : undefined,
    preferredGender:
      identity.preferredGender === 'same' || identity.preferredGender === 'any'
        ? identity.preferredGender
        : undefined,
    profileImageUrl:
      typeof identity.profileImageUrl === 'string' ? identity.profileImageUrl : undefined,
  };
}
