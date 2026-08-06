import { useLocalSearchParams } from 'expo-router';
import { useEffect, useMemo, useState } from 'react';

import { type SupportTermsSection, useSupportTerms } from '@/lib/api';

export type UseTermsScreenReturn = {
  sections: SupportTermsSection[];
  /** null이면 목록(3746:78038), 값이 있으면 해당 약관 전문(3941:49919)을 보여준다. */
  active: SupportTermsSection | null;
  loading: boolean;
  error: string | null;
  retry: () => void;
  open: (id: string) => void;
  closeDetail: () => void;
};

export function useTermsScreen(): UseTermsScreenReturn {
  const { termId } = useLocalSearchParams<{ termId?: string }>();
  const [activeId, setActiveId] = useState<string | null>(null);
  const { data, loading, error, reload } = useSupportTerms();
  const sections = useMemo(() => data ?? [], [data]);

  // 다른 화면에서 특정 약관을 지정해 들어온 경우에만 전문을 바로 연다.
  useEffect(() => {
    if (!termId) return;
    if (!sections.some((section) => section.id === termId)) return;
    setActiveId((current) => current ?? termId);
  }, [sections, termId]);

  const active = useMemo(
    () => (activeId ? (sections.find((section) => section.id === activeId) ?? null) : null),
    [activeId, sections],
  );

  return {
    sections,
    active,
    loading,
    error,
    retry: reload,
    open: setActiveId,
    closeDetail: () => setActiveId(null),
  };
}
