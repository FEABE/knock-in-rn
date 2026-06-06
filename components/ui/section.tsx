import { Text, View, type ViewProps } from 'react-native';

interface SectionProps extends ViewProps {
  title: string;
}

export function Section({ title, children, className = '', ...props }: SectionProps) {
  return (
    <View className={`gap-3 ${className}`} {...props}>
      <Text className="text-base font-bold text-neutral-900">{title}</Text>
      <View className="gap-3">{children}</View>
    </View>
  );
}
