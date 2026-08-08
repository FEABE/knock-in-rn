import { useCallback } from 'react';

import { useSession } from '@/lib/domain';

import { useLoginRequiredModal } from './login-required-modal-context';

export type RequireLoginOptions = {
  title?: string;
  message?: string;
  cancelText?: string;
  loginText?: string;
};

export function useRequireLogin() {
  const { session } = useSession();
  const { showLoginRequiredModal } = useLoginRequiredModal();

  const requireLogin = useCallback(
    (then: () => void, _options: RequireLoginOptions = {}) => {
      if (session) {
        then();
        return true;
      }

      showLoginRequiredModal();
      return false;
    },
    [session, showLoginRequiredModal],
  );

  return {
    isLoggedIn: !!session,
    requireLogin,
    session,
  };
}
