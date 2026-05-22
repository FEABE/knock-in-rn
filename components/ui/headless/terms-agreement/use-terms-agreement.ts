import { useCallback, useMemo } from 'react';
import type {
  AccessibilityRole,
  AccessibilityState,
} from 'react-native';

import type { Term, TermKey } from '@/lib/onboarding';

import { useControllableState } from '../use-controllable-state';
import { useTermsAgreementContext, type TermsAgreementContextValue } from './context';

export type UseTermsAgreementRootProps = {
  terms: Term[];
  value?: Record<TermKey, boolean>;
  defaultValue?: Record<TermKey, boolean>;
  onValueChange?: (value: Record<TermKey, boolean>) => void;
  disabled?: boolean;
};

function emptyValue(terms: Term[]): Record<TermKey, boolean> {
  return terms.reduce<Record<TermKey, boolean>>((acc, t) => {
    acc[t.key] = false;
    return acc;
  }, {} as Record<TermKey, boolean>);
}

export function useTermsAgreementRoot({
  terms,
  value,
  defaultValue,
  onValueChange,
  disabled,
}: UseTermsAgreementRootProps): TermsAgreementContextValue {
  const [current, setCurrent] = useControllableState<Record<TermKey, boolean>>({
    value,
    defaultValue: defaultValue ?? emptyValue(terms),
    onChange: onValueChange,
  });
  const map = current ?? emptyValue(terms);

  const toggle = useCallback(
    (key: TermKey) => {
      setCurrent({ ...map, [key]: !map[key] });
    },
    [map, setCurrent],
  );

  const toggleAll = useCallback(
    (next: boolean) => {
      setCurrent(
        terms.reduce<Record<TermKey, boolean>>((acc, t) => {
          acc[t.key] = next;
          return acc;
        }, {} as Record<TermKey, boolean>),
      );
    },
    [terms, setCurrent],
  );

  const allChecked = terms.every((t) => !!map[t.key]);
  const allRequiredChecked = terms
    .filter((t) => t.required)
    .every((t) => !!map[t.key]);

  return useMemo<TermsAgreementContextValue>(
    () => ({
      terms,
      value: map,
      toggle,
      toggleAll,
      allChecked,
      allRequiredChecked,
      isDisabled: !!disabled,
    }),
    [terms, map, toggle, toggleAll, allChecked, allRequiredChecked, disabled],
  );
}

export type UseTermsAgreementItemProps = {
  termKey: TermKey;
};

export type UseTermsAgreementItemReturn = {
  term: Term;
  isChecked: boolean;
  isDisabled: boolean;
  onPress: () => void;
  accessibilityRole: AccessibilityRole;
  accessibilityState: AccessibilityState;
};

export function useTermsAgreementItem({
  termKey,
}: UseTermsAgreementItemProps): UseTermsAgreementItemReturn {
  const ctx = useTermsAgreementContext('TermsAgreement.Item');
  const term = ctx.terms.find((t) => t.key === termKey);
  if (!term) {
    throw new Error(`Term with key "${termKey}" not found in <TermsAgreement.Root>`);
  }
  const isChecked = !!ctx.value[termKey];
  const isDisabled = ctx.isDisabled;

  const onPress = useCallback(() => {
    if (!isDisabled) ctx.toggle(termKey);
  }, [ctx, termKey, isDisabled]);

  const accessibilityState = useMemo<AccessibilityState>(
    () => ({ checked: isChecked, disabled: isDisabled }),
    [isChecked, isDisabled],
  );

  return {
    term,
    isChecked,
    isDisabled,
    onPress,
    accessibilityRole: 'checkbox',
    accessibilityState,
  };
}

export type UseTermsAgreementToggleAllReturn = {
  isChecked: boolean;
  isDisabled: boolean;
  onPress: () => void;
  accessibilityRole: AccessibilityRole;
  accessibilityState: AccessibilityState;
};

export function useTermsAgreementToggleAll(): UseTermsAgreementToggleAllReturn {
  const ctx = useTermsAgreementContext('TermsAgreement.ToggleAll');

  const onPress = useCallback(() => {
    if (ctx.isDisabled) return;
    ctx.toggleAll(!ctx.allChecked);
  }, [ctx]);

  const accessibilityState = useMemo<AccessibilityState>(
    () => ({ checked: ctx.allChecked, disabled: ctx.isDisabled }),
    [ctx.allChecked, ctx.isDisabled],
  );

  return {
    isChecked: ctx.allChecked,
    isDisabled: ctx.isDisabled,
    onPress,
    accessibilityRole: 'checkbox',
    accessibilityState,
  };
}
