import { Pressable, Text, View } from 'react-native';

export type LoginPromptCardProps = {
  title: string;
  description: string;
  onPress: () => void;
  className?: string;
};

export function LoginPromptCard({
  title,
  description,
  onPress,
  className = '',
}: LoginPromptCardProps) {
  return (
    <View className={`gap-3 rounded-lg bg-[#256EF4]/10 p-5 ${className}`}>
      <Text className="text-base font-bold text-[#256EF4]">{title}</Text>
      <Text className="text-sm text-[#256EF4]/70">{description}</Text>
      <Pressable
        onPress={onPress}
        className="self-start rounded-full bg-yellow-300 px-5 py-3 active:opacity-90"
      >
        <Text className="text-sm font-semibold text-neutral-900">카카오로 시작하기</Text>
      </Pressable>
    </View>
  );
}
