import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from 'react';

export type AgreementSectionKey =
  | 'cleaning'
  | 'noise'
  | 'utilities'
  | 'visitors'
  | 'pets'
  | 'others';

export type AgreementSection = {
  key: AgreementSectionKey;
  label: string;
  placeholder: string;
};

export const AGREEMENT_SECTIONS: AgreementSection[] = [
  {
    key: 'cleaning',
    label: '청소 / 위생',
    placeholder: '예: 공용 공간 청소는 격주 토요일 교대, 분리수거는 본인 담당.',
  },
  {
    key: 'noise',
    label: '소음 / 생활시간',
    placeholder: '예: 23시 이후 통화/음악 자제, 평일 06시 이전 샤워 자제.',
  },
  {
    key: 'utilities',
    label: '공과금 / 비용',
    placeholder: '예: 관리비/공과금 1:1 정산, 매월 25일 기준 송금.',
  },
  {
    key: 'visitors',
    label: '방문객 / 외박',
    placeholder: '예: 방문객은 최소 1일 전 사전 공유, 외박은 자유.',
  },
  {
    key: 'pets',
    label: '반려동물 / 흡연',
    placeholder: '예: 실내 흡연 금지, 반려동물은 사전 협의.',
  },
  {
    key: 'others',
    label: '기타 / 금지사항',
    placeholder: '예: 음식물 공유 금지, 빨래는 본인 물품 본인이 관리.',
  },
];

export type AgreementValues = Record<AgreementSectionKey, string>;

export type AgreementRecord = {
  id: string;
  partnerName: string;
  values: AgreementValues;
  status: 'draft' | 'finalized';
  createdAt: Date;
  finalizedAt?: Date;
};

function emptyValues(): AgreementValues {
  return AGREEMENT_SECTIONS.reduce<AgreementValues>((acc, s) => {
    acc[s.key] = '';
    return acc;
  }, {} as AgreementValues);
}

export type AgreementContextValue = {
  agreements: AgreementRecord[];
  getById: (id: string) => AgreementRecord | undefined;
  upsertDraft: (input: {
    id?: string;
    partnerName: string;
    values: AgreementValues;
  }) => AgreementRecord;
  finalize: (id: string) => void;
  remove: (id: string) => void;
};

const AgreementContext = createContext<AgreementContextValue | null>(null);

export function AgreementProvider({ children }: { children: ReactNode }) {
  const [agreements, setAgreements] = useState<AgreementRecord[]>([]);

  const getById = useCallback(
    (id: string) => agreements.find((a) => a.id === id),
    [agreements],
  );

  const upsertDraft = useCallback(
    ({
      id,
      partnerName,
      values,
    }: {
      id?: string;
      partnerName: string;
      values: AgreementValues;
    }) => {
      if (id) {
        let updated: AgreementRecord | null = null;
        setAgreements((prev) =>
          prev.map((a) => {
            if (a.id !== id) return a;
            updated = { ...a, partnerName, values };
            return updated!;
          }),
        );
        if (updated) return updated;
      }
      const next: AgreementRecord = {
        id: `ag-${Date.now()}`,
        partnerName,
        values,
        status: 'draft',
        createdAt: new Date(),
      };
      setAgreements((prev) => [next, ...prev]);
      return next;
    },
    [],
  );

  const finalize = useCallback((id: string) => {
    setAgreements((prev) =>
      prev.map((a) =>
        a.id === id ? { ...a, status: 'finalized', finalizedAt: new Date() } : a,
      ),
    );
  }, []);

  const remove = useCallback((id: string) => {
    setAgreements((prev) => prev.filter((a) => a.id !== id));
  }, []);

  const value = useMemo<AgreementContextValue>(
    () => ({ agreements, getById, upsertDraft, finalize, remove }),
    [agreements, getById, upsertDraft, finalize, remove],
  );

  return (
    <AgreementContext.Provider value={value}>
      {children}
    </AgreementContext.Provider>
  );
}

export function useAgreementStore(): AgreementContextValue {
  const ctx = useContext(AgreementContext);
  if (!ctx) {
    throw new Error(
      'useAgreementStore must be used inside <AgreementProvider>',
    );
  }
  return ctx;
}

export function buildEmptyAgreement(): AgreementValues {
  return emptyValues();
}
