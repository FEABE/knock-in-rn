import { useRouter } from 'expo-router';
import { useState } from 'react';
import {
  Alert,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { AgreementForm, TextField } from '@/components/ui/headless';
import {
  useAgreementStore,
  useSession,
  type AgreementRecord,
} from '@/lib/domain';

type Mode =
  | { kind: 'list' }
  | { kind: 'edit'; record?: AgreementRecord };

export default function AgreementScreen() {
  const router = useRouter();
  const { session } = useSession();
  const { agreements, upsertDraft, finalize, remove } = useAgreementStore();
  const [mode, setMode] = useState<Mode>({ kind: 'list' });

  if (!session) {
    return (
      <SafeAreaView className="flex-1 bg-white" edges={['top']}>
        <View className="flex-1 items-center justify-center p-10">
          <Text className="text-sm text-neutral-500">
            로그인 후 이용 가능해요
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  if (mode.kind === 'edit') {
    return (
      <SafeAreaView className="flex-1 bg-white" edges={['top']}>
        <View className="flex-row items-center gap-2 border-b border-neutral-100 px-3 py-2">
          <Pressable
            onPress={() => setMode({ kind: 'list' })}
            className="h-9 w-9 items-center justify-center"
          >
            <Text className="text-2xl text-neutral-700">‹</Text>
          </Pressable>
          <Text className="text-base font-semibold text-neutral-900">
            {mode.record ? '합의서 수정' : '새 합의서 작성'}
          </Text>
        </View>

        <AgreementForm
          initial={mode.record?.values}
          initialPartnerName={mode.record?.partnerName ?? ''}
          onSubmit={({ partnerName, values }) => {
            const saved = upsertDraft({
              id: mode.record?.id,
              partnerName,
              values,
            });
            Alert.alert('저장 완료', '합의서 초안이 저장됐어요.', [
              { text: '확인', onPress: () => setMode({ kind: 'list' }) },
            ]);
            return saved;
          }}
        >
          {({
            partnerName,
            setPartnerName,
            fields,
            filledCount,
            totalCount,
            progress,
            canFinalize,
            submit,
          }) => (
            <ScrollView contentContainerClassName="gap-5 p-5 pb-28">
              <View className="gap-2">
                <Text className="text-sm font-semibold text-neutral-800">
                  룸메이트 이름
                </Text>
                <TextField
                  value={partnerName}
                  onChangeValue={setPartnerName}
                  placeholder="합의 상대 이름"
                  className="rounded-xl border border-neutral-200 px-4 py-3 text-base"
                />
              </View>

              <View className="gap-2">
                <View className="h-1.5 w-full overflow-hidden rounded-full bg-neutral-200">
                  <View
                    style={{ width: `${progress * 100}%` }}
                    className="h-full rounded-full bg-violet-600"
                  />
                </View>
                <Text className="text-xs text-neutral-400">
                  {filledCount} / {totalCount} 섹션 작성됨
                </Text>
              </View>

              {fields.map((f) => (
                <View key={f.section.key} className="gap-2">
                  <Text className="text-sm font-semibold text-neutral-800">
                    {f.section.label}
                  </Text>
                  <TextInput
                    value={f.value}
                    onChangeText={f.onChangeText}
                    placeholder={f.section.placeholder}
                    multiline
                    numberOfLines={3}
                    className="min-h-[88px] rounded-xl border border-neutral-200 px-4 py-3 text-base"
                  />
                </View>
              ))}

              <View className="flex-row gap-2 pb-4">
                <Pressable
                  onPress={submit}
                  className="flex-1 items-center justify-center rounded-xl border border-violet-600 py-3"
                >
                  <Text className="text-sm font-semibold text-violet-600">
                    초안 저장
                  </Text>
                </Pressable>
                <Pressable
                  onPress={() => {
                    if (!canFinalize) return;
                    const saved = upsertDraft({
                      id: mode.record?.id,
                      partnerName,
                      values: fields.reduce<
                        Parameters<typeof upsertDraft>[0]['values']
                      >((acc, f) => {
                        acc[f.section.key] = f.value;
                        return acc;
                      }, {} as Parameters<typeof upsertDraft>[0]['values']),
                    });
                    finalize(saved.id);
                    Alert.alert(
                      '합의서 확정',
                      '확정된 합의서는 양쪽 모두 열람 가능해요.',
                      [{ text: '확인', onPress: () => setMode({ kind: 'list' }) }],
                    );
                  }}
                  disabled={!canFinalize}
                  className={`flex-1 items-center justify-center rounded-xl py-3 ${
                    canFinalize ? 'bg-violet-600' : 'bg-neutral-300'
                  }`}
                >
                  <Text
                    className={
                      canFinalize
                        ? 'text-sm font-semibold text-white'
                        : 'text-sm font-semibold text-neutral-500'
                    }
                  >
                    저장 후 확정
                  </Text>
                </Pressable>
              </View>
            </ScrollView>
          )}
        </AgreementForm>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-white" edges={['top']}>
      <View className="flex-row items-center justify-between border-b border-neutral-100 px-3 py-2">
        <View className="flex-row items-center gap-2">
          <Pressable
            onPress={() => router.back()}
            className="h-9 w-9 items-center justify-center"
          >
            <Text className="text-2xl text-neutral-700">‹</Text>
          </Pressable>
          <Text className="text-base font-semibold text-neutral-900">
            공동생활 합의서
          </Text>
        </View>
        <Pressable
          onPress={() => setMode({ kind: 'edit' })}
          className="rounded-full bg-violet-600 px-3 py-1.5"
        >
          <Text className="text-xs font-semibold text-white">+ 새 작성</Text>
        </Pressable>
      </View>

      <ScrollView contentContainerClassName="gap-4 p-5">
        <View className="gap-1 rounded-2xl bg-violet-50 p-4">
          <Text className="text-sm font-semibold text-blue-900">
            왜 합의서를 작성하나요?
          </Text>
          <Text className="text-xs text-blue-900/70">
            청소/소음/공과금/방문객 등 공동생활 규칙을 사전에 정해두면 분쟁
            시 기준이 됩니다.
          </Text>
        </View>

        {agreements.length === 0 ? (
          <View className="rounded-2xl border border-dashed border-neutral-200 p-10">
            <Text className="text-center text-sm text-neutral-400">
              아직 작성된 합의서가 없어요
            </Text>
          </View>
        ) : (
          agreements.map((a) => (
            <View
              key={a.id}
              className="gap-3 rounded-2xl border border-neutral-200 bg-white p-4"
            >
              <View className="flex-row items-center justify-between">
                <Text className="text-base font-semibold text-neutral-900">
                  {a.partnerName || '이름 미지정'}
                </Text>
                <Text
                  className={`rounded-full px-2 py-0.5 text-[10px] ${
                    a.status === 'finalized'
                      ? 'bg-emerald-50 text-emerald-700'
                      : 'bg-neutral-100 text-neutral-500'
                  }`}
                >
                  {a.status === 'finalized' ? '확정됨' : '초안'}
                </Text>
              </View>
              <Text className="text-xs text-neutral-400">
                {fmtDate(a.createdAt)} 작성
                {a.finalizedAt ? ` · ${fmtDate(a.finalizedAt)} 확정` : ''}
              </Text>
              <View className="gap-1">
                {Object.entries(a.values)
                  .filter(([, v]) => v.trim().length > 0)
                  .slice(0, 2)
                  .map(([k, v]) => (
                    <Text
                      key={k}
                      numberOfLines={1}
                      className="text-xs text-neutral-600"
                    >
                      · {v}
                    </Text>
                  ))}
              </View>
              <View className="flex-row gap-2">
                <Pressable
                  onPress={() => setMode({ kind: 'edit', record: a })}
                  className="flex-1 items-center rounded-xl border border-neutral-200 py-2.5"
                >
                  <Text className="text-sm font-medium text-neutral-700">
                    {a.status === 'finalized' ? '열람' : '수정'}
                  </Text>
                </Pressable>
                <Pressable
                  onPress={() =>
                    Alert.alert('삭제', '합의서를 삭제할까요?', [
                      { text: '취소', style: 'cancel' },
                      {
                        text: '삭제',
                        style: 'destructive',
                        onPress: () => remove(a.id),
                      },
                    ])
                  }
                  className="flex-1 items-center rounded-xl border border-red-200 py-2.5"
                >
                  <Text className="text-sm font-medium text-red-500">
                    삭제
                  </Text>
                </Pressable>
              </View>
            </View>
          ))
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

function fmtDate(d: Date): string {
  return `${d.getFullYear()}.${String(d.getMonth() + 1).padStart(2, '0')}.${String(d.getDate()).padStart(2, '0')}`;
}
