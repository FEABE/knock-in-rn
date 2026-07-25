import { Ionicons } from '@expo/vector-icons';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { AgreementForm, TextField } from '@/components/ui/headless';
import type { AgreementRecord, AgreementValues } from '@/lib/domain';

import type { UseAgreementScreenReturn } from './use-agreement-screen';

export type AgreementScreenViewProps = UseAgreementScreenReturn;

export function AgreementScreenView(props: AgreementScreenViewProps) {
  if (!props.loggedIn) return <LoginRequiredState />;
  if (props.mode.kind === 'edit')
    return <AgreementEditView {...props} record={props.mode.record} />;
  return <AgreementListView {...props} />;
}

function LoginRequiredState() {
  return (
    <SafeAreaView className="flex-1 bg-white" edges={['top', 'bottom']}>
      <View className="flex-1 items-center justify-center p-10">
        <Text className="text-sm text-neutral-500">로그인 후 이용 가능해요</Text>
      </View>
    </SafeAreaView>
  );
}

function AgreementEditView({
  record,
  closeEdit,
  saveDraft,
  finalizeDraft,
  saving,
  partnerName,
}: AgreementScreenViewProps & { record?: AgreementRecord }) {
  return (
    <SafeAreaView className="flex-1 bg-white" edges={['top', 'bottom']}>
      <View className="flex-row items-center gap-2 border-b border-neutral-100 px-3 py-2">
        <Pressable onPress={closeEdit} className="h-9 w-9 items-center justify-center">
          <Ionicons name="chevron-back" size={24} color="#404047" />
        </Pressable>
        <Text className="text-base font-semibold text-neutral-900">
          {record ? '합의서 수정' : '새 합의서 작성'}
        </Text>
      </View>

      <AgreementForm
        initial={record?.values}
        initialPartnerName={record?.partnerName ?? partnerName}
        onSubmit={({ partnerName, values }) => saveDraft({ partnerName, values, record })}
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
          <ScrollView
            contentContainerClassName="gap-5 p-5 pb-28"
            keyboardShouldPersistTaps="handled"
            keyboardDismissMode="interactive"
            automaticallyAdjustKeyboardInsets
          >
            <View className="gap-2">
              <Text className="text-sm font-semibold text-neutral-800">룸메이트 이름</Text>
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
                  className="h-full rounded-full bg-[#256EF4]"
                />
              </View>
              <Text className="text-xs text-neutral-400">
                {filledCount} / {totalCount} 섹션 작성됨
              </Text>
            </View>

            {fields.map((field) => (
              <View key={field.section.key} className="gap-2">
                <Text className="text-sm font-semibold text-neutral-800">
                  {field.section.label}
                </Text>
                <TextField
                  value={field.value}
                  onChangeValue={field.onChangeText}
                  placeholder={field.section.placeholder}
                  multiline
                  numberOfLines={3}
                  className="min-h-[88px] rounded-xl border border-neutral-200 px-4 py-3 text-base"
                />
              </View>
            ))}

            <View className="flex-row gap-2 pb-4">
              <Pressable
                onPress={() => void submit()}
                disabled={saving}
                className="flex-1 items-center justify-center rounded-xl border border-[#256EF4] py-3"
              >
                <Text className="text-sm font-semibold text-[#256EF4]">초안 저장</Text>
              </Pressable>
              <Pressable
                onPress={() => {
                  if (!canFinalize || saving) return;
                  void finalizeDraft({
                    partnerName,
                    values: fields.reduce<AgreementValues>((acc, field) => {
                      acc[field.section.key] = field.value;
                      return acc;
                    }, {} as AgreementValues),
                    record,
                  });
                }}
                disabled={!canFinalize || saving}
                className={`flex-1 items-center justify-center rounded-xl py-3 ${
                  canFinalize ? 'bg-[#256EF4]' : 'bg-neutral-300'
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

function AgreementListView({
  agreements,
  hasRoommate,
  loading,
  error,
  saving,
  onBack,
  openNew,
  openEdit,
  deleteAgreement,
}: AgreementScreenViewProps) {
  return (
    <SafeAreaView className="flex-1 bg-white" edges={['top', 'bottom']}>
      <View className="flex-row items-center justify-between border-b border-neutral-100 px-3 py-2">
        <View className="flex-row items-center gap-2">
          <Pressable onPress={onBack} className="h-9 w-9 items-center justify-center">
            <Ionicons name="chevron-back" size={24} color="#404047" />
          </Pressable>
          <Text className="text-base font-semibold text-neutral-900">공동생활 합의서</Text>
        </View>
        <Pressable
          onPress={openNew}
          disabled={saving || !hasRoommate}
          className={`rounded-full px-3 py-1.5 ${hasRoommate ? 'bg-[#256EF4]' : 'bg-neutral-200'}`}
        >
          <Text
            className={`text-xs font-semibold ${hasRoommate ? 'text-white' : 'text-neutral-400'}`}
          >
            + 새 작성
          </Text>
        </Pressable>
      </View>

      <ScrollView contentContainerClassName="gap-4 p-5">
        <View className="gap-1 rounded-2xl bg-[#256EF4]/10 p-4">
          <Text className="text-sm font-semibold text-[#256EF4]">왜 합의서를 작성하나요?</Text>
          <Text className="text-xs text-[#256EF4]/70">
            청소/소음/공과금/방문객 등 공동생활 규칙을 사전에 정해두면 분쟁 시 기준이 됩니다.
          </Text>
        </View>

        {loading ? (
          <View className="rounded-2xl border border-neutral-200 p-10">
            <Text className="text-center text-sm text-neutral-400">합의서를 불러오는 중이에요</Text>
          </View>
        ) : error ? (
          <View className="rounded-2xl border border-red-100 bg-red-50 p-5">
            <Text className="text-center text-sm text-red-500">{error}</Text>
          </View>
        ) : agreements.length === 0 ? (
          <View className="rounded-2xl border border-dashed border-neutral-200 p-10">
            <Text className="text-center text-sm text-neutral-400">
              {hasRoommate
                ? '아직 작성된 합의서가 없어요'
                : '룸메이트 연결 후 합의서를 작성할 수 있어요'}
            </Text>
          </View>
        ) : (
          agreements.map((agreement) => (
            <AgreementCard
              key={agreement.id}
              agreement={agreement}
              onEdit={() => openEdit(agreement)}
              onDelete={() => deleteAgreement(agreement)}
            />
          ))
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

function AgreementCard({
  agreement,
  onEdit,
  onDelete,
}: {
  agreement: AgreementRecord;
  onEdit: () => void;
  onDelete: () => void;
}) {
  return (
    <View className="gap-3 rounded-2xl border border-neutral-200 bg-white p-4">
      <View className="flex-row items-center justify-between">
        <Text className="text-base font-semibold text-neutral-900">
          {agreement.partnerName || '이름 미지정'}
        </Text>
        <Text
          className={`rounded-full px-2 py-0.5 text-[10px] ${
            agreement.status === 'finalized'
              ? 'bg-emerald-50 text-emerald-700'
              : 'bg-neutral-100 text-neutral-500'
          }`}
        >
          {agreement.status === 'finalized' ? '확정됨' : '초안'}
        </Text>
      </View>
      <Text className="text-xs text-neutral-400">
        {fmtDate(agreement.createdAt)} 작성
        {agreement.finalizedAt ? ` · ${fmtDate(agreement.finalizedAt)} 확정` : ''}
      </Text>
      <View className="gap-1">
        {Object.entries(agreement.values)
          .filter(([, value]) => value.trim().length > 0)
          .slice(0, 2)
          .map(([key, value]) => (
            <Text key={key} numberOfLines={1} className="text-xs text-neutral-600">
              · {value}
            </Text>
          ))}
      </View>
      <View className="flex-row gap-2">
        <Pressable
          onPress={onEdit}
          className="flex-1 items-center rounded-xl border border-neutral-200 py-2.5"
        >
          <Text className="text-sm font-medium text-neutral-700">
            {agreement.status === 'finalized' ? '열람' : '수정'}
          </Text>
        </Pressable>
        <Pressable
          onPress={onDelete}
          className="flex-1 items-center rounded-xl border border-red-200 py-2.5"
        >
          <Text className="text-sm font-medium text-red-500">삭제</Text>
        </Pressable>
      </View>
    </View>
  );
}

function fmtDate(d: Date): string {
  return `${d.getFullYear()}.${String(d.getMonth() + 1).padStart(2, '0')}.${String(
    d.getDate(),
  ).padStart(2, '0')}`;
}
