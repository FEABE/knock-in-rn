import { forwardRef, type ReactNode } from 'react';
import type { View as RNView } from 'react-native';

import {
  TermsAgreementItemView,
  TermsAgreementRootView,
  TermsAgreementToggleAllView,
  type TermsAgreementItemViewProps,
  type TermsAgreementRootViewProps,
  type TermsAgreementToggleAllViewProps,
} from './terms-agreement.view';
import {
  useTermsAgreementItem,
  useTermsAgreementRoot,
  useTermsAgreementToggleAll,
  type UseTermsAgreementItemProps,
  type UseTermsAgreementRootProps,
} from './use-terms-agreement';

type RootProps = UseTermsAgreementRootProps &
  Omit<TermsAgreementRootViewProps, 'value'> & { children?: ReactNode };

function Root({
  terms,
  value,
  defaultValue,
  onValueChange,
  disabled,
  children,
  ...rest
}: RootProps) {
  const ctxValue = useTermsAgreementRoot({
    terms,
    value,
    defaultValue,
    onValueChange,
    disabled,
  });
  return (
    <TermsAgreementRootView value={ctxValue} {...rest}>
      {children}
    </TermsAgreementRootView>
  );
}

type ItemProps = UseTermsAgreementItemProps &
  Omit<TermsAgreementItemViewProps, keyof ReturnType<typeof useTermsAgreementItem>>;

const Item = forwardRef<RNView, ItemProps>(function Item(
  { termKey, ...rest },
  ref,
) {
  const asks = useTermsAgreementItem({ termKey });
  return <TermsAgreementItemView ref={ref} {...asks} {...rest} />;
});

type ToggleAllProps = Omit<
  TermsAgreementToggleAllViewProps,
  keyof ReturnType<typeof useTermsAgreementToggleAll>
>;

const ToggleAll = forwardRef<RNView, ToggleAllProps>(function ToggleAll(
  rest,
  ref,
) {
  const asks = useTermsAgreementToggleAll();
  return <TermsAgreementToggleAllView ref={ref} {...asks} {...rest} />;
});

export const TermsAgreement = { Root, Item, ToggleAll };
