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
    <SafeAreaView className="flex-1 bg-white" edges={['top']}>
      <Header title="계정 설정" onBack={onBack} />

      <ScrollView contentContainerClassName="gap-8 p-5">
        {sections.map((section) => (
          <Section key={section.title} section={section} />
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

function Header({ title, onBack }: { title: string; onBack: () => void }) {
  return (
    <View className="flex-row items-center gap-2 border-b border-neutral-100 px-3 py-2">
      <Pressable onPress={onBack} className="h-9 w-9 items-center justify-center">
        <Ionicons name="chevron-back" size={24} color="#404040" />
      </Pressable>
      <Text className="text-base font-semibold text-neutral-900">{title}</Text>
    </View>
  );
}

function Section({ section }: { section: AccountSettingsSection }) {
  return (
    <View className="gap-2">
      <Text className="text-xs font-semibold text-neutral-400">{section.title}</Text>
      <View>
        {section.rows.map((row) => (
          <Row key={row.title} row={row} />
        ))}
      </View>
    </View>
  );
}

function Row({ row }: { row: AccountSettingsRow }) {
  const danger = row.tone === 'danger';

  return (
    <Pressable
      onPress={row.onPress}
      className="flex-row items-center gap-3 border-b border-neutral-100 py-4 active:bg-neutral-50"
    >
      <View
        className={`h-9 w-9 items-center justify-center rounded-full ${
          danger ? 'bg-rose-50' : 'bg-neutral-100'
        }`}
      >
        <Ionicons name={row.icon} size={20} color={danger ? '#E11D48' : '#525252'} />
      </View>
      <View className="flex-1 gap-0.5">
        <Text className={`text-sm font-semibold ${danger ? 'text-rose-600' : 'text-neutral-900'}`}>
          {row.title}
        </Text>
        {row.description ? (
          <Text className="text-xs text-neutral-400">{row.description}</Text>
        ) : null}
      </View>
      <Ionicons name="chevron-forward" size={18} color="#D4D4D4" />
    </Pressable>
  );
}
