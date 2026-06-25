import { useRouter } from 'expo-router';
import { useCallback } from 'react';
import { Alert } from 'react-native';

import { useSession } from '@/lib/domain';
import { goKakaoLogin } from '@/lib/navigation/routes';

export type RequireLoginOptions = {
  title?: string;
  message?: string;
  cancelText?: string;
  loginText?: string;
};

export function useRequireLogin() {
  const router = useRouter();
  const { session } = useSession();

  const requireLogin = useCallback(
    (then: () => void, options: RequireLoginOptions = {}) => {
      if (session) {
        then();
        return true;
      }

      Alert.alert(options.title ?? '로그인이 필요해요', options.message ?? '로그인하시겠어요?', [
        { text: options.cancelText ?? '취소', style: 'cancel' },
        { text: options.loginText ?? '로그인', onPress: () => goKakaoLogin(router) },
      ]);
      return false;
    },
    [router, session],
  );

  return {
    isLoggedIn: !!session,
    requireLogin,
    session,
  };
}
