import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Alert, Pressable, ScrollView, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { sendVerificationCode, type VerificationKind } from '@/lib/api';
import { useSession } from '@/lib/domain';

export default function VerificationIndex() {
  const router = useRouter();
  const { session } = useSession();
  const schoolVerified = session?.user.badges.some((b) => b.kind === 'school') ?? false;
  const companyVerified = session?.user.badges.some((b) => b.kind === 'company') ?? false;

  return (
    <SafeAreaView className="flex-1 bg-white" edges={['top']}>
      <View className="flex-row items-center gap-2 border-b border-neutral-100 px-3 py-2">
        <Pressable onPress={() => router.back()} className="h-9 w-9 items-center justify-center">
          <Text className="text-2xl text-neutral-700">‹</Text>
        </Pressable>
        <Text className="text-base font-semibold text-neutral-900">신원 인증</Text>
      </View>

      <ScrollView contentContainerClassName="gap-5 p-5">
        <Text className="text-sm leading-5 text-neutral-500">
          학교 또는 회사 이메일로 인증하면 프로필에 인증 배지가 표시돼요. 상대방에게 신뢰를 줄 수
          있어요.
        </Text>

        <VerifyCard
          kind="student"
          icon="🎓"
          title="학교 이메일 인증"
          placeholder="학교 이메일을 입력해주세요"
          verified={schoolVerified}
          bullets={[
            '학교 이메일(.ac.kr, .edu 등) 형식만 가능해요',
            '인증 처리까지 최대 1일 소요될 수 있어요',
          ]}
          onConfirm={() => router.push('/verification/school' as never)}
        />

        <VerifyCard
          kind="company"
          icon="🏢"
          title="회사 이메일 인증"
          placeholder="회사 이메일을 입력해주세요"
          verified={companyVerified}
          bullets={[
            '개인 이메일(gmail, naver 등)은 인증이 불가해요',
            '인증 처리까지 최대 1일 소요될 수 있어요',
          ]}
          onConfirm={() => router.push('/verification/company' as never)}
        />
      </ScrollView>
    </SafeAreaView>
  );
}

function VerifyCard({
  kind,
  icon,
  title,
  placeholder,
  verified,
  bullets,
  onConfirm,
}: {
  kind: VerificationKind;
  icon: string;
  title: string;
  placeholder: string;
  verified: boolean;
  bullets: string[];
  onConfirm: () => void;
}) {
  const [email, setEmail] = useState('');
  const [sending, setSending] = useState(false);

  const send = async () => {
    if (!email.includes('@')) {
      Alert.alert('이메일을 확인해주세요');
      return;
    }
    setSending(true);
    const res = await sendVerificationCode(kind, { email });
    setSending(false);
    if (res.error) {
      Alert.alert('발송 실패', '잠시 후 다시 시도해주세요.');
      return;
    }
    Alert.alert('인증 메일 발송', '메일의 인증 절차를 진행해주세요.', [
      { text: '확인', onPress: onConfirm },
    ]);
  };

  return (
    <View className="gap-3 rounded-2xl bg-neutral-50 p-4">
      <View className="flex-row items-center justify-between">
        <Text className="text-base font-semibold text-neutral-900">
          {icon} {title}
        </Text>
        <View
          className={`rounded-full px-2 py-0.5 ${verified ? 'bg-emerald-50' : 'bg-[#256EF4]/15'}`}
        >
          <Text className={`text-[10px] ${verified ? 'text-emerald-700' : 'text-[#256EF4]'}`}>
            {verified ? '인증완료' : '미인증'}
          </Text>
        </View>
      </View>

      <TextInput
        value={email}
        onChangeText={setEmail}
        placeholder={placeholder}
        keyboardType="email-address"
        autoCapitalize="none"
        editable={!verified}
        className="rounded-xl border border-neutral-200 bg-white px-4 py-3 text-sm text-neutral-900"
      />

      <Pressable
        onPress={send}
        disabled={verified || sending}
        className={`h-11 items-center justify-center rounded-xl ${
          verified ? 'bg-neutral-200' : 'bg-[#256EF4] active:opacity-90'
        }`}
      >
        <Text className={`text-sm font-semibold ${verified ? 'text-neutral-400' : 'text-white'}`}>
          {verified ? '인증 완료됨' : sending ? '발송 중...' : '인증 메일 발송'}
        </Text>
      </Pressable>

      <View className="gap-1">
        {bullets.map((b, i) => (
          <Text key={i} className="text-[11px] text-neutral-400">
            • {b}
          </Text>
        ))}
      </View>
    </View>
  );
}
