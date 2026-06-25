import { Ionicons } from '@expo/vector-icons';
import { ActivityIndicator, Pressable, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import type { SocialProvider } from '@/lib/api';

import type { LoginScreenStatus, UseLoginScreenReturn } from './use-login-screen';

export type LoginScreenViewProps = UseLoginScreenReturn;

export function LoginScreenView({
  status,
  activeProvider,
  message,
  onProviderPress,
  onRetry,
  onSkip,
  onBack,
}: LoginScreenViewProps) {
  const loading = status === 'loading';

  return (
    <SafeAreaView className="flex-1 bg-white" edges={['top', 'bottom']}>
      <View className="flex-row items-center justify-between px-4 py-2">
        <Pressable
          onPress={onBack}
          hitSlop={8}
          className="h-10 w-10 items-center justify-center rounded-full active:bg-neutral-100"
        >
          <Ionicons name="chevron-back" size={24} color="#171717" />
        </Pressable>
        <Pressable onPress={onSkip} hitSlop={8} className="px-2 py-2 active:opacity-70">
          <Text className="text-sm font-medium text-neutral-500">나중에 보기</Text>
        </Pressable>
      </View>

      <View className="flex-1 justify-between px-5 pb-6 pt-8">
        <View>
          <View className="mb-10 gap-3">
            <Text className="text-[32px] font-extrabold text-neutral-950">노크인</Text>
            <Text className="text-base leading-6 text-neutral-500">
              생활 패턴이 맞는 룸메이트와 방을 찾으려면 로그인해주세요.
            </Text>
          </View>

          <View className="gap-3">
            <ProviderButton
              provider="kakao"
              label="카카오로 시작하기"
              loading={loading && activeProvider === 'kakao'}
              disabled={loading}
              onPress={() => onProviderPress('kakao')}
            />
            <ProviderButton
              provider="apple"
              label="Apple로 계속하기"
              loading={loading && activeProvider === 'apple'}
              disabled={loading}
              onPress={() => onProviderPress('apple')}
            />
          </View>

          <StatusPanel
            status={status}
            provider={activeProvider}
            message={message}
            onRetry={onRetry}
          />
        </View>

        <Text className="text-center text-xs leading-5 text-neutral-400">
          로그인하면 서비스 이용약관과 개인정보 처리방침에 동의한 것으로 간주돼요.
        </Text>
      </View>
    </SafeAreaView>
  );
}

function ProviderButton({
  provider,
  label,
  loading,
  disabled,
  onPress,
}: {
  provider: SocialProvider;
  label: string;
  loading: boolean;
  disabled: boolean;
  onPress: () => void;
}) {
  const isKakao = provider === 'kakao';
  const bgClass = isKakao ? 'bg-[#FEE500]' : 'bg-neutral-950';
  const textClass = isKakao ? 'text-neutral-950' : 'text-white';
  const iconName = isKakao ? 'chatbubble' : 'logo-apple';
  const iconColor = isKakao ? '#171717' : '#FFFFFF';

  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      className={`h-14 flex-row items-center justify-center gap-2 rounded-xl ${bgClass} ${
        disabled ? 'opacity-60' : 'active:opacity-85'
      }`}
    >
      {loading ? (
        <ActivityIndicator color={iconColor} />
      ) : (
        <Ionicons name={iconName} size={20} color={iconColor} />
      )}
      <Text className={`text-base font-semibold ${textClass}`}>{label}</Text>
    </Pressable>
  );
}

function StatusPanel({
  status,
  provider,
  message,
  onRetry,
}: {
  status: LoginScreenStatus;
  provider: SocialProvider | null;
  message: string | null;
  onRetry: () => void;
}) {
  if (status === 'idle') {
    return (
      <View className="mt-6 rounded-lg bg-neutral-50 p-4">
        <Text className="text-sm leading-5 text-neutral-500">
          로그인 후 관심 목록, 채팅, 방 등록, 인증 정보를 이어서 사용할 수 있어요.
        </Text>
      </View>
    );
  }

  const copy = getStatusCopy(status, provider, message);
  const retryable = status === 'cancelled' || status === 'network' || status === 'failed';

  return (
    <View className={`mt-6 gap-3 rounded-lg border p-4 ${copy.panelClass}`}>
      <View className="flex-row items-start gap-3">
        <View className={`h-8 w-8 items-center justify-center rounded-full ${copy.iconBgClass}`}>
          {status === 'loading' ? (
            <ActivityIndicator color={copy.iconColor} size="small" />
          ) : (
            <Ionicons name={copy.iconName} size={18} color={copy.iconColor} />
          )}
        </View>
        <View className="flex-1 gap-1">
          <Text className={`text-sm font-semibold ${copy.titleClass}`}>{copy.title}</Text>
          <Text className="text-sm leading-5 text-neutral-500">{copy.body}</Text>
        </View>
      </View>

      {retryable ? (
        <Pressable
          onPress={onRetry}
          className="self-start rounded-full bg-white px-4 py-2 active:opacity-80"
        >
          <Text className="text-sm font-medium text-neutral-800">다시 시도</Text>
        </Pressable>
      ) : null}
    </View>
  );
}

function getStatusCopy(
  status: LoginScreenStatus,
  provider: SocialProvider | null,
  message: string | null,
) {
  const providerLabel = provider === 'apple' ? 'Apple' : '카카오';

  if (status === 'loading') {
    return {
      title: `${providerLabel} 로그인 진행 중`,
      body: '인증 화면을 확인해주세요.',
      panelClass: 'border-blue-100 bg-blue-50',
      iconBgClass: 'bg-white',
      iconColor: '#256EF4',
      iconName: 'time-outline' as const,
      titleClass: 'text-blue-700',
    };
  }

  if (status === 'success') {
    return {
      title: '로그인 완료',
      body: message ?? '잠시 후 이동합니다.',
      panelClass: 'border-emerald-100 bg-emerald-50',
      iconBgClass: 'bg-white',
      iconColor: '#059669',
      iconName: 'checkmark' as const,
      titleClass: 'text-emerald-700',
    };
  }

  if (status === 'cancelled') {
    return {
      title: '로그인이 취소됐어요',
      body: message ?? '필요할 때 다시 로그인할 수 있어요.',
      panelClass: 'border-neutral-200 bg-neutral-50',
      iconBgClass: 'bg-white',
      iconColor: '#525252',
      iconName: 'close' as const,
      titleClass: 'text-neutral-800',
    };
  }

  if (status === 'network') {
    return {
      title: '네트워크 오류',
      body: message ?? '연결 상태를 확인한 뒤 다시 시도해주세요.',
      panelClass: 'border-amber-100 bg-amber-50',
      iconBgClass: 'bg-white',
      iconColor: '#D97706',
      iconName: 'wifi-outline' as const,
      titleClass: 'text-amber-700',
    };
  }

  return {
    title: '로그인 실패',
    body: message ?? '잠시 후 다시 시도해주세요.',
    panelClass: 'border-rose-100 bg-rose-50',
    iconBgClass: 'bg-white',
    iconColor: '#E11D48',
    iconName: 'alert-circle-outline' as const,
    titleClass: 'text-rose-700',
  };
}
