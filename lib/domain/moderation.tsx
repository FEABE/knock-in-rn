import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from 'react';

export type ReportTarget = {
  kind: 'post' | 'user';
  id: string;
};

export type ReportRecord = ReportTarget & {
  reason: string;
  status: 'submitted' | 'reviewing' | 'resolved';
  createdAt: Date;
};

export type ModerationContextValue = {
  blockedUserIds: Set<string>;
  blockedPostIds: Set<string>;
  reports: ReportRecord[];
  isUserBlocked: (id: string) => boolean;
  isPostBlocked: (id: string) => boolean;
  blockUser: (id: string) => void;
  unblockUser: (id: string) => void;
  blockPost: (id: string) => void;
  unblockPost: (id: string) => void;
  report: (target: ReportTarget, reason: string) => void;
};

const ModerationContext = createContext<ModerationContextValue | null>(null);

export function ModerationProvider({ children }: { children: ReactNode }) {
  const [blockedUserIds, setBlockedUserIds] = useState<Set<string>>(new Set());
  const [blockedPostIds, setBlockedPostIds] = useState<Set<string>>(new Set());
  const [reports, setReports] = useState<ReportRecord[]>([]);

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

  const report = useCallback((target: ReportTarget, reason: string) => {
    setReports((prev) => [
      ...prev,
      {
        ...target,
        reason,
        status: 'submitted',
        createdAt: new Date(),
      },
    ]);
  }, []);

  const value = useMemo<ModerationContextValue>(
    () => ({
      blockedUserIds,
      blockedPostIds,
      reports,
      isUserBlocked: (id) => blockedUserIds.has(id),
      isPostBlocked: (id) => blockedPostIds.has(id),
      blockUser,
      unblockUser,
      blockPost,
      unblockPost,
      report,
    }),
    [
      blockedUserIds,
      blockedPostIds,
      reports,
      blockUser,
      unblockUser,
      blockPost,
      unblockPost,
      report,
    ],
  );

  return (
    <ModerationContext.Provider value={value}>
      {children}
    </ModerationContext.Provider>
  );
}

export function useModeration(): ModerationContextValue {
  const ctx = useContext(ModerationContext);
  if (!ctx) {
    throw new Error(
      'useModeration must be used inside <ModerationProvider>',
    );
  }
  return ctx;
}
