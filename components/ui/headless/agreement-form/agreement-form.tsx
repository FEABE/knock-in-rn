import {
  AgreementFormView,
  type AgreementFormViewProps,
} from './agreement-form.view';
import {
  useAgreementForm,
  type UseAgreementFormProps,
} from './use-agreement-form';

export type AgreementFormProps = UseAgreementFormProps &
  Omit<AgreementFormViewProps, keyof ReturnType<typeof useAgreementForm>>;

export function AgreementForm({
  initial,
  initialPartnerName,
  onSubmit,
  ...rest
}: AgreementFormProps) {
  const asks = useAgreementForm({
    initial,
    initialPartnerName,
    onSubmit,
  });
  return <AgreementFormView {...asks} {...rest} />;
}
