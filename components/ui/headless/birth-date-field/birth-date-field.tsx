import {
  BirthDateFieldView,
  type BirthDateFieldViewProps,
} from './birth-date-field.view';
import {
  useBirthDateField,
  type UseBirthDateFieldProps,
} from './use-birth-date-field';

export type BirthDateFieldProps = UseBirthDateFieldProps &
  Omit<
    BirthDateFieldViewProps,
    keyof ReturnType<typeof useBirthDateField>
  >;

export function BirthDateField({
  value,
  defaultValue,
  onValueChange,
  minYear,
  maxYear,
  disabled,
  ...rest
}: BirthDateFieldProps) {
  const asks = useBirthDateField({
    value,
    defaultValue,
    onValueChange,
    minYear,
    maxYear,
    disabled,
  });
  return <BirthDateFieldView {...asks} {...rest} />;
}
