import { useLocalSearchParams } from 'expo-router';
import { useEffect, useMemo, useState } from 'react';

import { type SupportTermsSection, useSupportTerms } from '@/lib/api';

export type UseTermsScreenReturn = {
  sections: SupportTermsSection[];
  activeId: string;
  active: SupportTermsSection | null;
  loading: boolean;
  error: string | null;
  retry: () => void;
  setActiveId: (next: string) => void;
};

export function useTermsScreen(): UseTermsScreenReturn {
  const { termId } = useLocalSearchParams<{ termId?: string }>();
  const [activeId, setActiveId] = useState('');
  const { data, loading, error, reload } = useSupportTerms();
  const sections = useMemo(() => data ?? [], [data]);

  useEffect(() => {
    if (activeId) return;
    const requested = termId && sections.some((section) => section.id === termId) ? termId : null;
    if (requested) setActiveId(requested);
    else if (sections[0]?.id) setActiveId(sections[0].id);
  }, [activeId, sections, termId]);

  const active = useMemo(
    () => sections.find((section) => section.id === activeId) ?? sections[0] ?? null,
    [activeId, sections],
  );

  return {
    sections,
    activeId,
    active,
    loading,
    error,
    retry: reload,
    setActiveId,
  };
}
