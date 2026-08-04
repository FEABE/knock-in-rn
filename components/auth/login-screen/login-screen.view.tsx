import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { ActivityIndicator, Modal, Pressable, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import type { SocialProvider } from '@/lib/api';

import type { UseLoginScreenReturn } from './use-login-screen';

export type LoginScreenViewProps = UseLoginScreenReturn;

export function LoginScreenView({
  status,
  activeProvider,
  message,
  onProviderPress,
  onDismissError,
}: LoginScreenViewProps) {
  const loading = status === 'loading';
  const hasError = status === 'cancelled' || status === 'network' || status === 'failed';
  const showSuccess = status === 'success';

  return (
    <SafeAreaView className="flex-1 bg-white" edges={['top', 'bottom']}>
      <View className="flex-1 px-4 pb-3">
        <View className="flex-1 items-center pt-[94px]">
          <BrandMark />
          <Text className="mt-8 text-center text-[22px] font-bold leading-[33px] text-[#17171B]">
            좋은 집보다 좋은 룸메이트
          </Text>
          <Text className="mt-2 text-center text-[15px] leading-[23px] text-[#696976]">
            함께 사는 즐거움을 위해{`\n`} 나와 잘 맞는 룸메이트를 찾아보세요
          </Text>
        </View>

        <View className="gap-3">
          <ProviderButton
            provider="apple"
            label="Apple 로그인"
            loading={loading && activeProvider === 'apple'}
            disabled={loading}
            onPress={() => onProviderPress('apple')}
          />
          <ProviderButton
            provider="kakao"
            label="카카오 로그인"
            loading={loading && activeProvider === 'kakao'}
            disabled={loading}
            onPress={() => onProviderPress('kakao')}
          />
        </View>

        {showSuccess ? (
          <View className="mt-2 min-h-10 items-center justify-center px-3 py-1">
            <Text className="text-center text-sm text-[#256EF4]">{message ?? '로그인됐어요.'}</Text>
          </View>
        ) : (
          <View className="h-10" />
        )}
      </View>

      <LoginErrorModal status={status} hasError={hasError} onDismiss={onDismissError} />
    </SafeAreaView>
  );
}

function LoginErrorModal({
  status,
  hasError,
  onDismiss,
}: {
  status: LoginScreenViewProps['status'];
  hasError: boolean;
  onDismiss: () => void;
}) {
  const title = status === 'cancelled' ? '로그인을 취소했어요' : '로그인에 실패했어요';
  const description =
    status === 'network'
      ? '네트워크 연결을 확인한 뒤 다시 시도해주세요'
      : '잠시 후 다시 시도해주세요';

  return (
    <Modal transparent animationType="fade" visible={hasError} onRequestClose={onDismiss}>
      <View className="flex-1 items-center justify-center bg-[#17171B]/40 px-8">
        <View className="w-full max-w-[300px] items-center gap-4 rounded-2xl bg-white px-6 py-7">
          <View className="h-14 w-14 items-center justify-center rounded-full bg-[#F6F6FA]">
            <Ionicons name="alert-circle-outline" size={28} color="#696976" />
          </View>
          <View className="items-center gap-1">
            <Text className="text-base font-bold text-[#17171B]">{title}</Text>
            <Text className="text-center text-sm text-[#696976]">{description}</Text>
          </View>
          <Pressable
            onPress={onDismiss}
            className="h-11 w-full items-center justify-center rounded-lg bg-[#256EF4] active:opacity-90"
          >
            <Text className="text-[15px] font-semibold text-white">확인</Text>
          </Pressable>
        </View>
      </View>
    </Modal>
  );
}

function BrandMark() {
  return (
    <Image
      source={require('../../../assets/images/figma-ready/knockin-logo.png')}
      contentFit="fill"
      style={{ width: 78, height: 86.123 }}
    />
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
      className={`h-12 flex-row items-center justify-center rounded-lg ${bgClass} ${
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
      <Text className={`text-[15px] font-semibold ${textClass}`}>{label}</Text>
    </Pressable>
  );
}
