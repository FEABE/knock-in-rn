import { useRouter } from 'expo-router';
import { Pressable, Text, View } from 'react-native';

export function SupportHeader({ title }: { title: string }) {
  const router = useRouter();
  return (
    <View className="flex-row items-center gap-2 border-b border-neutral-100 px-3 py-2">
      <Pressable
        onPress={() => router.back()}
        className="h-9 w-9 items-center justify-center"
      >
        <Text className="text-2xl text-neutral-700">‹</Text>
      </Pressable>
      <Text className="text-base font-semibold text-neutral-900">{title}</Text>
    </View>
  );
}
