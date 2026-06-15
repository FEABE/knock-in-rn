import { useRouter } from 'expo-router';
import { Alert } from 'react-native';
import { useState } from 'react';

import {
  useAgreementStore,
  useSession,
  type AgreementRecord,
  type AgreementValues,
} from '@/lib/domain';

export type AgreementMode = { kind: 'list' } | { kind: 'edit'; record?: AgreementRecord };

export type UseAgreementScreenReturn = {
  loggedIn: boolean;
  mode: AgreementMode;
  agreements: AgreementRecord[];
  onBack: () => void;
  openNew: () => void;
  openEdit: (record: AgreementRecord) => void;
  closeEdit: () => void;
  saveDraft: (input: {
    partnerName: string;
    values: AgreementValues;
    record?: AgreementRecord;
  }) => AgreementRecord;
  finalizeDraft: (input: {
    partnerName: string;
    values: AgreementValues;
    record?: AgreementRecord;
  }) => void;
  deleteAgreement: (record: AgreementRecord) => void;
};

export function useAgreementScreen(): UseAgreementScreenReturn {
  const router = useRouter();
  const { session } = useSession();
  const { agreements, upsertDraft, finalize, remove } = useAgreementStore();
  const [mode, setMode] = useState<AgreementMode>({ kind: 'list' });

  const closeEdit = () => setMode({ kind: 'list' });

  const saveDraft: UseAgreementScreenReturn['saveDraft'] = ({ partnerName, values, record }) => {
    const saved = upsertDraft({
      id: record?.id,
      partnerName,
      values,
    });
    Alert.alert('저장 완료', '합의서 초안이 저장됐어요.', [{ text: '확인', onPress: closeEdit }]);
    return saved;
  };

  const finalizeDraft: UseAgreementScreenReturn['finalizeDraft'] = ({
    partnerName,
    values,
    record,
  }) => {
    const saved = upsertDraft({
      id: record?.id,
      partnerName,
      values,
    });
    finalize(saved.id);
    Alert.alert('합의서 확정', '확정된 합의서는 양쪽 모두 열람 가능해요.', [
      { text: '확인', onPress: closeEdit },
    ]);
  };

  return {
    loggedIn: !!session,
    mode,
    agreements,
    onBack: () => router.back(),
    openNew: () => setMode({ kind: 'edit' }),
    openEdit: (record) => setMode({ kind: 'edit', record }),
    closeEdit,
    saveDraft,
    finalizeDraft,
    deleteAgreement: (record) =>
      Alert.alert('삭제', '합의서를 삭제할까요?', [
        { text: '취소', style: 'cancel' },
        { text: '삭제', style: 'destructive', onPress: () => remove(record.id) },
      ]),
  };
}
