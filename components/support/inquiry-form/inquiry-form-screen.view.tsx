import { KeyboardAvoidingView, Platform, Pressable, ScrollView, Text, View } from 'react-native';
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
      {/* 디자인(3748:79301)에서 제출 버튼은 스크롤을 따라오지 않고 하단에 고정된다. */}
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        className="flex-1"
      >
        <SupportHeader title="문의하기" />

        <ScrollView
          className="flex-1"
          contentContainerClassName="gap-[46px] px-4 pb-8 pt-5"
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode="interactive"
        >
          {submitError ? (
            <View className="rounded-lg bg-rose-50 p-3">
              <Text className="text-xs text-rose-600">{submitError}</Text>
            </View>
          ) : null}

          <View className="gap-3">
            <FieldLabel label="문의 유형" muted />
            {loadingCategories ? (
              <Text className="text-[15px] text-[#AAAABA]">유형을 불러오는 중...</Text>
            ) : (
              <View className="flex-row flex-wrap gap-2">
                {categories.map((category) => (
                  <CategoryChip
                    key={category.id}
                    label={category.name}
                    selected={categoryId === category.id}
                    onPress={() => setCategoryId(category.id)}
                  />
                ))}
              </View>
            )}
          </View>

          <View className="gap-3">
            <FieldLabel label="제목" />
            <View className="gap-1">
              <TextField
                value={title}
                onChangeValue={setTitle}
                placeholder="제목을 입력해주세요"
                className="text-[15px] leading-[23px] text-[#17171B]"
              />
              <FieldUnderline />
            </View>
          </View>

          <View className="gap-3">
            <FieldLabel label="내용" />
            <View className="gap-1">
              <TextField
                value={body}
                onChangeValue={setBody}
                placeholder="내용을 입력해주세요"
                multiline
                maxLength={BODY_MAX_LENGTH}
                className="text-[15px] leading-[23px] text-[#17171B]"
              />
              <FieldUnderline />
              <Text className="text-right text-sm leading-[21px]">
                <Text className="font-medium text-[#696976]">{body.length}</Text>
                <Text className="text-[#AAAABA]">/{BODY_MAX_LENGTH}</Text>
              </Text>
            </View>
          </View>
        </ScrollView>

        <View className="h-20 justify-center px-4">
          <Pressable
            disabled={!canSubmit}
            onPress={submit}
            className={`h-12 items-center justify-center rounded-lg ${
              canSubmit ? 'bg-[#256EF4] active:opacity-90' : 'bg-[#ECECF3]'
            }`}
          >
            <Text className={`text-base font-bold ${canSubmit ? 'text-white' : 'text-[#AAAABA]'}`}>
              {submitting ? '제출 중...' : '제출하기'}
            </Text>
          </Pressable>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

/** 디자인에서 "문의 유형"만 볼드 회색(#696976)이고, "제목"/"내용"은 세미볼드 검정(#17171B)이다. */
function FieldLabel({ label, muted }: { label: string; muted?: boolean }) {
  return (
    <Text
      className={
        muted
          ? 'text-[15px] font-bold leading-[23px] text-[#696976]'
          : 'text-[15px] font-semibold leading-[23px] text-[#17171B]'
      }
    >
      {label}
    </Text>
  );
}

function FieldUnderline() {
  return <View className="h-px w-full bg-[#DADAE8]" />;
}

function CategoryChip({
  label,
  selected,
  onPress,
}: {
  label: string;
  selected: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityState={{ selected }}
      className={`h-10 items-center justify-center rounded-lg px-[14px] active:opacity-80 ${
        selected ? 'bg-[#4C87F6]' : 'border border-[#DADAE8] bg-white'
      }`}
    >
      <Text
        className={`text-[15px] leading-[23px] ${
          selected ? 'font-semibold text-white' : 'font-medium text-[#696976]'
        }`}
      >
        {label}
      </Text>
    </Pressable>
  );
}
