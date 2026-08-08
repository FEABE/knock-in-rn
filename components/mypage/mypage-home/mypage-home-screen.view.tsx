import { Ionicons } from '@expo/vector-icons';
import Constants from 'expo-constants';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { LoginPromptCard } from '@/components/auth/login-prompt-card';
import { DefaultProfileArtwork } from '@/components/ui/ready-to-dev-assets';
import { ReadyBadge, ReadyProfileAvatar } from '@/components/ui/ready-to-dev-components';
import { ReadyToast } from '@/components/ui/ready-to-dev-feedback';

import { MyPageToggle } from './mypage-toggle';
import type { MyPageMenuRow, UseMyPageHomeScreenReturn } from './use-mypage-home-screen';

export type MyPageHomeScreenViewProps = UseMyPageHomeScreenReturn;

export function MyPageHomeScreenView({
  user,
  schoolVerified,
  companyVerified,
  profileVisible,
  notificationEnabled,
  notificationEditable,
  genderLabel,
  genderIcon,
  roomTypeLabel,
  matchingRows,
  accountRows,
  supportRows,
  toast,
  onSignIn,
  onProfilePress,
  setProfileVisible,
  setNotificationEnabled,
}: MyPageHomeScreenViewProps) {
  if (!user) {
    return (
      <SafeAreaView className="flex-1 bg-white" edges={['top']}>
        <View className="px-4 pb-3 pt-4">
          <Text className="text-xl font-bold leading-6 text-[#17171B]">마이페이지</Text>
        </View>
        <View className="gap-3 p-5">
          <LoginPromptCard
            title="로그인하고 노크인을 시작해보세요"
            description="생활패턴 기반 룸메이트 매칭 · 학교/회사 이메일 인증"
            onPress={onSignIn}
          />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-white" edges={['top']}>
      <View className="px-4 pb-4 pt-7">
        <Text className="text-xl font-bold leading-6 text-[#17171B]">마이페이지</Text>
      </View>

      <ScrollView contentContainerClassName="pb-24">
        <Pressable
          onPress={onProfilePress}
          className="flex-row items-center gap-3 px-4 pb-6 pt-2 active:bg-[#F6F6FA]"
        >
          {user.avatarUrl ? (
            <ReadyProfileAvatar name={user.name} imageUrl={user.avatarUrl} size={60} />
          ) : (
            <DefaultProfileArtwork size={60} />
          )}
          <View className="flex-1 gap-1.5">
            <View className="flex-row items-center gap-1">
              <Text className="text-base font-bold leading-6 text-[#17171B]">{user.name}님</Text>
              {schoolVerified && <Ionicons name="checkmark-circle" size={15} color="#24A96B" />}
              {companyVerified && <Ionicons name="bag-handle" size={14} color="#5B8EF6" />}
              <Ionicons name="chevron-forward" size={16} color="#696976" />
            </View>
            <View className="flex-row gap-1">
              {user.age > 0 ? (
                <ReadyBadge label={`${user.age}세 · ${genderLabel}`} tone="red" icon={genderIcon} />
              ) : null}
              <ReadyBadge label={roomTypeLabel} tone="blue" icon="home" />
            </View>
          </View>
        </Pressable>

        <Section title="프로필">
          <View className="min-h-[76px] flex-row items-center justify-between border-b border-[#ECECF3] px-4 py-3">
            <View>
              <Text className="text-[15px] font-medium text-[#17171B]">프로필 공개</Text>
              <Text className="text-xs text-neutral-400">
                {profileVisible
                  ? '룸메이트 매칭 탭에 노출 중이에요'
                  : '룸메이트 매칭 탭에 노출되지 않아요'}
              </Text>
            </View>
            <MyPageToggle checked={profileVisible} onChange={setProfileVisible} />
          </View>
        </Section>

        <Section title="매칭 설정">
          {matchingRows.map((row, index) => (
            <MenuRow key={row.label} row={row} last={index === matchingRows.length - 1} />
          ))}
        </Section>

        <Section title="계정 관리">
          {accountRows.slice(0, 1).map((row) => (
            <MenuRow key={row.label} row={row} />
          ))}
          <View className="flex-row items-center border-b border-neutral-100 px-4 py-4">
            <Text className="flex-1 text-[15px] font-medium text-[#17171B]">알림</Text>
            <MyPageToggle
              checked={notificationEnabled}
              disabled={!notificationEditable}
              onChange={setNotificationEnabled}
            />
          </View>
          {accountRows.slice(1).map((row, index) => (
            <MenuRow key={row.label} row={row} last={index === accountRows.length - 2} />
          ))}
        </Section>

        <Section title="고객 지원">
          {supportRows.map((row) => (
            <MenuRow key={row.label} row={row} />
          ))}
          <View className="flex-row items-center border-b border-neutral-100 px-4 py-4">
            <Text className="flex-1 text-[15px] font-medium text-[#17171B]">버전 정보</Text>
            <Text className="text-sm text-[#696976]">
              v{Constants.expoConfig?.version ?? '1.0.0'}
            </Text>
          </View>
        </Section>
      </ScrollView>

      <ReadyToast visible={!!toast} message={toast ?? ''} tone="success" />
    </SafeAreaView>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <View className="mb-5">
      <Text className="border-b border-[#ECECF3] px-4 pb-2 text-sm font-semibold text-[#696976]">
        {title}
      </Text>
      <View className="bg-white">{children}</View>
    </View>
  );
}

function MenuRow({ row, last }: { row: MyPageMenuRow; last?: boolean }) {
  return (
    <Pressable
      onPress={row.onPress}
      className={`flex-row items-center px-4 py-4 active:bg-neutral-50 ${
        last ? '' : 'border-b border-neutral-100'
      }`}
    >
      <View className="flex-1">
        <Text className="text-[15px] font-medium text-[#17171B]">{row.label}</Text>
        {row.sub ? <Text className="text-xs text-neutral-400">{row.sub}</Text> : null}
      </View>
      {row.badge ? (
        <View className="mr-2 rounded border border-dashed border-[#8DB4FF] bg-[#F5F8FF] px-2 py-1">
          <Text className="text-[11px] font-medium text-[#4C87F6]">{row.badge}</Text>
        </View>
      ) : null}
      <Ionicons name="chevron-forward" size={19} color="#696976" />
    </Pressable>
  );
}
