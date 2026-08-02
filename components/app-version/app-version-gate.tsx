import Constants from 'expo-constants';
import { useEffect, useState } from 'react';
import { Linking, Modal, Platform, Pressable, Text, View } from 'react-native';

import { getAppVersion, type AppVersionData } from '@/lib/api';

type UpdatePrompt = {
  required: boolean;
  version: string;
};

export function AppVersionGate() {
  const [prompt, setPrompt] = useState<UpdatePrompt | null>(null);

  useEffect(() => {
    let mounted = true;

    getAppVersion().then((response) => {
      if (!mounted || response.status !== 200 || response.error || !response.data?.version) return;

      const next = toUpdatePrompt(response.data);
      if (next) setPrompt(next);
    });

    return () => {
      mounted = false;
    };
  }, []);

  if (!prompt) return null;

  return (
    <Modal
      transparent
      animationType="fade"
      visible
      statusBarTranslucent
      onRequestClose={() => {
        if (!prompt.required) setPrompt(null);
      }}
    >
      <View className="flex-1 items-center justify-center bg-black/35 px-9">
        <View className="w-full max-w-[286px] rounded-2xl bg-white px-6 pb-4 pt-5">
          <Text className="text-center text-[19px] font-bold leading-[29px] text-[#17171B]">
            업데이트가 필요해요
          </Text>
          <Text className="mt-1 text-center text-sm leading-[21px] text-[#696976]">
            안정적인 서비스 이용을 위해{`\n`}최신 버전으로 업데이트 해주세요
          </Text>

          <View className="mt-4 flex-row gap-3">
            {!prompt.required ? (
              <Pressable
                onPress={() => setPrompt(null)}
                className="h-11 flex-1 items-center justify-center rounded-lg bg-[#F1F1F6] active:opacity-80"
              >
                <Text className="text-[15px] font-semibold text-[#AAAABA]">나중에 하기</Text>
              </Pressable>
            ) : null}
            <Pressable
              onPress={() => void openStore()}
              className="h-11 flex-1 items-center justify-center rounded-lg bg-[#256EF4] active:opacity-85"
            >
              <Text className="text-[15px] font-semibold text-white">스토어로 이동</Text>
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
}

function toUpdatePrompt(data: AppVersionData): UpdatePrompt | null {
  const current = Constants.expoConfig?.version ?? '0.0.0';
  const latest = data.version;
  if (!latest || compareVersions(current, latest) >= 0) return null;

  const belowMinimum = data.minVersion ? compareVersions(current, data.minVersion) < 0 : false;
  return {
    required: data.updateType === 'FORCE' || belowMinimum,
    version: latest,
  };
}

function compareVersions(left: string, right: string): number {
  const leftParts = numericVersionParts(left);
  const rightParts = numericVersionParts(right);
  const length = Math.max(leftParts.length, rightParts.length);

  for (let index = 0; index < length; index += 1) {
    const diff = (leftParts[index] ?? 0) - (rightParts[index] ?? 0);
    if (diff !== 0) return diff;
  }
  return 0;
}

function numericVersionParts(value: string): number[] {
  return value
    .split(/[.-]/)
    .map((part) => Number.parseInt(part, 10))
    .map((part) => (Number.isFinite(part) ? part : 0));
}

async function openStore() {
  const androidWeb = 'https://play.google.com/store/apps/details?id=com.knockin';
  const primary =
    Platform.OS === 'ios'
      ? process.env.EXPO_PUBLIC_IOS_APP_STORE_URL ||
        'https://apps.apple.com/kr/search?term=%EB%85%B8%ED%81%AC%EC%9D%B8'
      : process.env.EXPO_PUBLIC_ANDROID_PLAY_STORE_URL || 'market://details?id=com.knockin';

  try {
    await Linking.openURL(primary);
  } catch {
    if (Platform.OS === 'android') await Linking.openURL(androidWeb);
  }
}
