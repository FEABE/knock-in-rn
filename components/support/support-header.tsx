import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { Pressable, Text, View } from 'react-native';

export function SupportHeader({ title }: { title: string }) {
  const router = useRouter();
  return (
    <View className="flex-row items-center gap-2 border-b border-neutral-100 px-3 py-2">
      <Pressable onPress={() => router.back()} className="h-9 w-9 items-center justify-center">
        <Ionicons name="chevron-back" size={24} color="#404047" />
      </Pressable>
      <Text className="text-base font-semibold text-neutral-900">{title}</Text>
    </View>
  );
}
