import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { Alert, Pressable, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ScaleSlider } from '@/components/onboarding/scale-slider';
import { SegmentedControl } from '@/components/ui/headless';
import { AnalyticsEvent, logEvent } from '@/lib/analytics';
import { savePreferenceAll } from '@/lib/api';
import { ONBOARDING_WRITE_ENABLED } from '@/lib/onboarding';

const PRIORITIES = [
  { id: 'sleep', name: '취침 시간', desc: '비슷한 수면 패턴', icon: '🌙' },
  { id: 'clean', name: '청결', desc: '청결 기준이 비슷한 분', icon: '🧹' },
  { id: 'noise', name: '소음', desc: '소음 민감도가 비슷한 분', icon: '🔇' },
  { id: 'smoking', name: '흡연 여부', desc: '흡연 / 비흡연 여부', icon: '🚬' },
  { id: 'pet', name: '반려동물', desc: '반려동물 유무', icon: '🐾' },
  { id: 'visitor', name: '방문객 빈도', desc: '손님 초청 빈도', icon: '🚪' },
  { id: 'personality', name: '성격 스타일', desc: '내향적 / 외향적', icon: '😊' },
  { id: 'privacy', name: '개인 공간', desc: '개인 공간 중요도', icon: '🏠' },
];

export default function PreferencesScreen() {
  const router = useRouter();
  const { from } = useLocalSearchParams<{ from?: string }>();
  // 온보딩 완료 직후 진입이면 "나중에/완료" 시 탐색으로, 마이페이지 진입이면 그대로 복귀.
  const fromOnboarding = from === 'onboarding';
  const exit = () => {
    if (fromOnboarding) router.replace('/explore' as never);
    else router.back();
  };
  const [step, setStep] = useState<0 | 1 | 2>(0);

  // 선호 조건 각 화면 진입 (step 0 은 유도 화면이므로 제외).
  useEffect(() => {
    if (step === 1) logEvent(AnalyticsEvent.PREFERENCE_STEP_VIEW, { step: 'lifestyle_preference' });
    else if (step === 2)
      logEvent(AnalyticsEvent.PREFERENCE_STEP_VIEW, { step: 'priority_selection' });
  }, [step]);

  // "나중에 할게요" — 설정을 미루는 비율.
  const skip = () => {
    logEvent(AnalyticsEvent.PREFERENCE_PROMPT_SKIP);
    exit();
  };

  const [gender, setGender] = useState<string | null>('same');
  const [personality, setPersonality] = useState<number | null>(3);
  const [privacy, setPrivacy] = useState<number | null>(3);
  const [visitor, setVisitor] = useState<number | null>(3);
  const [smoking, setSmoking] = useState<string | null>('any');
  const [pet, setPet] = useState<string | null>('any');
  const [selected, setSelected] = useState<string[]>([]);

  const toggle = (id: string) => {
    const name = PRIORITIES.find((p) => p.id === id)?.name ?? id;
    if (selected.includes(id)) {
      // 선택 취소 — 결정하기 애매한 조건 파악.
      logEvent(AnalyticsEvent.PREFERENCE_PRIORITY_DESELECT, { condition_name: name });
      setSelected((p) => p.filter((x) => x !== id));
      return;
    }
    if (selected.length >= 3) return;
    // 1·2·3순위를 rank 로 기록 (어떤 조건이 1순위로 가장 많이 뽑히는지).
    logEvent(AnalyticsEvent.PREFERENCE_PRIORITY_SELECT, {
      condition_name: name,
      rank: selected.length + 1,
    });
    setSelected((p) => [...p, id]);
  };

  const save = async () => {
    logEvent(AnalyticsEvent.PREFERENCE_COMPLETE);
    // 외부 UT: 저장 비활성화 — API 없이 완료 처리. (온보딩 저장과 동일 플래그)
    if (ONBOARDING_WRITE_ENABLED) {
      const res = await savePreferenceAll({
        lifestyles: [
          `gender-${gender}`,
          `personality-${personality}`,
          `privacy-${privacy}`,
          `visitor-${visitor}`,
          `smoking-${smoking}`,
          `pet-${pet}`,
        ],
        conditions: selected,
      });
      if (res.error) {
        Alert.alert('저장 실패');
        return;
      }
    }
    Alert.alert('저장 완료', '선호 조건이 저장되었어요.', [{ text: '확인', onPress: exit }]);
  };

  if (step === 0) {
    return (
      <SafeAreaView className="flex-1 bg-neutral-100" edges={['top']}>
        <View className="flex-1 justify-end">
          <View className="items-center gap-3 rounded-t-3xl bg-white px-5 pb-8 pt-6">
            <Text className="text-4xl">🎯</Text>
            <Text className="text-xl font-bold text-neutral-900">매칭 정확도를 높여볼까요?</Text>
            <Text className="text-center text-sm text-neutral-500">
              원하는 룸메이트 조건을 설정하면{'\n'}
              <Text className="font-semibold text-[#256EF4]">궁합 점수가 더 정확</Text>
              해져요
            </Text>
            <View className="my-2 flex-row gap-3">
              <View className="flex-1 items-center gap-1 rounded-xl bg-neutral-50 py-3">
                <Text className="text-xs font-semibold text-[#256EF4]">Step 1</Text>
                <Text className="text-center text-xs text-neutral-500">
                  원하는 생활패턴{'\n'}설정
                </Text>
              </View>
              <View className="flex-1 items-center gap-1 rounded-xl bg-neutral-50 py-3">
                <Text className="text-xs font-semibold text-[#256EF4]">Step 2</Text>
                <Text className="text-center text-xs text-neutral-500">
                  중요 조건{'\n'}최대 3개 선택
                </Text>
              </View>
            </View>
            <Pressable
              onPress={() => {
                logEvent(AnalyticsEvent.PREFERENCE_PROMPT_START);
                setStep(1);
              }}
              className="h-12 w-full items-center justify-center rounded-xl bg-[#256EF4] active:opacity-90"
            >
              <Text className="text-base font-semibold text-white">지금 설정할게요</Text>
            </Pressable>
            <Pressable onPress={skip} className="py-2">
              <Text className="text-sm text-neutral-500">나중에 할게요</Text>
            </Pressable>
            <Text className="text-xs text-neutral-400">마이페이지에서 언제든 설정할 수 있어요</Text>
          </View>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-white" edges={['top']}>
      <View className="flex-row items-center gap-2 border-b border-neutral-100 px-3 py-2">
        <Pressable
          onPress={() => (step === 1 ? setStep(0) : setStep(1))}
          className="h-9 w-9 items-center justify-center"
        >
          <Text className="text-2xl text-neutral-700">‹</Text>
        </Pressable>
        <Text className="text-base font-semibold text-neutral-900">선호 조건</Text>
        <Text className="ml-auto text-xs text-neutral-400">{step} / 2</Text>
      </View>

      {step === 1 ? (
        <>
          <ScrollView className="flex-1" contentContainerClassName="gap-7 p-5 pb-28">
            <View className="gap-1">
              <Text className="text-2xl font-bold text-neutral-900">원하는 룸메이트의</Text>
              <Text className="text-2xl font-bold text-neutral-900">생활패턴은요?</Text>
              <Text className="mt-1 text-sm text-neutral-500">
                상대방에게 원하는 조건을 설정해요
              </Text>
            </View>

            <Pick
              label="선호 룸메이트 성별"
              options={[
                { value: 'same', label: '동성만' },
                { value: 'any', label: '성별 무관' },
              ]}
              value={gender}
              onChange={setGender}
            />
            <ScaleSlider
              label="원하는 성격 스타일"
              valueLabel={
                ['내향적', '조금', '상관없어요', '조금', '외향적'][(personality ?? 3) - 1]
              }
              minLabel="내향적"
              maxLabel="외향적"
              value={personality}
              onChange={setPersonality}
            />
            <ScaleSlider
              label="개인 공간 중요도"
              valueLabel={
                ['덜 중요해도 OK', '', '보통', '', '중요하게 여겨요'][(privacy ?? 3) - 1] || '보통'
              }
              minLabel="덜 중요해도 OK"
              maxLabel="중요하게 여기는 분"
              value={privacy}
              onChange={setPrivacy}
            />
            <ScaleSlider
              label="방문객 빈도"
              valueLabel={
                ['거의 없으면 OK', '', '가끔까지 OK', '', '자주도 OK'][(visitor ?? 3) - 1] ||
                '가끔까지 OK'
              }
              minLabel="거의 없으면 OK"
              maxLabel="자주도 OK"
              value={visitor}
              onChange={setVisitor}
            />
            <Pick
              label="흡연 여부"
              options={[
                { value: 'any', label: '상관없어요' },
                { value: 'no', label: '비흡연자만' },
              ]}
              value={smoking}
              onChange={setSmoking}
            />
            <Pick
              label="반려동물"
              options={[
                { value: 'any', label: '상관없어요' },
                { value: 'no', label: '없었으면 해요' },
              ]}
              value={pet}
              onChange={setPet}
            />
          </ScrollView>
          <BottomBtn
            label="다음"
            onPress={() => {
              logEvent(AnalyticsEvent.PREFERENCE_STEP_NEXT, { step: 'lifestyle_preference' });
              setStep(2);
            }}
          />
        </>
      ) : (
        <>
          <ScrollView className="flex-1" contentContainerClassName="gap-4 p-5 pb-28">
            <View className="gap-1">
              <Text className="text-2xl font-bold text-neutral-900">가장 중요한 조건을</Text>
              <Text className="text-2xl font-bold text-neutral-900">골라주세요</Text>
              <Text className="mt-1 text-sm text-neutral-500">최대 3개까지 선택할 수 있어요</Text>
            </View>

            <View className="rounded-xl bg-[#256EF4]/10 px-3 py-2">
              <Text className="text-xs text-[#256EF4]">
                {selected.length} / 3 선택됨 · 선택한 항목에 궁합 가중치가 높아져요
              </Text>
            </View>

            {PRIORITIES.map((p) => {
              const on = selected.includes(p.id);
              return (
                <Pressable
                  key={p.id}
                  onPress={() => toggle(p.id)}
                  className={`flex-row items-center gap-3 rounded-2xl border p-4 ${
                    on ? 'border-[#256EF4] bg-[#256EF4]/10' : 'border-neutral-200'
                  }`}
                >
                  <Text className="text-xl">{p.icon}</Text>
                  <View className="flex-1">
                    <Text className="text-sm font-semibold text-neutral-900">{p.name}</Text>
                    <Text className="text-xs text-neutral-400">{p.desc}</Text>
                  </View>
                  <View
                    className={`h-6 w-6 items-center justify-center rounded-full ${
                      on ? 'bg-[#256EF4]' : 'border border-neutral-300'
                    }`}
                  >
                    {on ? <Text className="text-xs font-bold text-white">✓</Text> : null}
                  </View>
                </Pressable>
              );
            })}
          </ScrollView>
          <BottomBtn label="완료" onPress={save} />
        </>
      )}
    </SafeAreaView>
  );
}

function Pick({
  label,
  options,
  value,
  onChange,
}: {
  label: string;
  options: readonly { value: string; label: string }[];
  value: string | null;
  onChange: (v: string) => void;
}) {
  return (
    <View className="gap-2">
      <Text className="text-sm font-semibold text-neutral-800">{label}</Text>
      <SegmentedControl<string>
        options={options as { value: string; label: string }[]}
        value={value}
        onValueChange={onChange}
        className="flex-row gap-2"
        renderItem={({ option, selected }) => (
          <View
            className={`rounded-full border px-5 py-2 ${
              selected ? 'border-[#256EF4] bg-[#256EF4]' : 'border-neutral-300 bg-white'
            }`}
          >
            <Text
              className={selected ? 'text-sm font-medium text-white' : 'text-sm text-neutral-600'}
            >
              {option.label}
            </Text>
          </View>
        )}
      />
    </View>
  );
}

function BottomBtn({ label, onPress }: { label: string; onPress: () => void }) {
  return (
    <View className="absolute inset-x-0 bottom-0 border-t border-neutral-100 bg-white px-5 pb-6 pt-3">
      <Pressable
        onPress={onPress}
        className="h-12 items-center justify-center rounded-xl bg-[#256EF4] active:opacity-90"
      >
        <Text className="text-base font-semibold text-white">{label}</Text>
      </Pressable>
    </View>
  );
}
