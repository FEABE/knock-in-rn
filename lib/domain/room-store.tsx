import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from 'react';

import { MOCK_ROOM_POSTS } from './mock';
import type { RoomPost } from './types';

export type RoomStoreContextValue = {
  posts: RoomPost[];
  getById: (id: string) => RoomPost | undefined;
  add: (post: RoomPost) => void;
  update: (id: string, patch: Partial<RoomPost>) => void;
  remove: (id: string) => void;
  byAuthor: (authorId: string) => RoomPost[];
};

const RoomStoreContext = createContext<RoomStoreContextValue | null>(null);

export function RoomStoreProvider({ children }: { children: ReactNode }) {
  const [posts, setPosts] = useState<RoomPost[]>(MOCK_ROOM_POSTS);

  const getById = useCallback(
    (id: string) => posts.find((p) => p.id === id),
    [posts],
  );

  const add = useCallback((post: RoomPost) => {
    setPosts((prev) => [post, ...prev]);
  }, []);

  const update = useCallback((id: string, patch: Partial<RoomPost>) => {
    setPosts((prev) =>
      prev.map((p) => (p.id === id ? { ...p, ...patch } : p)),
    );
  }, []);

  const remove = useCallback((id: string) => {
    setPosts((prev) => prev.filter((p) => p.id !== id));
  }, []);

  const byAuthor = useCallback(
    (authorId: string) => posts.filter((p) => p.author.id === authorId),
    [posts],
  );

  const value = useMemo<RoomStoreContextValue>(
    () => ({ posts, getById, add, update, remove, byAuthor }),
    [posts, getById, add, update, remove, byAuthor],
  );

  return (
    <RoomStoreContext.Provider value={value}>
      {children}
    </RoomStoreContext.Provider>
  );
}

export function useRoomStore(): RoomStoreContextValue {
  const ctx = useContext(RoomStoreContext);
  if (!ctx) {
    throw new Error(
      'useRoomStore must be used inside <RoomStoreProvider>',
    );
  }
  return ctx;
}
