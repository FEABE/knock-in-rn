import { Ionicons } from '@expo/vector-icons';
import { ActivityIndicator, Pressable, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import type { SocialProvider } from '@/lib/api';

import type { UseLoginScreenReturn } from './use-login-screen';

export type LoginScreenViewProps = UseLoginScreenReturn;

export function LoginScreenView({
  status,
  activeProvider,
  message,
  onProviderPress,
  onRetry,
}: LoginScreenViewProps) {
  const loading = status === 'loading';
  const hasError = status === 'cancelled' || status === 'network' || status === 'failed';

  return (
    <SafeAreaView className="flex-1 bg-white" edges={['top', 'bottom']}>
      <View className="flex-1 justify-end px-5 pb-6">
        <View className="flex-1 items-center justify-center pb-8">
          <BrandMark />
          <Text className="mt-8 text-[22px] font-extrabold text-[#17171B]">
            좋은 집보다 좋은 룸메이트
          </Text>
          <Text className="mt-3 text-center text-[15px] leading-6 text-[#696976]">
            함께 사는 즐거움을 위해{`\n`}나와 잘 맞는 룸메이트를 찾아보세요
          </Text>
        </View>

        <View className="gap-3">
          <ProviderButton
            provider="kakao"
            label="카카오 로그인"
            loading={loading && activeProvider === 'kakao'}
            disabled={loading}
            onPress={() => onProviderPress('kakao')}
          />
          <ProviderButton
            provider="apple"
            label="Apple 로그인"
            loading={loading && activeProvider === 'apple'}
            disabled={loading}
            onPress={() => onProviderPress('apple')}
          />
        </View>

        {status !== 'idle' && status !== 'loading' ? (
          <Pressable
            onPress={hasError ? onRetry : undefined}
            disabled={!hasError}
            className="mt-4 items-center px-3 py-2"
          >
            <Text
              className={`text-center text-sm ${hasError ? 'text-rose-500' : 'text-[#256EF4]'}`}
            >
              {message ?? (hasError ? '로그인에 실패했어요. 다시 시도해주세요.' : '로그인됐어요.')}
            </Text>
            {hasError ? (
              <Text className="mt-1 text-xs font-semibold text-[#256EF4]">다시 시도</Text>
            ) : null}
          </Pressable>
        ) : (
          <View className="h-[52px]" />
        )}
      </View>
    </SafeAreaView>
  );
}

function BrandMark() {
  return (
    <View className="h-[88px] w-[88px] items-center justify-center rounded-[22px] bg-[#2F6FF5]">
      <Ionicons name="home" size={58} color="#FFFFFF" />
      <View className="absolute bottom-[22px] h-7 w-4 rounded-full bg-[#2F6FF5]" />
      <View className="absolute bottom-[41px] h-5 w-5 rounded-full bg-white" />
      <View className="absolute bottom-[25px] h-6 w-3 bg-white" />
    </View>
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
  const bgClass = isKakao ? 'bg-[#FEE500]' : 'bg-black';
  const textClass = isKakao ? 'text-[#17171B]' : 'text-white';
  const iconName = isKakao ? 'chatbubble' : 'logo-apple';
  const iconColor = isKakao ? '#17171B' : '#FFFFFF';

  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      className={`h-12 flex-row items-center justify-center rounded-md ${bgClass} ${
        disabled ? 'opacity-60' : 'active:opacity-85'
      }`}
    >
      <View className="absolute left-4 h-6 w-6 items-center justify-center">
        {loading ? (
          <ActivityIndicator color={iconColor} size="small" />
        ) : (
          <Ionicons name={iconName} size={20} color={iconColor} />
        )}
      </View>
      <Text className={`text-[15px] font-medium ${textClass}`}>{label}</Text>
    </Pressable>
  );
}
