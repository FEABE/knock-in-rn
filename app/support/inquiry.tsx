import { useState } from 'react';
import {
  Alert,
  Pressable,
  ScrollView,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { SupportHeader } from '@/components/support/support-header';
import { TextField, Toggle } from '@/components/ui/headless';
import { INQUIRIES } from '@/lib/domain';

export default function InquiryScreen() {
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [isPublic, setIsPublic] = useState(true);

  const canSubmit = title.trim().length > 0 && body.trim().length > 0;

  return (
    <SafeAreaView className="flex-1 bg-white" edges={['top']}>
      <SupportHeader title="문의하기" />

      <ScrollView contentContainerClassName="gap-6 p-5">
        <View className="gap-3">
          <Text className="text-sm font-semibold text-neutral-800">
            새 문의 작성
          </Text>
          <TextField
            value={title}
            onChangeValue={setTitle}
            placeholder="제목"
            className="rounded-xl border border-neutral-200 px-4 py-3 text-base"
          />
          <TextField
            value={body}
            onChangeValue={setBody}
            placeholder="문의 내용을 자세히 적어주세요"
            multiline
            numberOfLines={6}
            className="min-h-[140px] rounded-xl border border-neutral-200 px-4 py-3 text-base"
          />
          <View className="flex-row items-center justify-between rounded-xl border border-neutral-200 px-4 py-3">
            <View>
              <Text className="text-sm text-neutral-800">공개 문의</Text>
              <Text className="text-[10px] text-neutral-400">
                공개 시 다른 사용자도 답변을 볼 수 있어요
              </Text>
            </View>
            <Toggle checked={isPublic} onCheckedChange={setIsPublic}>
              {({ checked }) => (
                <View
                  className={`h-7 w-12 flex-row items-center rounded-full px-1 ${
                    checked ? 'bg-violet-600' : 'bg-neutral-300'
                  }`}
                >
                  <View
                    className={`h-5 w-5 rounded-full bg-white ${
                      checked ? 'ml-5' : 'ml-0'
                    }`}
                  />
                </View>
              )}
            </Toggle>
          </View>
          <Pressable
            disabled={!canSubmit}
            onPress={() => {
              Alert.alert('접수 완료', '운영자가 확인 후 답변드릴게요.');
              setTitle('');
              setBody('');
            }}
            className={`h-12 items-center justify-center rounded-xl ${
              canSubmit ? 'bg-violet-600' : 'bg-neutral-300'
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

        <View className="gap-3">
          <Text className="text-sm font-semibold text-neutral-800">
            공개 문의 ({INQUIRIES.filter((q) => q.isPublic).length})
          </Text>
          {INQUIRIES.filter((q) => q.isPublic).map((q) => (
            <View
              key={q.id}
              className="gap-2 rounded-2xl border border-neutral-200 bg-white p-4"
            >
              <View className="flex-row items-center justify-between">
                <Text className="text-sm font-semibold text-neutral-900">
                  {q.title}
                </Text>
                <Text
                  className={`rounded-full px-2 py-0.5 text-[10px] ${
                    q.answer
                      ? 'bg-emerald-50 text-emerald-700'
                      : 'bg-neutral-100 text-neutral-500'
                  }`}
                >
                  {q.answer ? '답변 완료' : '답변 대기'}
                </Text>
              </View>
              <Text className="text-xs text-neutral-500">
                {q.authorName} · {fmtDate(q.createdAt)}
              </Text>
              <Text className="text-sm text-neutral-700">{q.body}</Text>
              {q.answer ? (
                <View className="gap-1 rounded-xl bg-neutral-50 p-3">
                  <Text className="text-[10px] font-semibold text-violet-600">
                    운영자 답변
                  </Text>
                  <Text className="text-sm leading-6 text-neutral-700">
                    {q.answer}
                  </Text>
                </View>
              ) : null}
            </View>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function fmtDate(d: Date): string {
  return `${d.getFullYear()}.${String(d.getMonth() + 1).padStart(2, '0')}.${String(d.getDate()).padStart(2, '0')}`;
}
