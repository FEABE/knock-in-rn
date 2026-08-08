import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { StatusBar } from 'expo-status-bar';
import { Modal, Pressable, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

/**
 * 채팅 이미지 전체화면 뷰어 (Figma 3589:28288).
 * 디자인은 360×432 레터박스지만 실제 첨부는 비율이 제각각이라 `contain`으로 맞춘다.
 */
export function ChatImageViewer({
  visible,
  imageUrl,
  title,
  onClose,
}: {
  visible: boolean;
  imageUrl?: string;
  title?: string;
  onClose: () => void;
}) {
  return (
    <Modal
      visible={visible && Boolean(imageUrl)}
      animationType="fade"
      statusBarTranslucent
      onRequestClose={onClose}
    >
      <StatusBar style="light" />
      <View className="flex-1 bg-[#17171B]">
        <SafeAreaView edges={['top']}>
          <View className="h-[52px] flex-row items-center justify-between px-4">
            <Pressable
              onPress={onClose}
              accessibilityRole="button"
              accessibilityLabel="사진 닫기"
              hitSlop={8}
            >
              <Ionicons name="close" size={24} color="#FFFFFF" />
            </Pressable>
            <Text
              className="flex-1 text-center text-base font-semibold text-white"
              numberOfLines={1}
            >
              {title}
            </Text>
            {/* 타이틀을 가운데 유지하기 위한 좌측 버튼과 같은 폭의 빈 슬롯 */}
            <View className="w-6" />
          </View>
        </SafeAreaView>

        <View className="flex-1 justify-center">
          {imageUrl ? (
            <Image
              source={{ uri: imageUrl }}
              style={{ width: '100%', height: '100%' }}
              contentFit="contain"
            />
          ) : null}
        </View>
      </View>
    </Modal>
  );
}
