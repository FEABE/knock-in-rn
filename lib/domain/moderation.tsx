import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';

import { useBlockedUsers } from '@/lib/api/use-account';

export type ModerationContextValue = {
  blockedUserIds: Set<string>;
  blockedPostIds: Set<string>;
  isUserBlocked: (id: string) => boolean;
  isPostBlocked: (id: string) => boolean;
  blockUser: (id: string) => void;
  unblockUser: (id: string) => void;
  blockPost: (id: string) => void;
  unblockPost: (id: string) => void;
};

const ModerationContext = createContext<ModerationContextValue | null>(null);

export function ModerationProvider({ children }: { children: ReactNode }) {
  const { data: apiBlockedUsers } = useBlockedUsers();
  const [blockedUserIds, setBlockedUserIds] = useState<Set<string>>(new Set());
  const [blockedPostIds, setBlockedPostIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (!apiBlockedUsers) return;
    setBlockedUserIds(new Set(apiBlockedUsers.map((user) => user.userId)));
  }, [apiBlockedUsers]);

  const blockUser = useCallback((id: string) => {
    setBlockedUserIds((prev) => new Set(prev).add(id));
  }, []);
  const unblockUser = useCallback((id: string) => {
    setBlockedUserIds((prev) => {
      const next = new Set(prev);
      next.delete(id);
      return next;
    });
  }, []);
  const blockPost = useCallback((id: string) => {
    setBlockedPostIds((prev) => new Set(prev).add(id));
  }, []);
  const unblockPost = useCallback((id: string) => {
    setBlockedPostIds((prev) => {
      const next = new Set(prev);
      next.delete(id);
      return next;
    });
  }, []);

  const value = useMemo<ModerationContextValue>(
    () => ({
      blockedUserIds,
      blockedPostIds,
      isUserBlocked: (id) => blockedUserIds.has(id),
      isPostBlocked: (id) => blockedPostIds.has(id),
      blockUser,
      unblockUser,
      blockPost,
      unblockPost,
    }),
    [blockedUserIds, blockedPostIds, blockUser, unblockUser, blockPost, unblockPost],
  );

  return <ModerationContext.Provider value={value}>{children}</ModerationContext.Provider>;
}

export function useModeration(): ModerationContextValue {
  const ctx = useContext(ModerationContext);
  if (!ctx) {
    throw new Error('useModeration must be used inside <ModerationProvider>');
  }
  return ctx;
}
