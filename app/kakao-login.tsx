import { useEffect, useState } from 'react';
import { Platform, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Button } from '@/components/ui/headless';
import {
  completeKakaoWebLoginIfPending,
  loginWithKakaoLibrary,
  loginWithKakaoRaw,
  logoutWithKakaoLibrary,
  logoutWithKakaoRaw,
  logoutWithKakaoWebSDK,
  startKakaoWebLogin,
} from '@/lib/auth';

type Mode = 'library' | 'raw' | 'web-sdk';

type Result =
  | { kind: 'idle' }
  | { kind: 'pending'; mode: Mode }
  | { kind: 'success'; mode: Mode; payload: unknown }
  | { kind: 'error'; mode: Mode; message: string };

export default function KakaoLoginScreen() {
  const [result, setResult] = useState<Result>({ kind: 'idle' });
  const [rawAccessToken, setRawAccessToken] = useState<string | null>(null);
  const [libraryActive, setLibraryActive] = useState(false);
  const [webSdkActive, setWebSdkActive] = useState(false);

  const runLibraryLogin = async () => {
    setResult({ kind: 'pending', mode: 'library' });
    try {
      const payload = await loginWithKakaoLibrary();
      setLibraryActive(true);
      setResult({ kind: 'success', mode: 'library', payload });
    } catch (err) {
      setResult({
        kind: 'error',
        mode: 'library',
        message: messageOf(err),
      });
    }
  };

  const runLibraryLogout = async () => {
    try {
      await logoutWithKakaoLibrary();
      setLibraryActive(false);
      setResult({ kind: 'idle' });
    } catch (err) {
      setResult({
        kind: 'error',
        mode: 'library',
        message: messageOf(err),
      });
    }
  };

  const runRawLogin = async () => {
    setResult({ kind: 'pending', mode: 'raw' });
    try {
      const payload = await loginWithKakaoRaw();
      setRawAccessToken(payload.token.access_token);
      setResult({ kind: 'success', mode: 'raw', payload });
    } catch (err) {
      setResult({
        kind: 'error',
        mode: 'raw',
        message: messageOf(err),
      });
    }
  };

  const runRawLogout = async () => {
    if (!rawAccessToken) return;
    try {
      await logoutWithKakaoRaw(rawAccessToken);
      setRawAccessToken(null);
      setResult({ kind: 'idle' });
    } catch (err) {
      setResult({
        kind: 'error',
        mode: 'raw',
        message: messageOf(err),
      });
    }
  };

  const runWebSdkLogin = async () => {
    setResult({ kind: 'pending', mode: 'web-sdk' });
    try {
      await startKakaoWebLogin();
    } catch (err) {
      setResult({
        kind: 'error',
        mode: 'web-sdk',
        message: messageOf(err),
      });
    }
  };

  useEffect(() => {
    if (Platform.OS !== 'web') return;
    let cancelled = false;
    setResult((prev) =>
      prev.kind === 'idle' ? { kind: 'pending', mode: 'web-sdk' } : prev,
    );
    completeKakaoWebLoginIfPending()
      .then((payload) => {
        if (cancelled) return;
        if (payload) {
          setWebSdkActive(true);
          setResult({ kind: 'success', mode: 'web-sdk', payload });
        } else {
          setResult((prev) =>
            prev.kind === 'pending' && prev.mode === 'web-sdk'
              ? { kind: 'idle' }
              : prev,
          );
        }
      })
      .catch((err) => {
        if (cancelled) return;
        setResult({
          kind: 'error',
          mode: 'web-sdk',
          message: messageOf(err),
        });
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const runWebSdkLogout = async () => {
    try {
      await logoutWithKakaoWebSDK();
      setWebSdkActive(false);
      setResult({ kind: 'idle' });
    } catch (err) {
      setResult({
        kind: 'error',
        mode: 'web-sdk',
        message: messageOf(err),
      });
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-white dark:bg-neutral-900">
      <ScrollView contentContainerClassName="p-6 gap-8">
        <View className="gap-1">
          <Text className="text-2xl font-bold text-neutral-900 dark:text-white">
            Kakao Login
          </Text>
          <Text className="text-sm text-neutral-500">
            라이브러리 vs 생짜 OAuth 두 방식 비교
          </Text>
        </View>

        <Section
          title="Library — @react-native-seoul/kakao-login"
          description="네이티브 SDK 래퍼. KakaoTalk 앱이 설치되어 있으면 앱 스위칭, 아니면 카카오 계정 웹 로그인. dev client 빌드 필요."
        >
          <Button
            className="self-start rounded-lg bg-yellow-400 px-4 py-2 active:bg-yellow-500"
            loading={result.kind === 'pending' && result.mode === 'library'}
            onPress={runLibraryLogin}
          >
            <Text className="font-medium text-neutral-900">카카오로 로그인</Text>
          </Button>
          {libraryActive ? (
            <Button
              className="self-start rounded-lg border border-neutral-300 px-4 py-2 active:bg-neutral-100"
              onPress={runLibraryLogout}
            >
              <Text className="font-medium text-neutral-800">로그아웃</Text>
            </Button>
          ) : null}
        </Section>

        <Section
          title="Raw — expo-auth-session + REST"
          description="순수 OAuth 2.0 + PKCE. expo-web-browser로 인가 화면 열고, 코드를 받아 토큰 교환 후 프로필 조회. Expo Go에서도 동작."
        >
          <Button
            className="self-start rounded-lg bg-yellow-400 px-4 py-2 active:bg-yellow-500"
            loading={result.kind === 'pending' && result.mode === 'raw'}
            onPress={runRawLogin}
          >
            <Text className="font-medium text-neutral-900">
              카카오로 로그인 (raw)
            </Text>
          </Button>
          {rawAccessToken ? (
            <Button
              className="self-start rounded-lg border border-neutral-300 px-4 py-2 active:bg-neutral-100"
              onPress={runRawLogout}
            >
              <Text className="font-medium text-neutral-800">로그아웃</Text>
            </Button>
          ) : null}
        </Section>

        {Platform.OS === 'web' ? (
          <Section
            title="Web SDK — Kakao.js"
            description="Web 전용. kakao.min.js 동적 로드 + Kakao.init(JS_KEY) → Kakao.Auth.authorize({ redirectUri }) 풀 페이지 리다이렉트 → 콜백에서 code를 토큰으로 교환 → Kakao.API.request('/v2/user/me'). v2에서 popup login 제거됨."
          >
            <Button
              className="self-start rounded-lg bg-yellow-400 px-4 py-2 active:bg-yellow-500"
              loading={result.kind === 'pending' && result.mode === 'web-sdk'}
              onPress={runWebSdkLogin}
            >
              <Text className="font-medium text-neutral-900">
                카카오로 로그인 (web sdk)
              </Text>
            </Button>
            {webSdkActive ? (
              <Button
                className="self-start rounded-lg border border-neutral-300 px-4 py-2 active:bg-neutral-100"
                onPress={runWebSdkLogout}
              >
                <Text className="font-medium text-neutral-800">로그아웃</Text>
              </Button>
            ) : null}
          </Section>
        ) : null}

        <Section title="결과">
          <ResultView result={result} />
        </Section>
      </ScrollView>
    </SafeAreaView>
  );
}

const MODE_LABEL: Record<Mode, string> = {
  library: '라이브러리',
  raw: 'raw',
  'web-sdk': 'web sdk',
};

function ResultView({ result }: { result: Result }) {
  if (result.kind === 'idle') {
    return <Text className="text-neutral-500">로그인을 시도해 보세요.</Text>;
  }
  if (result.kind === 'pending') {
    return (
      <Text className="text-neutral-700">
        진행 중… ({MODE_LABEL[result.mode]})
      </Text>
    );
  }
  if (result.kind === 'error') {
    return (
      <View className="gap-1">
        <Text className="text-sm font-medium text-red-700">
          {MODE_LABEL[result.mode]} 실패
        </Text>
        <Text className="text-xs text-red-600">{result.message}</Text>
      </View>
    );
  }
  return (
    <View className="gap-2">
      <Text className="text-sm font-medium text-emerald-700">
        {MODE_LABEL[result.mode]} 성공
      </Text>
      <View className="rounded-md bg-neutral-100 p-3">
        <Text className="font-mono text-xs text-neutral-800">
          {JSON.stringify(result.payload, null, 2)}
        </Text>
      </View>
    </View>
  );
}

function Section({
  title,
  description,
  children,
}: {
  title: string;
  description?: string;
  children: React.ReactNode;
}) {
  return (
    <View className="gap-3">
      <View className="gap-1">
        <Text className="text-sm font-semibold uppercase tracking-wide text-neutral-500">
          {title}
        </Text>
        {description ? (
          <Text className="text-xs text-neutral-500">{description}</Text>
        ) : null}
      </View>
      <View className="gap-2">{children}</View>
    </View>
  );
}

function messageOf(err: unknown): string {
  if (err instanceof Error) return err.message;
  return String(err);
}
