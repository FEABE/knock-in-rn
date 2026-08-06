import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { DefaultProfileArtwork } from '@/components/ui/ready-to-dev-assets';

import type { UseBasicProfileEditScreenReturn } from './use-basic-profile-edit-screen';

export function BasicProfileEditScreenView(props: UseBasicProfileEditScreenReturn) {
  const imageUri = props.state.image?.uri ?? props.state.profileImageUrl;

  return (
    <SafeAreaView className="flex-1 bg-white" edges={['top', 'bottom']}>
      <View className="h-12 flex-row items-center justify-between px-4">
        <Pressable
          onPress={props.onBack}
          hitSlop={12}
          className="h-10 w-10 items-center justify-center"
        >
          <Ionicons name="chevron-back" size={24} color="#696976" />
        </Pressable>
        <Text className="text-lg font-semibold text-[#17171B]">프로필 편집</Text>
        <Pressable
          onPress={() => void props.save()}
          disabled={!props.canSave}
          hitSlop={12}
          className="h-10 min-w-10 items-center justify-center"
        >
          {props.saving ? (
            <ActivityIndicator size="small" color="#256EF4" />
          ) : (
            <Text
              className={props.canSave ? 'text-base text-[#256EF4]' : 'text-base text-[#AAAABA]'}
            >
              저장
            </Text>
          )}
        </Pressable>
      </View>

      {props.loading ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator color="#256EF4" />
        </View>
      ) : props.error ? (
        <View className="flex-1 items-center justify-center px-8">
          <Text className="text-center text-sm text-[#696976]">{props.error}</Text>
        </View>
      ) : (
        <KeyboardAvoidingView
          className="flex-1"
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        >
          <ScrollView
            keyboardShouldPersistTaps="handled"
            contentContainerClassName="px-4 pb-10"
            automaticallyAdjustKeyboardInsets
          >
            <View className="items-center pb-7 pt-5">
              {imageUri ? (
                <Image
                  source={{ uri: imageUri }}
                  contentFit="cover"
                  style={{ width: 80, height: 80, borderRadius: 40 }}
                />
              ) : (
                <DefaultProfileArtwork size={80} />
              )}
              <Pressable
                onPress={() => void props.pickProfileImage()}
                className="mt-3 h-9 items-center justify-center rounded border border-[#DADAE8] px-4 active:bg-[#F6F6FA]"
              >
                <Text className="text-sm text-[#696976]">사진 변경하기</Text>
              </Pressable>
            </View>

            <ProfileField
              label="이름"
              value={props.state.name}
              onChangeText={props.setName}
              error={props.nameError}
              success={!props.nameError ? '사용 가능한 이름이에요' : undefined}
              maxLength={10}
            />
            <ProfileField
              label="성별"
              value={props.state.gender === 'MALE' ? '남성' : '여성'}
              editable={false}
            />
            <ProfileField
              label="이메일"
              value={props.state.email}
              onChangeText={props.setEmail}
              error={props.emailError}
              success={!props.emailError ? '사용가능한 이메일이에요' : undefined}
              keyboardType="email-address"
              autoCapitalize="none"
            />
            <ProfileField
              label="생년월일"
              value={props.state.birth}
              onChangeText={props.setBirth}
              error={props.birthError}
              success={!props.birthError ? '사용 가능한 생년월일이에요' : undefined}
              keyboardType="number-pad"
              maxLength={10}
            />
          </ScrollView>
        </KeyboardAvoidingView>
      )}
    </SafeAreaView>
  );
}

function ProfileField({
  label,
  error,
  success,
  editable = true,
  ...inputProps
}: React.ComponentProps<typeof TextInput> & {
  label: string;
  error?: string | null;
  success?: string;
}) {
  return (
    <View className="mb-6">
      <Text
        className={`mb-2 text-sm font-medium ${editable ? 'text-[#696976]' : 'text-[#CFCFDB]'}`}
      >
        {label}
      </Text>
      <TextInput
        {...inputProps}
        editable={editable}
        placeholderTextColor="#CFCFDB"
        className={`h-10 border-b px-0 text-base ${
          editable ? 'border-[#DADAE8] text-[#17171B]' : 'border-[#ECECF3] text-[#DADAE8]'
        }`}
      />
      {error ? <Text className="mt-1.5 text-xs text-[#E5484D]">{error}</Text> : null}
      {!error && success ? <Text className="mt-1.5 text-xs text-[#2E9B4F]">{success}</Text> : null}
    </View>
  );
}
