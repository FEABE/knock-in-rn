import type {
  FieldPath,
  FieldValues,
  RegisterOptions,
  UseFormReturn,
} from 'react-hook-form';

export type RegisterFieldProps = {
  name: string;
  value: string;
  onChangeValue: (value: string) => void;
  onBlur: () => void;
  ref: (instance: unknown) => void;
};

export function registerField<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
>(
  form: UseFormReturn<TFieldValues>,
  name: TName,
  options?: RegisterOptions<TFieldValues, TName>,
): RegisterFieldProps {
  const { onChange, onBlur, ref, name: registeredName } = form.register(
    name,
    options,
  );
  const current = form.watch(name);

  return {
    name: registeredName,
    value: (current ?? '') as string,
    onChangeValue: (next) => {
      void onChange({ target: { name: registeredName, value: next }, type: 'change' });
    },
    onBlur: () => {
      void onBlur({ target: { name: registeredName }, type: 'blur' });
    },
    ref,
  };
}
