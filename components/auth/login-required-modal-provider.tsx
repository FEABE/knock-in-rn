import { useRouter } from 'expo-router';
import { useCallback, useMemo, useState, type ReactNode } from 'react';
import { Modal, Pressable, Text, View } from 'react-native';

import { LoginRequiredModalContext } from '@/lib/auth/login-required-modal-context';
import { goKakaoLogin } from '@/lib/navigation/routes';

export function LoginRequiredModalProvider({ children }: { children: ReactNode }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const showLoginRequiredModal = useCallback(() => setOpen(true), []);
  const value = useMemo(() => ({ showLoginRequiredModal }), [showLoginRequiredModal]);

  const close = () => setOpen(false);
  const moveToLogin = () => {
    setOpen(false);
    goKakaoLogin(router);
  };

  return (
    <LoginRequiredModalContext.Provider value={value}>
      {children}
      <Modal transparent animationType="fade" visible={open} onRequestClose={close}>
        <Pressable
          onPress={close}
          accessibilityRole="button"
          accessibilityLabel="로그인 안내 닫기"
          className="flex-1 items-center justify-center bg-[#17171B]/40 px-9"
        >
          <Pressable
            onPress={(event) => event.stopPropagation()}
            className="w-full max-w-[320px] rounded-xl bg-white px-6 pb-5 pt-7"
          >
            <Text className="text-center text-[18px] font-bold leading-[27px] text-[#17171B]">
              로그인이 필요한 페이지예요
            </Text>
            <Text className="mt-2 text-center text-[14px] leading-[21px] text-[#696976]">
              로그인 페이지로 이동할까요?
            </Text>

            <View className="mt-5 flex-row gap-2">
              <Pressable
                onPress={close}
                accessibilityRole="button"
                accessibilityLabel="로그인 이동 취소"
                className="h-12 flex-1 items-center justify-center rounded-lg bg-[#F1F1F6] active:opacity-80"
              >
                <Text className="text-[14px] font-semibold text-[#AAAABA]">취소</Text>
              </Pressable>
              <Pressable
                onPress={moveToLogin}
                accessibilityRole="button"
                accessibilityLabel="로그인 페이지로 이동"
                className="h-12 flex-1 items-center justify-center rounded-lg bg-[#256EF4] active:opacity-85"
              >
                <Text className="text-[14px] font-semibold text-white">이동하기</Text>
              </Pressable>
            </View>
          </Pressable>
        </Pressable>
      </Modal>
    </LoginRequiredModalContext.Provider>
  );
}
