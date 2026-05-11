import { ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import {
  Button,
  Dropdown,
  Modal,
  Toggle,
} from '@/components/ui/headless';

export default function HeadlessDemo() {
  return (
    <SafeAreaView className="flex-1 bg-white dark:bg-neutral-900">
      <ScrollView contentContainerClassName="p-6 gap-8">
        <Text className="text-2xl font-bold text-neutral-900 dark:text-white">
          Headless Components
        </Text>

        <Section title="Button">
          <Button
            className="self-start rounded-lg bg-blue-600 px-4 py-2 active:bg-blue-700"
            onPress={() => {}}
          >
            <Text className="font-medium text-white">Primary</Text>
          </Button>

          <Button
            className="self-start rounded-lg border border-neutral-300 px-4 py-2 active:bg-neutral-100"
            onPress={() => {}}
          >
            {({ pressed }) => (
              <Text
                className={
                  pressed
                    ? 'font-medium text-blue-600'
                    : 'font-medium text-neutral-800'
                }
              >
                Render prop ({pressed ? 'pressed' : 'idle'})
              </Text>
            )}
          </Button>

          <Button
            loading
            className="self-start rounded-lg bg-neutral-800 px-4 py-2"
            onPress={() => {}}
          >
            <Text className="font-medium text-white">Loading</Text>
          </Button>

          <Button
            disabled
            className="self-start rounded-lg bg-neutral-300 px-4 py-2"
            onPress={() => {}}
          >
            <Text className="font-medium text-neutral-500">Disabled</Text>
          </Button>
        </Section>

        <Section title="Toggle">
          <Toggle defaultChecked>
            {({ checked }) => (
              <View
                className={`h-7 w-12 flex-row items-center rounded-full px-1 ${
                  checked ? 'bg-blue-600' : 'bg-neutral-300'
                }`}
              >
                <View
                  className={`h-5 w-5 rounded-full bg-white ${
                    checked ? 'ml-5' : 'ml-0'
                  }`}
                />
              </View>
            )}
          </Toggle>
        </Section>

        <Section title="Dropdown">
          <Dropdown.Root defaultValue="apple">
            <Dropdown.Trigger className="self-start rounded-lg border border-neutral-300 px-4 py-2">
              <Text className="text-neutral-800">Open menu</Text>
            </Dropdown.Trigger>
            <Dropdown.Content className="mt-2 w-48 gap-1 rounded-lg border border-neutral-200 bg-white p-1 shadow">
              {['apple', 'banana', 'cherry'].map((fruit) => (
                <Dropdown.Item
                  key={fruit}
                  value={fruit}
                  className="rounded px-3 py-2 active:bg-neutral-100"
                >
                  {({ selected }) => (
                    <Text
                      className={
                        selected
                          ? 'font-semibold text-blue-600'
                          : 'text-neutral-800'
                      }
                    >
                      {fruit}
                    </Text>
                  )}
                </Dropdown.Item>
              ))}
            </Dropdown.Content>
          </Dropdown.Root>
        </Section>

        <Section title="Modal">
          <Modal.Root>
            <Modal.Trigger className="self-start rounded-lg bg-blue-600 px-4 py-2">
              <Text className="font-medium text-white">Open modal</Text>
            </Modal.Trigger>
            <Modal.Portal>
              <Modal.Backdrop className="flex-1 items-center justify-center bg-black/50">
                <Modal.Content className="w-72 gap-4 rounded-xl bg-white p-6">
                  <Text className="text-lg font-bold text-neutral-900">
                    Hello from a headless modal
                  </Text>
                  <Text className="text-neutral-600">
                    Backdrop press closes. Compose styles however you like.
                  </Text>
                  <Modal.Close className="self-end rounded-lg bg-neutral-900 px-4 py-2">
                    <Text className="font-medium text-white">Close</Text>
                  </Modal.Close>
                </Modal.Content>
              </Modal.Backdrop>
            </Modal.Portal>
          </Modal.Root>
        </Section>
      </ScrollView>
    </SafeAreaView>
  );
}

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <View className="gap-3">
      <Text className="text-sm font-semibold uppercase tracking-wide text-neutral-500">
        {title}
      </Text>
      <View className="gap-3">{children}</View>
    </View>
  );
}
