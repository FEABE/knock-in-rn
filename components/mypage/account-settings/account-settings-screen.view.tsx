import { Ionicons } from '@expo/vector-icons';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import type {
  AccountSettingsRow,
  AccountSettingsSection,
  UseAccountSettingsScreenReturn,
} from './use-account-settings-screen';

export type AccountSettingsScreenViewProps = UseAccountSettingsScreenReturn;

export function AccountSettingsScreenView({ sections, onBack }: AccountSettingsScreenViewProps) {
  return (
    <SafeAreaView className="flex-1 bg-white" edges={['top', 'bottom']}>
      <Header title="계정 설정" onBack={onBack} />
      <ScrollView contentContainerClassName="gap-8 px-4 pb-10 pt-5">
        {sections.map((section) => (
          <Section key={section.title} section={section} />
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

function Header({ title, onBack }: { title: string; onBack: () => void }) {
  return (
    <View className="h-12 flex-row items-center px-2">
      <Pressable onPress={onBack} className="h-10 w-10 items-center justify-center">
        <Ionicons name="chevron-back" size={24} color="#696976" />
      </Pressable>
      <Text className="flex-1 text-center text-base font-medium text-[#17171B]">{title}</Text>
      <View className="w-10" />
    </View>
  );
}

function Section({ section }: { section: AccountSettingsSection }) {
  return (
    <View>
      <Text className="border-b border-[#D9DAE5] pb-3 text-base font-bold text-[#696976]">
        {section.title}
      </Text>
      {section.rows.map((row) => (
        <Row key={row.title} row={row} />
      ))}
    </View>
  );
}

function Row({ row }: { row: AccountSettingsRow }) {
  const danger = row.tone === 'danger';
  return (
    <Pressable
      onPress={row.onPress}
      className="min-h-14 flex-row items-center border-b border-[#D9DAE5] px-2 py-4 active:bg-[#F6F6FA]"
    >
      <View className="flex-1">
        <Text
          className={`text-[15px] font-semibold ${danger ? 'text-rose-500' : 'text-[#17171B]'}`}
        >
          {row.title}
        </Text>
        {row.description ? (
          <Text className="mt-1 text-xs text-[#AAAABA]">{row.description}</Text>
        ) : null}
      </View>
      <Ionicons name="chevron-forward" size={19} color="#AAAABA" />
    </Pressable>
  );
}
