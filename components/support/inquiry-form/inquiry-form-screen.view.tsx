import { Pressable, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { SupportHeader } from '@/components/support/support-header';
import { TextField } from '@/components/ui/headless';

import type { UseInquiryFormScreenReturn } from './use-inquiry-form-screen';

export type InquiryFormScreenViewProps = UseInquiryFormScreenReturn;

const BODY_MAX_LENGTH = 500;

export function InquiryFormScreenView({
  title,
  body,
  categories,
  categoryId,
  loadingCategories,
  submitError,
  canSubmit,
  submitting,
  setCategoryId,
  setTitle,
  setBody,
  submit,
}: InquiryFormScreenViewProps) {
  return (
    <SafeAreaView className="flex-1 bg-white" edges={['top', 'bottom']}>
      <SupportHeader title="문의하기" />

      <ScrollView
        contentContainerClassName="gap-7 p-5"
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="interactive"
        automaticallyAdjustKeyboardInsets
      >
        {submitError ? (
          <View className="rounded-lg bg-rose-50 p-3">
            <Text className="text-xs text-rose-600">{submitError}</Text>
          </View>
        ) : null}

        <View className="gap-2">
          <FieldLabel label="문의 유형" />
          {loadingCategories ? (
            <Text className="text-xs text-neutral-400">유형을 불러오는 중...</Text>
          ) : (
            <View className="flex-row flex-wrap gap-2">
              {categories.map((category) => {
                const selected = categoryId === category.id;
                return (
                  <Pressable
                    key={category.id}
                    onPress={() => setCategoryId(category.id)}
                    className={`rounded-lg border px-3 py-2 ${
                      selected ? 'border-[#256EF4] bg-[#EEF4FF]' : 'border-[#DADAE8] bg-white'
                    }`}
                  >
                    <Text
                      className={`text-[13px] font-medium ${
                        selected ? 'text-[#256EF4]' : 'text-[#696976]'
                      }`}
                    >
                      {category.name}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
          )}
        </View>

        <View className="gap-2">
          <FieldLabel label="제목" />
          <TextField
            value={title}
            onChangeValue={setTitle}
            placeholder="제목을 입력해주세요"
            className="border-b border-neutral-300 py-2 text-base text-neutral-900"
          />
        </View>

        <View className="gap-2">
          <FieldLabel label="내용" />
          <TextField
            value={body}
            onChangeValue={setBody}
            placeholder="내용을 입력해주세요"
            multiline
            numberOfLines={6}
            maxLength={BODY_MAX_LENGTH}
            className="min-h-[120px] border-b border-neutral-300 py-2 text-base text-neutral-900"
          />
          <Text className="self-end text-xs text-[#AAAABA]">
            {body.length}/{BODY_MAX_LENGTH}
          </Text>
        </View>

        <Pressable
          disabled={!canSubmit}
          onPress={submit}
          className={`h-12 items-center justify-center rounded-lg ${
            canSubmit ? 'bg-[#256EF4] active:opacity-90' : 'bg-[#ECECF3]'
          }`}
        >
          <Text className={`text-[15px] font-bold ${canSubmit ? 'text-white' : 'text-[#AAAABA]'}`}>
            {submitting ? '제출 중...' : '제출하기'}
          </Text>
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}

function FieldLabel({ label }: { label: string }) {
  return <Text className="text-sm font-semibold text-neutral-900">{label}</Text>;
}
