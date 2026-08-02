import * as ImagePicker from 'expo-image-picker';
import { useRouter } from 'expo-router';
import { useEffect, useMemo, useState } from 'react';
import { Alert } from 'react-native';

import {
  getProfileAll,
  getTerms,
  updateProfileBasic,
  type ProfileBasicImageInput,
} from '@/lib/api';
import { useSession } from '@/lib/domain';

export type BasicProfileEditState = {
  name: string;
  email: string;
  birth: string;
  gender: 'MALE' | 'FEMALE';
  profileImageUrl?: string;
  image?: ProfileBasicImageInput;
};

export type UseBasicProfileEditScreenReturn = {
  state: BasicProfileEditState;
  loading: boolean;
  saving: boolean;
  error: string | null;
  nameError: string | null;
  emailError: string | null;
  birthError: string | null;
  canSave: boolean;
  onBack: () => void;
  setName: (value: string) => void;
  setEmail: (value: string) => void;
  setBirth: (value: string) => void;
  pickProfileImage: () => Promise<void>;
  save: () => Promise<void>;
};

export function useBasicProfileEditScreen(): UseBasicProfileEditScreenReturn {
  const router = useRouter();
  const { session, refreshSessionUser } = useSession();
  const [terms, setTerms] = useState<number[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [state, setState] = useState<BasicProfileEditState>({
    name: session?.user.name ?? '',
    email: '',
    birth: '',
    gender: session?.user.gender === 'male' ? 'MALE' : 'FEMALE',
    profileImageUrl: session?.user.avatarUrl,
  });

  useEffect(() => {
    let mounted = true;
    void getProfileAll().then((profileResponse) => {
      if (!mounted) return;

      if (profileResponse.status !== 200 || profileResponse.error) {
        setError(profileResponse.error?.message ?? '프로필을 불러오지 못했어요.');
      } else {
        const userInfo = profileResponse.data?.userInfo;
        setState((current) => ({
          ...current,
          name: userInfo?.name ?? current.name,
          email: userInfo?.email ?? current.email,
          birth: normalizeBirthInput(userInfo?.birth ?? current.birth),
          gender: userInfo?.gender ?? current.gender,
          profileImageUrl: userInfo?.profile ?? current.profileImageUrl,
        }));
      }

      setLoading(false);
    });

    void getTerms().then((termsResponse) => {
      if (!mounted) return;
      setTerms(
        termsResponse.status === 200 && !termsResponse.error
          ? (termsResponse.data?.terms ?? []).flatMap((term) =>
              term.id === undefined ? [] : [term.id],
            )
          : [],
      );
    });

    return () => {
      mounted = false;
    };
  }, []);

  const nameError = useMemo(() => validateName(state.name), [state.name]);
  const emailError = useMemo(() => validateEmail(state.email), [state.email]);
  const birthError = useMemo(() => validateBirth(state.birth), [state.birth]);
  const canSave = !loading && !saving && !nameError && !emailError && !birthError;

  const pickProfileImage = async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      Alert.alert('사진 권한이 필요해요', '설정에서 사진 접근을 허용해주세요.');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.9,
    });
    const asset = result.canceled ? undefined : result.assets[0];
    if (!asset?.uri) return;

    setState((current) => ({
      ...current,
      image: {
        uri: asset.uri,
        name: asset.fileName ?? 'profile.jpg',
        type: asset.mimeType ?? 'image/jpeg',
      },
    }));
  };

  const save = async () => {
    if (!canSave) return;
    if (terms.length === 0) {
      Alert.alert('저장 실패', '약관 정보를 불러오지 못했어요. 잠시 후 다시 시도해주세요.');
      return;
    }

    setSaving(true);
    const response = await updateProfileBasic(
      {
        name: state.name.trim(),
        email: state.email.trim(),
        birth: toApiBirth(state.birth),
        gender: state.gender,
        terms,
      },
      state.image,
    );
    setSaving(false);

    if (response.status !== 200 || response.error) {
      Alert.alert('저장 실패', response.error?.message ?? '잠시 후 다시 시도해주세요.');
      return;
    }

    await refreshSessionUser();
    Alert.alert('저장 완료', '프로필이 저장되었어요.', [
      { text: '확인', onPress: () => router.back() },
    ]);
  };

  return {
    state,
    loading,
    saving,
    error,
    nameError,
    emailError,
    birthError,
    canSave,
    onBack: () => router.back(),
    setName: (name) => setState((current) => ({ ...current, name })),
    setEmail: (email) => setState((current) => ({ ...current, email })),
    setBirth: (birth) => setState((current) => ({ ...current, birth: normalizeBirthInput(birth) })),
    pickProfileImage,
    save,
  };
}

function validateName(value: string): string | null {
  if (/^[가-힣]{2,10}$/.test(value.trim())) return null;
  return '한글로 최소 2자~10자까지 입력 가능해요';
}

function validateEmail(value: string): string | null {
  if (/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim())) return null;
  return '이메일 형식을 확인해주세요';
}

function validateBirth(value: string): string | null {
  const apiBirth = toApiBirth(value);
  if (!/^\d{4}-\d{2}-\d{2}$/.test(apiBirth)) return '생년월일 8자리를 입력해주세요';
  const date = new Date(`${apiBirth}T00:00:00`);
  if (Number.isNaN(date.getTime())) return '생년월일을 확인해주세요';
  return null;
}

function normalizeBirthInput(value: string): string {
  const digits = value.replace(/\D/g, '').slice(0, 8);
  if (digits.length <= 4) return digits;
  if (digits.length <= 6) return `${digits.slice(0, 4)}.${digits.slice(4)}`;
  return `${digits.slice(0, 4)}.${digits.slice(4, 6)}.${digits.slice(6)}`;
}

function toApiBirth(value: string): string {
  return value.replace(/\./g, '-');
}
