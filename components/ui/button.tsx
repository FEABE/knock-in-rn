import { Pressable, Text, type PressableProps } from 'react-native';

interface ButtonProps extends PressableProps {
  label: string;
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  fullWidth?: boolean;
}

export function Button({
  label,
  variant = 'primary',
  size = 'md',
  fullWidth = false,
  className = '',
  disabled,
  ...props
}: ButtonProps) {
  const baseClasses = 'items-center justify-center rounded-xl flex-row active:opacity-80';
  const widthClass = fullWidth ? 'w-full' : '';
  const disabledClass = disabled ? 'opacity-50' : '';

  let variantClasses = '';
  let textClasses = 'font-semibold';

  switch (variant) {
    case 'primary':
      variantClasses = 'bg-[#256EF4]';
      textClasses += ' text-white';
      break;
    case 'secondary':
      variantClasses = 'bg-yellow-300';
      textClasses += ' text-neutral-900';
      break;
    case 'outline':
      variantClasses = 'border border-neutral-200 bg-white active:bg-neutral-50';
      textClasses += ' text-neutral-700';
      break;
    case 'ghost':
      variantClasses = 'bg-transparent active:bg-neutral-100';
      textClasses += ' text-neutral-700';
      break;
  }

  let sizeClasses = '';
  switch (size) {
    case 'sm':
      sizeClasses = 'py-2 px-4';
      textClasses += ' text-xs';
      break;
    case 'md':
      sizeClasses = 'py-3 px-5';
      textClasses += ' text-sm';
      break;
    case 'lg':
      sizeClasses = 'py-4 px-6 h-14';
      textClasses += ' text-base';
      break;
  }

  return (
    <Pressable
      className={`${baseClasses} ${widthClass} ${variantClasses} ${sizeClasses} ${disabledClass} ${className}`}
      disabled={disabled}
      {...props}
    >
      <Text className={textClasses}>{label}</Text>
    </Pressable>
  );
}
