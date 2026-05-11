import {
  useController,
  useFormContext,
  type FieldPath,
  type FieldValues,
  type UseControllerProps,
} from 'react-hook-form';

export type UseFormFieldProps<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
> = UseControllerProps<TFieldValues, TName>;

export function useFormField<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
>(props: UseFormFieldProps<TFieldValues, TName>) {
  const form = useFormContext<TFieldValues>();
  const { field, fieldState, formState } = useController<TFieldValues, TName>({
    ...props,
    control: props.control ?? form?.control,
  });

  return {
    value: field.value,
    onChange: field.onChange,
    onBlur: field.onBlur,
    name: field.name,
    ref: field.ref,
    error: fieldState.error?.message,
    invalid: fieldState.invalid,
    isDirty: fieldState.isDirty,
    isTouched: fieldState.isTouched,
    isSubmitting: formState.isSubmitting,
    disabled: formState.isSubmitting || props.disabled,
  };
}
