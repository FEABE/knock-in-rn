import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from 'react';

import { MOCK_SESSION_USER } from './mock';
import type { Session, UserSummary } from './types';

export type SessionContextValue = {
  session: Session;
  signIn: (user?: UserSummary) => void;
  signOut: () => void;
  setVisibility: (next: 'public' | 'hidden' | 'matched') => void;
};

const SessionContext = createContext<SessionContextValue | null>(null);

export function SessionProvider({
  children,
  initial = null,
}: {
  children: ReactNode;
  initial?: Session;
}) {
  const [session, setSession] = useState<Session>(initial);

  const signIn = useCallback((user: UserSummary = MOCK_SESSION_USER) => {
    setSession({ user, isProfileComplete: true, visibility: 'public' });
  }, []);

  const signOut = useCallback(() => setSession(null), []);

  const setVisibility = useCallback(
    (next: 'public' | 'hidden' | 'matched') => {
      setSession((prev) => (prev ? { ...prev, visibility: next } : prev));
    },
    [],
  );

  const value = useMemo<SessionContextValue>(
    () => ({ session, signIn, signOut, setVisibility }),
    [session, signIn, signOut, setVisibility],
  );

  return (
    <SessionContext.Provider value={value}>{children}</SessionContext.Provider>
  );
}

export function useSession(): SessionContextValue {
  const ctx = useContext(SessionContext);
  if (!ctx) {
    throw new Error('useSession must be used inside <SessionProvider>');
  }
  return ctx;
}
