import { useRouter } from 'expo-router';
import { Alert } from 'react-native';
import { useMemo, useState } from 'react';

import {
  createHouseRule,
  deleteHouseRule,
  getHouseRules,
  getMyRoommate,
  updateHouseRule,
  useApi,
  type HouseRuleItem,
} from '@/lib/api';
import {
  AGREEMENT_SECTIONS,
  buildEmptyAgreement,
  useSession,
  type AgreementRecord,
  type AgreementSectionKey,
  type AgreementValues,
} from '@/lib/domain';

export type AgreementMode = { kind: 'list' } | { kind: 'edit'; record?: AgreementRecord };

type AgreementInput = {
  partnerName: string;
  values: AgreementValues;
  record?: AgreementRecord;
};

export type UseAgreementScreenReturn = {
  loggedIn: boolean;
  hasRoommate: boolean;
  mode: AgreementMode;
  agreements: AgreementRecord[];
  loading: boolean;
  saving: boolean;
  error: string | null;
  partnerName: string;
  onBack: () => void;
  openNew: () => void;
  openEdit: (record: AgreementRecord) => void;
  closeEdit: () => void;
  saveDraft: (input: AgreementInput) => Promise<void>;
  finalizeDraft: (input: AgreementInput) => Promise<void>;
  deleteAgreement: (record: AgreementRecord) => void;
};

export function useAgreementScreen(): UseAgreementScreenReturn {
  const router = useRouter();
  const { session } = useSession();
  const [mode, setMode] = useState<AgreementMode>({ kind: 'list' });
  const [saving, setSaving] = useState(false);
  const enabled = Boolean(session);
  const roommateState = useApi(['roommates', 'me'], () => getMyRoommate(), {
    enabled,
    retry: false,
  });
  const hasRoommate = Boolean(roommateState.data?.id);
  const noRoommate = roommateState.error === '연결된 룸메이트가 없습니다.';
  const ruleState = useApi(['roommates', 'house-rules'], () => getHouseRules(), {
    enabled: enabled && hasRoommate,
    retry: false,
  });
  const partnerName = roommateState.data?.myRoommateInfo?.memberName ?? '';
  const agreements = useMemo(
    () => houseRulesToAgreements(ruleState.data ?? [], partnerName, roommateState.data?.id),
    [partnerName, roommateState.data?.id, ruleState.data],
  );

  const closeEdit = () => setMode({ kind: 'list' });

  const persist = async (input: AgreementInput, finalized: boolean) => {
    if (saving) return;
    if (!hasRoommate) {
      Alert.alert('작성할 수 없어요', '룸메이트 연결 후 합의서를 작성할 수 있어요.');
      return;
    }
    setSaving(true);
    try {
      const existingIds = input.record?.serverRuleIds ?? {};
      const requests = AGREEMENT_SECTIONS.flatMap((section) => {
        const contents = input.values[section.key].trim();
        const id = existingIds[section.key];
        if (!contents && id) return [deleteHouseRule(id)];
        if (!contents) return [];
        const body = { title: section.label, contents, finalized };
        return [id ? updateHouseRule(id, body) : createHouseRule(body)];
      });
      const responses = await Promise.all(requests);
      const failed = responses.find((response) => response.status !== 200 || response.error);
      if (failed) {
        throw new Error(failed.error?.message ?? '합의서를 저장하지 못했어요.');
      }
      ruleState.reload();
      Alert.alert(
        finalized ? '합의서 확정' : '저장 완료',
        finalized ? '확정된 합의서는 양쪽 모두 열람 가능해요.' : '합의서 초안이 서버에 저장됐어요.',
        [{ text: '확인', onPress: closeEdit }],
      );
    } catch (saveError) {
      Alert.alert(
        '저장 실패',
        saveError instanceof Error ? saveError.message : '잠시 후 다시 시도해주세요.',
      );
    } finally {
      setSaving(false);
    }
  };

  return {
    loggedIn: enabled,
    hasRoommate,
    mode,
    agreements,
    loading: roommateState.loading || (hasRoommate && ruleState.loading),
    saving,
    error: noRoommate ? ruleState.error : (roommateState.error ?? ruleState.error),
    partnerName,
    onBack: () => router.back(),
    openNew: () => {
      if (hasRoommate) setMode({ kind: 'edit' });
    },
    openEdit: (record) => setMode({ kind: 'edit', record }),
    closeEdit,
    saveDraft: (input) => persist(input, false),
    finalizeDraft: (input) => persist(input, true),
    deleteAgreement: (record) =>
      Alert.alert('삭제', '합의서를 삭제할까요?', [
        { text: '취소', style: 'cancel' },
        {
          text: '삭제',
          style: 'destructive',
          onPress: () => {
            setSaving(true);
            void Promise.all(Object.values(record.serverRuleIds ?? {}).map(deleteHouseRule))
              .then((responses) => {
                const failed = responses.find(
                  (response) => response.status !== 200 || response.error,
                );
                if (failed) {
                  throw new Error(failed.error?.message ?? '합의서를 삭제하지 못했어요.');
                }
                ruleState.reload();
              })
              .catch((deleteError) => {
                Alert.alert(
                  '삭제 실패',
                  deleteError instanceof Error ? deleteError.message : '잠시 후 다시 시도해주세요.',
                );
              })
              .finally(() => setSaving(false));
          },
        },
      ]),
  };
}

function houseRulesToAgreements(
  rules: HouseRuleItem[],
  partnerName: string,
  roommateId?: number,
): AgreementRecord[] {
  if (!rules.length) return [];
  const values = buildEmptyAgreement();
  const serverRuleIds: Partial<Record<AgreementSectionKey, string>> = {};

  for (const rule of rules) {
    const section = AGREEMENT_SECTIONS.find((item) => item.label === rule.title);
    if (!section || !rule.id) continue;
    values[section.key] = rule.contents ?? '';
    serverRuleIds[section.key] = String(rule.id);
  }

  if (!Object.keys(serverRuleIds).length) return [];
  const createdAtValues = rules
    .map((rule) => (rule.createdAt ? new Date(rule.createdAt) : null))
    .filter((value): value is Date => value !== null && !Number.isNaN(value.getTime()));
  const finalized = rules.every((rule) => rule.finalized !== false);

  return [
    {
      id: `house-rules-${roommateId ?? 'current'}`,
      partnerName,
      values,
      status: finalized ? 'finalized' : 'draft',
      createdAt: createdAtValues.sort((a, b) => a.getTime() - b.getTime())[0] ?? new Date(),
      finalizedAt: finalized ? new Date() : undefined,
      serverRuleIds,
    },
  ];
}
