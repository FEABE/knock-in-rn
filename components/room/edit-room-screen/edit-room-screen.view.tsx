import { Ionicons } from '@expo/vector-icons';
import { ActivityIndicator, Pressable, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import {
  BudgetPage,
  IntroPage,
  LifestylePage,
  LocationPage,
  MoveInPage,
  OptionsPage,
  RoomTypePage,
  StepTabs,
} from '@/components/room/new-room-screen/new-room-screen.view';
import type { RoomFormDraft, RoomFormValues } from '@/components/room/room-post-form';
import { RoomRegionSheet } from '@/components/room/room-post-form.region-sheet';
import { useRoomPostForm } from '@/components/room/use-room-post-form';
import type { LifestyleSummaryItem, PreferencePrioritySummaryItem } from '@/lib/api';
import { ReadyExitDialog, ReadyToast } from '@/components/ui/ready-to-dev-feedback';

import type { UseEditRoomScreenReturn } from './use-edit-room-screen';

export type EditRoomScreenViewProps = UseEditRoomScreenReturn;

export function EditRoomScreenView({
  state,
  profile,
  initial,
  lifestyleTiles,
  preferredLifestyles,
  importantConditions,
  profileMetadataChanged,
  submitting,
  toastMessage,
  exitDialogOpen,
  onBack,
  onExitCancel,
  onExitConfirm,
  onSubmit,
}: EditRoomScreenViewProps) {
  if (state === 'loading') {
    return <MessageState message="게시글을 불러오는 중..." onBack={onBack} />;
  }

  if (state === 'missing') {
    return <MessageState message="게시글을 찾을 수 없어요" onBack={onBack} />;
  }

  if (state === 'forbidden' || !profile || !initial) {
    return <MessageState message="작성자만 수정할 수 있어요" onBack={onBack} />;
  }

  return (
    <EditableRoomScreen
      initial={initial}
      lifestyleTiles={lifestyleTiles}
      preferredLifestyles={preferredLifestyles}
      importantConditions={importantConditions}
      profileMetadataChanged={profileMetadataChanged}
      submitting={submitting}
      toastMessage={toastMessage}
      exitDialogOpen={exitDialogOpen}
      onBack={onBack}
      onExitCancel={onExitCancel}
      onExitConfirm={onExitConfirm}
      onSubmit={onSubmit}
    />
  );
}

function EditableRoomScreen({
  initial,
  lifestyleTiles,
  preferredLifestyles,
  importantConditions,
  profileMetadataChanged,
  submitting,
  toastMessage,
  exitDialogOpen,
  onBack,
  onExitCancel,
  onExitConfirm,
  onSubmit,
}: {
  initial: Partial<RoomFormDraft>;
  lifestyleTiles: LifestyleSummaryItem[];
  preferredLifestyles: LifestyleSummaryItem[];
  importantConditions: PreferencePrioritySummaryItem[];
  profileMetadataChanged: boolean;
  submitting: boolean;
  toastMessage: string | null;
  exitDialogOpen: boolean;
  onBack: () => void;
  onExitCancel: () => void;
  onExitConfirm: () => void;
  onSubmit: (values: RoomFormValues) => Promise<void>;
}) {
  const form = useRoomPostForm({ initial, onSubmit, mode: 'edit' });
  const canSave = form.canSubmit && (form.isDirty || profileMetadataChanged) && !submitting;
  const footerReserve = form.bottomPadding + 96;

  return (
    <SafeAreaView className="flex-1 bg-white" edges={['top']}>
      <View className="relative h-12 items-center justify-center px-3">
        <Pressable onPress={onBack} className="absolute left-3 h-9 w-9 items-center justify-center">
          <Ionicons name="chevron-back" size={24} color="#404047" />
        </Pressable>
        <Text className="text-base font-semibold text-neutral-900">게시글 수정</Text>
        <View className="absolute right-3 flex-row items-center gap-1">
          <Pressable
            onPress={form.submit}
            disabled={!canSave}
            accessibilityRole="button"
            accessibilityLabel="게시글 저장"
            accessibilityState={{ disabled: !canSave }}
            className="min-w-[44px] items-center justify-center px-1 py-2"
          >
            {submitting ? (
              <ActivityIndicator size="small" color="#256EF4" />
            ) : (
              <Text
                className={`text-[15px] font-semibold ${
                  canSave ? 'text-[#256EF4]' : 'text-[#AAAABA]'
                }`}
              >
                저장
              </Text>
            )}
          </Pressable>
        </View>
      </View>

      <StepTabs
        activeStep={form.stepIndex}
        visitedStep={form.visitedStepIndex}
        onTabPress={form.goToStep}
      />

      <ScrollView
        contentContainerClassName="flex-grow px-5 pt-6"
        contentContainerStyle={{ paddingBottom: footerReserve }}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="interactive"
        automaticallyAdjustKeyboardInsets
      >
        {form.page === 'lifestyle' ? (
          <LifestylePage
            tiles={lifestyleTiles}
            preferredLifestyles={preferredLifestyles}
            importantConditions={importantConditions}
            loading={false}
            error={null}
            onRetry={() => undefined}
          />
        ) : form.page === 'roomType' ? (
          <RoomTypePage form={form} />
        ) : form.page === 'location' ? (
          <LocationPage form={form} />
        ) : form.page === 'budget' ? (
          <BudgetPage form={form} />
        ) : form.page === 'moveIn' ? (
          <MoveInPage form={form} />
        ) : form.page === 'options' ? (
          <OptionsPage form={form} />
        ) : (
          <IntroPage form={form} />
        )}
      </ScrollView>

      <View
        className="absolute inset-x-0 bottom-0 border-t border-neutral-100 bg-white px-5 pt-3"
        style={{ paddingBottom: form.bottomPadding }}
      >
        <View className="flex-row gap-2">
          {!form.isFirstPage ? (
            <WizardNavigationButton label="이전으로" onPress={form.goPrev} secondary />
          ) : null}
          {!form.isLastPage ? (
            <WizardNavigationButton
              label="다음으로"
              onPress={form.goNext}
              disabled={!form.canProceed}
            />
          ) : null}
        </View>
      </View>

      <RoomRegionSheet
        open={form.regionSheetOpen}
        onOpenChange={form.setRegionSheetOpen}
        value={form.selectedRegion}
        onSelect={form.selectRegion}
      />

      <ReadyExitDialog
        open={exitDialogOpen}
        title="해당 페이지를 나갈까요?"
        description="해당 페이지를 나가면 작성한 글이 사라져요"
        onCancel={onExitCancel}
        onConfirm={onExitConfirm}
      />

      <ReadyToast
        visible={form.toastMessage !== null}
        message={form.toastMessage ?? ''}
        tone="neutral"
        icon="warning"
      />
      <ReadyToast visible={toastMessage !== null} message={toastMessage ?? ''} tone="success" />
    </SafeAreaView>
  );
}

function WizardNavigationButton({
  label,
  onPress,
  disabled = false,
  secondary = false,
}: {
  label: string;
  onPress: () => void;
  disabled?: boolean;
  secondary?: boolean;
}) {
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      accessibilityRole="button"
      accessibilityState={{ disabled }}
      className={`h-12 flex-1 items-center justify-center rounded-lg border ${
        secondary
          ? 'border-[#256EF4] bg-white'
          : disabled
            ? 'border-[#F1F1F6] bg-[#F1F1F6]'
            : 'border-[#256EF4] bg-[#256EF4]'
      }`}
    >
      <Text
        className={`text-[15px] font-semibold ${
          secondary ? 'text-[#256EF4]' : disabled ? 'text-[#AAAABA]' : 'text-white'
        }`}
      >
        {label}
      </Text>
    </Pressable>
  );
}

function MessageState({ message, onBack }: { message: string; onBack: () => void }) {
  return (
    <SafeAreaView className="flex-1 bg-white" edges={['top', 'bottom']}>
      <View className="flex-1 items-center justify-center gap-3">
        <Text className="text-sm text-neutral-500">{message}</Text>
        <Pressable onPress={onBack} className="rounded-full bg-neutral-100 px-4 py-2">
          <Text className="text-sm text-neutral-700">돌아가기</Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}
