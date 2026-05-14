import { Alert, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import {
  Button,
  Checkbox,
  Dropdown,
  Form,
  FormField,
  Modal,
  RadioGroup,
  TextField,
  Toggle,
  registerField,
  useForm,
  useFormField,
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

        <Section title="Form (Controller + FormField)">
          <ControllerFormDemo />
        </Section>

        <Section title="Form (register, small form)">
          <RegisterFormDemo />
        </Section>
      </ScrollView>
    </SafeAreaView>
  );
}

type ProfileFormValues = {
  name: string;
  email: string;
  plan: 'free' | 'pro';
  fruit: string;
  notifications: boolean;
  acceptTerms: boolean;
};

function ControllerFormDemo() {
  const form = useForm<ProfileFormValues>({
    defaultValues: {
      name: '',
      email: '',
      plan: 'free',
      fruit: 'apple',
      notifications: true,
      acceptTerms: false,
    },
    mode: 'onBlur',
  });

  const onSubmit = form.handleSubmit((values) => {
    Alert.alert('Profile submitted', JSON.stringify(values, null, 2));
  });

  return (
    <Form form={form}>
      <View className="gap-4 rounded-xl border border-neutral-200 p-4">
        <FormField
          name="name"
          rules={{ required: 'Name is required' }}
          render={({ field, fieldState }) => (
            <FieldRow label="Name" error={fieldState.error?.message}>
              <TextField
                value={field.value}
                onChangeValue={field.onChange}
                onBlur={field.onBlur}
                invalid={fieldState.invalid}
                placeholder="Jane Doe"
                className="rounded-md border border-neutral-300 px-3 py-2"
              />
            </FieldRow>
          )}
        />

        <FormField
          name="email"
          rules={{
            required: 'Email is required',
            pattern: { value: /.+@.+\..+/, message: 'Invalid email' },
          }}
          render={({ field, fieldState }) => (
            <FieldRow label="Email" error={fieldState.error?.message}>
              <TextField
                value={field.value}
                onChangeValue={field.onChange}
                onBlur={field.onBlur}
                invalid={fieldState.invalid}
                autoCapitalize="none"
                keyboardType="email-address"
                placeholder="you@example.com"
                className="rounded-md border border-neutral-300 px-3 py-2"
              />
            </FieldRow>
          )}
        />

        <PlanField />

        <FormField
          name="fruit"
          render={({ field }) => (
            <FieldRow label="Favorite fruit">
              <Dropdown.Root
                value={field.value}
                onValueChange={field.onChange}
              >
                <Dropdown.Trigger className="self-start rounded-md border border-neutral-300 px-3 py-2">
                  <Text className="text-neutral-800">{field.value}</Text>
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
            </FieldRow>
          )}
        />

        <FormField
          name="notifications"
          render={({ field }) => (
            <View className="flex-row items-center justify-between">
              <Text className="text-neutral-800">Email notifications</Text>
              <Toggle checked={field.value} onCheckedChange={field.onChange}>
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
            </View>
          )}
        />

        <FormField
          name="acceptTerms"
          rules={{ required: 'You must accept the terms' }}
          render={({ field, fieldState }) => (
            <View className="gap-1">
              <View className="flex-row items-center gap-3">
                <Checkbox
                  checked={field.value}
                  onCheckedChange={field.onChange}
                >
                  {({ checked }) => (
                    <View
                      className={`h-5 w-5 items-center justify-center rounded border ${
                        checked
                          ? 'border-blue-600 bg-blue-600'
                          : 'border-neutral-400 bg-white'
                      }`}
                    >
                      {checked ? (
                        <Text className="text-xs font-bold text-white">
                          ✓
                        </Text>
                      ) : null}
                    </View>
                  )}
                </Checkbox>
                <Text className="text-neutral-800">I accept the terms</Text>
              </View>
              {fieldState.error?.message ? (
                <Text className="text-xs text-red-600">
                  {fieldState.error.message}
                </Text>
              ) : null}
            </View>
          )}
        />

        <Button
          className="self-start rounded-lg bg-blue-600 px-4 py-2 active:bg-blue-700"
          onPress={onSubmit}
        >
          <Text className="font-medium text-white">Submit</Text>
        </Button>
      </View>
    </Form>
  );
}

function PlanField() {
  const { value, onChange, error } = useFormField<ProfileFormValues, 'plan'>({
    name: 'plan',
  });

  return (
    <FieldRow label="Plan" error={error}>
      <RadioGroup.Root value={value} onValueChange={onChange}>
        <View className="flex-row gap-4">
          {(['free', 'pro'] as const).map((option) => (
            <RadioGroup.Item key={option} value={option}>
              {({ selected }) => (
                <View className="flex-row items-center gap-2">
                  <View
                    className={`h-5 w-5 items-center justify-center rounded-full border ${
                      selected
                        ? 'border-blue-600'
                        : 'border-neutral-400'
                    }`}
                  >
                    {selected ? (
                      <View className="h-2.5 w-2.5 rounded-full bg-blue-600" />
                    ) : null}
                  </View>
                  <Text className="capitalize text-neutral-800">{option}</Text>
                </View>
              )}
            </RadioGroup.Item>
          ))}
        </View>
      </RadioGroup.Root>
    </FieldRow>
  );
}

type LoginFormValues = {
  email: string;
  password: string;
};

function RegisterFormDemo() {
  const form = useForm<LoginFormValues>({
    defaultValues: { email: '', password: '' },
  });

  const onSubmit = form.handleSubmit((values) => {
    Alert.alert('Login submitted', JSON.stringify(values, null, 2));
  });

  return (
    <View className="gap-3 rounded-xl border border-neutral-200 p-4">
      <TextField
        {...registerField(form, 'email', { required: true })}
        autoCapitalize="none"
        keyboardType="email-address"
        placeholder="Email"
        className="rounded-md border border-neutral-300 px-3 py-2"
      />
      <TextField
        {...registerField(form, 'password', { required: true })}
        secureTextEntry
        placeholder="Password"
        className="rounded-md border border-neutral-300 px-3 py-2"
      />
      <Button
        className="self-start rounded-lg bg-blue-600 px-4 py-2 active:bg-blue-700"
        onPress={onSubmit}
      >
        <Text className="font-medium text-white">Sign in</Text>
      </Button>
    </View>
  );
}

function FieldRow({
  label,
  error,
  children,
}: {
  label: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <View className="gap-1">
      <Text className="text-sm font-medium text-neutral-700">{label}</Text>
      {children}
      {error ? <Text className="text-xs text-red-600">{error}</Text> : null}
    </View>
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
