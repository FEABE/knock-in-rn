# Form (react-hook-form integration)

## 컨벤션

- **기본**: `Controller + FormField` 방식 — 필드가 5개 이상이거나 검증/에러 표시가 필요한 폼.
- **예외**: 필드가 1~4개인 단순 폼은 `register` 방식 (`registerField` 어댑터 사용).
- 래퍼 방식(컴포넌트가 RHF를 내부적으로 알게 하는 방식)은 사용하지 않음 — 디버깅이 어려워짐.

## Controller + FormField

`<Form>`(FormProvider) 안에 `<FormField>`(Controller) 를 둔다. 각 필드는 `render` prop으로 `field`/`fieldState` 를 받아 헤드리스 컴포넌트에 전달한다.

```tsx
import { Form, FormField, useForm, TextField } from '@/components/ui/headless';

const form = useForm<Values>({ defaultValues: { name: '' }, mode: 'onBlur' });

<Form form={form}>
  <FormField
    name="name"
    rules={{ required: 'Name is required' }}
    render={({ field, fieldState }) => (
      <TextField
        value={field.value}
        onChangeValue={field.onChange}
        onBlur={field.onBlur}
        invalid={fieldState.invalid}
      />
    )}
  />
</Form>
```

자식 컴포넌트로 폼 필드를 분리할 땐 `useFormField` 훅을 써서 컨텍스트에서 바로 가져온다.

```tsx
function PlanField() {
  const { value, onChange, error } = useFormField<Values, 'plan'>({ name: 'plan' });
  return <RadioGroup.Root value={value} onValueChange={onChange} />;
}
```

## register (작은 폼 전용)

RHF의 `register()` 는 DOM 이벤트 시그니처를 반환하기 때문에 RN의 `TextInput`/`TextField` 와 직접 호환되지 않는다. `registerField` 어댑터가 이를 `value`/`onChangeValue`/`onBlur`/`ref` 로 변환한다.

```tsx
import { registerField, useForm, TextField } from '@/components/ui/headless';

const form = useForm<{ email: string; password: string }>();

<TextField {...registerField(form, 'email', { required: true })} />
<TextField {...registerField(form, 'password', { required: true })} secureTextEntry />
```

제약:
- `register` 방식은 **TextField 같은 텍스트 입력에만** 사용. Checkbox/Toggle/RadioGroup/Dropdown 등은 항상 Controller 방식.
- 필드별 에러 메시지를 표시해야 한다면 Controller 방식이 더 자연스럽다.

## 의사결정 근거

| 항목 | Controller | register |
| --- | --- | --- |
| 디버깅 | 명시적 props로 추적 쉬움 | 어댑터 안쪽 동작 추적 필요 |
| 보일러플레이트 | 많음 | 적음 |
| 비-텍스트 필드 지원 | O | X |
| 검증/에러 표시 | 자연스러움 | 별도 처리 필요 |

복잡도가 자라면 register → Controller 로 전환한다 (반대는 거의 없음).
