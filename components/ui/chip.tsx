import { Pressable, Text, type PressableProps } from 'react-native';

interface ChipProps extends PressableProps {
  label: string;
  active?: boolean;
}

export function Chip({ label, active = false, className = '', ...props }: ChipProps) {
  return (
    <Pressable
      className={`rounded-full border px-3 py-1.5 active:opacity-80 ${
        active ? 'border-[#256EF4] bg-[#256EF4]/10' : 'border-neutral-200 bg-white'
      } ${className}`}
      {...props}
    >
      <Text className={active ? 'text-xs font-medium text-[#256EF4]' : 'text-xs text-neutral-700'}>
        {label}
      </Text>
    </Pressable>
  );
}
