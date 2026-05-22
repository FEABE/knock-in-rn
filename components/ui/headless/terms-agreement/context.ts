import { createContext, useContext } from 'react';

import type { Term, TermKey } from '@/lib/onboarding';

export type TermsAgreementContextValue = {
  terms: Term[];
  value: Record<TermKey, boolean>;
  toggle: (key: TermKey) => void;
  toggleAll: (next: boolean) => void;
  allChecked: boolean;
  allRequiredChecked: boolean;
  isDisabled: boolean;
};

export const TermsAgreementContext =
  createContext<TermsAgreementContextValue | null>(null);

export function useTermsAgreementContext(
  component: string,
): TermsAgreementContextValue {
  const ctx = useContext(TermsAgreementContext);
  if (!ctx) {
    throw new Error(
      `<${component}> must be used inside <TermsAgreement.Root>`,
    );
  }
  return ctx;
}
