import { Pressable, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { SupportHeader } from '@/components/support/support-header';
import { TextField } from '@/components/ui/headless';

import type { UseInquiryFormScreenReturn } from './use-inquiry-form-screen';

export type InquiryFormScreenViewProps = UseInquiryFormScreenReturn;

export function InquiryFormScreenView({
  title,
  body,
  categories,
  categoryId,
  loadingCategories,
  submitError,
  canSubmit,
  submitted,
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
        contentContainerClassName="gap-6 p-5"
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="interactive"
        automaticallyAdjustKeyboardInsets
      >
        {submitted ? (
          <View className="gap-1 rounded-lg bg-emerald-50 p-4">
            <Text className="text-sm font-semibold text-emerald-700">문의가 접수됐어요</Text>
            <Text className="text-xs text-emerald-600">
              답변 상태는 문의내역에서 확인할 수 있어요.
            </Text>
          </View>
        ) : null}

        <View className="gap-3">
          <Text className="text-sm font-semibold text-neutral-800">새 문의 작성</Text>
          {submitError ? (
            <View className="rounded-lg bg-rose-50 p-3">
              <Text className="text-xs text-rose-600">{submitError}</Text>
            </View>
          ) : null}
          <View className="gap-2">
            <Text className="text-xs font-medium text-neutral-500">문의 유형</Text>
            <View className="flex-row flex-wrap gap-2">
              {loadingCategories ? (
                <Text className="text-xs text-neutral-400">유형을 불러오는 중...</Text>
              ) : (
                categories.map((category) => (
                  <Pressable
                    key={category.id}
                    onPress={() => setCategoryId(category.id)}
                    className={`rounded-full border px-3 py-2 ${
                      categoryId === category.id
                        ? 'border-[#256EF4] bg-[#256EF4]'
                        : 'border-neutral-200 bg-white'
                    }`}
                  >
                    <Text
                      className={
                        categoryId === category.id
                          ? 'text-xs font-semibold text-white'
                          : 'text-xs text-neutral-700'
                      }
                    >
                      {category.name}
                    </Text>
                  </Pressable>
                ))
              )}
            </View>
          </View>
          <TextField
            value={title}
            onChangeValue={setTitle}
            placeholder="제목"
            className="rounded-lg border border-neutral-200 px-4 py-3 text-base"
          />
          <TextField
            value={body}
            onChangeValue={setBody}
            placeholder="문의 내용을 자세히 적어주세요"
            multiline
            numberOfLines={6}
            className="min-h-[140px] rounded-lg border border-neutral-200 px-4 py-3 text-base"
          />

          <Pressable
            disabled={!canSubmit}
            onPress={submit}
            className={`h-12 items-center justify-center rounded-lg ${
              canSubmit ? 'bg-[#256EF4]' : 'bg-neutral-300'
            }`}
          >
            <Text
              className={
                canSubmit
                  ? 'text-sm font-semibold text-white'
                  : 'text-sm font-semibold text-neutral-500'
              }
            >
              {submitting ? '접수 중...' : '문의 접수'}
            </Text>
          </Pressable>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
