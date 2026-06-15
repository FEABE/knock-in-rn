import { Pressable, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { SupportHeader } from '@/components/support/support-header';
import { TextField, Toggle } from '@/components/ui/headless';

import type { UseInquiryFormScreenReturn } from './use-inquiry-form-screen';

export type InquiryFormScreenViewProps = UseInquiryFormScreenReturn;

export function InquiryFormScreenView({
  title,
  body,
  isPublic,
  canSubmit,
  submitted,
  setTitle,
  setBody,
  setIsPublic,
  submit,
}: InquiryFormScreenViewProps) {
  return (
    <SafeAreaView className="flex-1 bg-white" edges={['top']}>
      <SupportHeader title="문의하기" />

      <ScrollView contentContainerClassName="gap-6 p-5">
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

          <View className="flex-row items-center justify-between rounded-lg border border-neutral-200 px-4 py-3">
            <View className="flex-1 pr-3">
              <Text className="text-sm text-neutral-800">공개 문의</Text>
              <Text className="text-[10px] text-neutral-400">
                공개 시 다른 사용자도 답변을 볼 수 있어요
              </Text>
            </View>
            <Toggle checked={isPublic} onCheckedChange={setIsPublic}>
              {({ checked }) => (
                <View
                  className={`h-7 w-12 flex-row items-center rounded-full px-1 ${
                    checked ? 'bg-[#256EF4]' : 'bg-neutral-300'
                  }`}
                >
                  <View className={`h-5 w-5 rounded-full bg-white ${checked ? 'ml-5' : 'ml-0'}`} />
                </View>
              )}
            </Toggle>
          </View>

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
              문의 접수
            </Text>
          </Pressable>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
