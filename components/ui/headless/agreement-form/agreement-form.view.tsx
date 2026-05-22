import { type ReactNode } from 'react';
import { View, type ViewProps } from 'react-native';

import type { UseAgreementFormReturn } from './use-agreement-form';

export type AgreementFormViewProps = Omit<ViewProps, 'children'> &
  UseAgreementFormReturn & {
    className?: string;
    children: (value: UseAgreementFormReturn) => ReactNode;
  };

export function AgreementFormView({
  children,
  partnerName,
  setPartnerName,
  values,
  setValue,
  fields,
  filledCount,
  totalCount,
  progress,
  canFinalize,
  reset,
  submit,
  ...rest
}: AgreementFormViewProps) {
  return (
    <View {...rest}>
      {children({
        partnerName,
        setPartnerName,
        values,
        setValue,
        fields,
        filledCount,
        totalCount,
        progress,
        canFinalize,
        reset,
        submit,
      })}
    </View>
  );
}
