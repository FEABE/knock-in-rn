import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { Pressable, Text, View } from 'react-native';

/**
 * 고객센터/약관/공지 공통 헤더. 디자인(3746:78038, 3746:78520)은 제목이 가운데 정렬이고
 * 하단 구분선이 없다. `onBack`을 주면 화면 내부 단계(예: 약관 목록 ↔ 전문)로 되돌릴 수 있다.
 */
export function SupportHeader({ title, onBack }: { title: string; onBack?: () => void }) {
  const router = useRouter();
  return (
    <View className="h-12 flex-row items-center px-2">
      <Pressable
        onPress={onBack ?? (() => router.back())}
        hitSlop={8}
        className="h-10 w-10 items-center justify-center"
      >
        <Ionicons name="chevron-back" size={24} color="#696976" />
      </Pressable>
      <Text className="flex-1 text-center text-base font-medium text-[#17171B]">{title}</Text>
      <View className="w-10" />
    </View>
  );
}
