import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { ActivityIndicator, Pressable, Text, TextInput, View } from 'react-native';

import { ReadyProfileAvatar } from '@/components/ui/ready-to-dev-components';
import { ReadyStatusBanner } from '@/components/ui/ready-to-dev-feedback';

export function ReadyChatDateDivider({ label }: { label: string }) {
  return (
    <View className="items-center py-2">
      <Text className="text-xs leading-[18px] text-[#696976]">{label}</Text>
    </View>
  );
}

export function ReadyChatSystemNotice({ label }: { label: string }) {
  return (
    <View className="items-center py-1">
      <Text className="rounded-full bg-[#ECF2FE] px-4 py-1.5 text-xs font-medium text-[#256EF4]">
        {label}
      </Text>
    </View>
  );
}

export function ReadyChatBubble({
  mine,
  body,
  imageUrl,
  timeLabel,
  peerName,
  peerImageUrl,
  onPressImage,
}: {
  mine: boolean;
  body?: string;
  imageUrl?: string;
  timeLabel?: string;
  peerName?: string;
  peerImageUrl?: string;
  /** 있으면 이미지 버블만 탭 가능해진다(텍스트 버블은 영향 없음). */
  onPressImage?: () => void;
}) {
  return (
    <View className={mine ? 'items-end' : 'items-start'}>
      <View className={`max-w-[92%] flex-row items-end gap-2 ${mine ? 'flex-row-reverse' : ''}`}>
        {!mine ? (
          <ReadyProfileAvatar name={peerName || '상대방'} imageUrl={peerImageUrl} size={42} />
        ) : null}
        <View
          className={`max-w-[82%] flex-row items-end gap-1.5 ${mine ? 'flex-row-reverse' : ''}`}
        >
          {imageUrl ? (
            onPressImage ? (
              <Pressable
                onPress={onPressImage}
                accessibilityRole="imagebutton"
                accessibilityLabel="사진 크게 보기"
                className="active:opacity-85"
              >
                <ChatBubbleImage imageUrl={imageUrl} />
              </Pressable>
            ) : (
              <ChatBubbleImage imageUrl={imageUrl} />
            )
          ) : (
            <View
              className={`rounded-b-lg px-3 py-2 ${
                mine ? 'rounded-tl-lg bg-[#4C87F6]' : 'rounded-tr-lg bg-[#ECECF3]'
              }`}
            >
              <Text className={`text-sm leading-[21px] ${mine ? 'text-white' : 'text-[#17171B]'}`}>
                {body}
              </Text>
            </View>
          )}
          {timeLabel ? (
            <Text className="text-[11px] leading-[18px] text-[#AAAABA]">{timeLabel}</Text>
          ) : null}
        </View>
      </View>
    </View>
  );
}

function ChatBubbleImage({ imageUrl }: { imageUrl: string }) {
  return (
    <Image
      source={{ uri: imageUrl }}
      style={{ width: 220, height: 220, borderRadius: 12 }}
      contentFit="cover"
    />
  );
}

export function ReadyChatRestrictionBanner({
  kind,
  onUnblock,
}: {
  kind: 'blocked' | 'unavailable';
  onUnblock?: () => void;
}) {
  if (kind === 'unavailable') {
    return (
      <ReadyStatusBanner
        title="대화할 수 없는 사용자에요"
        description="상대방의 계정 상태로 인해 메시지를 보낼 수 없어요"
        tone="neutral"
      />
    );
  }

  return (
    <ReadyStatusBanner
      title="차단한 사용자에요"
      description="차단을 해제하면 다시 대화할 수 있어요"
      tone="danger"
      actionLabel={onUnblock ? '차단 해제' : undefined}
      onAction={onUnblock}
    />
  );
}

export function ReadyChatComposer({
  value,
  onChangeText,
  onAdd,
  onSend,
  disabled = false,
  sendDisabled = false,
  uploading = false,
  placeholder = '메세지 보내기',
  bottomPadding = 0,
}: {
  value: string;
  onChangeText?: (value: string) => void;
  onAdd?: () => void;
  onSend?: () => void;
  disabled?: boolean;
  sendDisabled?: boolean;
  uploading?: boolean;
  placeholder?: string;
  bottomPadding?: number;
}) {
  const canSend = value.trim().length > 0 && !disabled && !sendDisabled;
  return (
    <View
      className="flex-row items-end gap-3 border-t border-[#F6F6FA] bg-white px-4 pt-2.5"
      style={{ paddingBottom: Math.max(bottomPadding, 10) }}
    >
      <Pressable
        onPress={onAdd}
        disabled={disabled || uploading || !onAdd}
        accessibilityRole="button"
        accessibilityLabel="사진 추가"
        className="h-10 w-8 items-center justify-center"
      >
        {uploading ? (
          <ActivityIndicator size="small" color="#AAAABA" />
        ) : (
          <Ionicons name="add" size={28} color={disabled || !onAdd ? '#DADAE8' : '#8E8E9E'} />
        )}
      </Pressable>
      <View className="min-h-10 flex-1 justify-center rounded-xl bg-[#F6F6FA] px-4 py-2">
        <TextInput
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor="#AAAABA"
          editable={!disabled}
          multiline
          maxLength={500}
          className="max-h-24 p-0 text-sm leading-5 text-[#17171B]"
        />
      </View>
      <Pressable
        onPress={onSend}
        disabled={!canSend || !onSend}
        accessibilityRole="button"
        accessibilityLabel="메시지 전송"
        className="h-10 w-8 items-center justify-center"
      >
        <Ionicons
          name={canSend ? 'paper-plane' : 'paper-plane-outline'}
          size={22}
          color={canSend ? '#256EF4' : '#AAAABA'}
        />
      </Pressable>
    </View>
  );
}
