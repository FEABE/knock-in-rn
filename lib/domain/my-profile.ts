import { useCallback, useMemo } from 'react';

import { getAccessTokenMemberId } from '@/lib/api/client';

import { useSession } from './session';
import type { RoomPost, UserSummary } from './types';

/**
 * 내가 쓴 글의 작성자 프로필을 세션 기준으로 덮어쓰는 헬퍼.
 *
 * 게시글 목록/상세 응답은 프로필 이미지를 캐싱된 값으로 내려주기 때문에, 프로필을 새로
 * 등록해도 목록에는 반영되지 않는다. 탐색 탭에서 쓰던 보정 로직을 공통으로 뽑아 관심 ·
 * 게시글 관리 · 상세가 모두 같은 기준으로 내 프로필을 렌더링하도록 한다.
 */
export type MyProfileAuthor = {
  /** 해당 작성자가 로그인한 나인지. */
  isMe: (author: Pick<UserSummary, 'id' | 'name'>) => boolean;
  /** 내가 쓴 글이면 세션 프로필 이미지를 채워 넣는다. */
  applyToPost: <T extends RoomPost>(post: T) => T;
  /** applyToPost 의 리스트 버전. 바뀐 항목이 없으면 원본 배열을 그대로 돌려준다. */
  applyToPosts: <T extends RoomPost>(posts: T[]) => T[];
};

export function useMyProfileAuthor(): MyProfileAuthor {
  const { session } = useSession();
  // 토큰의 memberId 가 서버 응답의 memberId 와 같은 체계라 우선 사용하고, 없으면 세션 id.
  const currentMemberId = getAccessTokenMemberId() ?? session?.user.id;
  const currentUserName = session?.user.name;
  const currentUserAvatar = session?.user.avatarUrl?.trim();

  const isMe = useCallback(
    (author: Pick<UserSummary, 'id' | 'name'>) =>
      (currentMemberId != null && String(currentMemberId) === String(author.id)) ||
      (currentUserName != null && currentUserName === author.name),
    [currentMemberId, currentUserName],
  );

  const applyToPost = useCallback(
    <T extends RoomPost>(post: T): T => {
      if (!currentUserAvatar || post.author.avatarUrl?.trim() || !isMe(post.author)) return post;
      return { ...post, author: { ...post.author, avatarUrl: currentUserAvatar } };
    },
    [currentUserAvatar, isMe],
  );

  const applyToPosts = useCallback(
    <T extends RoomPost>(posts: T[]): T[] => {
      if (!currentUserAvatar) return posts;
      let changed = false;
      const next = posts.map((post) => {
        const applied = applyToPost(post);
        if (applied !== post) changed = true;
        return applied;
      });
      return changed ? next : posts;
    },
    [applyToPost, currentUserAvatar],
  );

  return useMemo(() => ({ isMe, applyToPost, applyToPosts }), [isMe, applyToPost, applyToPosts]);
}
