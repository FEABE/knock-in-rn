import { useCallback, useMemo, useState } from 'react';

import {
  AGREEMENT_SECTIONS,
  buildEmptyAgreement,
  type AgreementSection,
  type AgreementSectionKey,
  type AgreementValues,
} from '@/lib/domain';

export type UseAgreementFormProps = {
  initial?: Partial<AgreementValues>;
  initialPartnerName?: string;
  onSubmit?: (input: {
    partnerName: string;
    values: AgreementValues;
  }) => void;
};

export type AgreementFieldHandlers = {
  section: AgreementSection;
  value: string;
  onChangeText: (next: string) => void;
};

export type UseAgreementFormReturn = {
  partnerName: string;
  setPartnerName: (next: string) => void;
  values: AgreementValues;
  setValue: (key: AgreementSectionKey, next: string) => void;
  fields: AgreementFieldHandlers[];
  filledCount: number;
  totalCount: number;
  progress: number;
  canFinalize: boolean;
  reset: () => void;
  submit: () => void;
};

export function useAgreementForm({
  initial,
  initialPartnerName = '',
  onSubmit,
}: UseAgreementFormProps = {}): UseAgreementFormReturn {
  const [partnerName, setPartnerName] = useState(initialPartnerName);
  const [values, setValues] = useState<AgreementValues>(() => ({
    ...buildEmptyAgreement(),
    ...initial,
  }));

  const setValue = useCallback(
    (key: AgreementSectionKey, next: string) => {
      setValues((prev) => ({ ...prev, [key]: next }));
    },
    [],
  );

  const reset = useCallback(() => {
    setValues(buildEmptyAgreement());
    setPartnerName('');
  }, []);

  const submit = useCallback(() => {
    onSubmit?.({ partnerName: partnerName.trim(), values });
  }, [onSubmit, partnerName, values]);

  const filledCount = AGREEMENT_SECTIONS.filter(
    (s) => values[s.key].trim().length > 0,
  ).length;

  const fields = useMemo<AgreementFieldHandlers[]>(
    () =>
      AGREEMENT_SECTIONS.map((s) => ({
        section: s,
        value: values[s.key],
        onChangeText: (next: string) => setValue(s.key, next),
      })),
    [values, setValue],
  );

  return {
    partnerName,
    setPartnerName,
    values,
    setValue,
    fields,
    filledCount,
    totalCount: AGREEMENT_SECTIONS.length,
    progress: filledCount / AGREEMENT_SECTIONS.length,
    canFinalize: partnerName.trim().length > 0 && filledCount > 0,
    reset,
    submit,
  };
}
