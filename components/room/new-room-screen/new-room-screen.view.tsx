import { Ionicons } from '@expo/vector-icons';
import type { ReactNode } from 'react';
import { ActivityIndicator, Pressable, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { CalendarField } from '@/components/onboarding/calendar-field';
import {
  MAX_ROOM_DESCRIPTION_LENGTH,
  MAX_ROOM_PHOTOS,
} from '@/components/room/room-post-form.model';
import { RoomRegionSheet } from '@/components/room/room-post-form.region-sheet';
import {
  FieldError,
  NegotiableSelector,
  PhotoSlot,
  RegionSelectButton,
} from '@/components/room/room-post-form.view';
import type { UseRoomPostFormReturn } from '@/components/room/use-room-post-form';
import { TextField } from '@/components/ui/headless';
import { HeaderBackButton } from '@/components/ui/header-back-button';
import {
  PriorityArtwork,
  RoomLocationArtwork,
  RoomOptionArtwork,
  RoomTypeArtwork,
} from '@/components/ui/ready-to-dev-assets';
import {
  ReadyConfirmDialog,
  ReadyErrorState,
  ReadyExitDialog,
  ReadyLoadingState,
  ReadyToast,
} from '@/components/ui/ready-to-dev-feedback';
import { formatSelectionLabel } from '@/lib/domain/selection-label';
import type { UseNewRoomScreenReturn } from './use-new-room-screen';

export type NewRoomScreenViewProps = UseNewRoomScreenReturn & {
  form: UseRoomPostFormReturn;
};

const STEP_TABS = [
  { no: '01', label: '생활패턴' },
  { no: '02', label: '방 정보' },
  { no: '03', label: '방 소개' },
];

export function NewRoomScreenView({
  session,
  submitting,
  successToastVisible,
  mypageDialogOpen,
  lifestyleTiles,
  preferredLifestyles,
  importantConditions,
  lifestyleLoading,
  lifestyleError,
  reloadLifestyle,
  exitDialogOpen,
  onBack,
  onExitCancel,
  onExitConfirm,
  onSignIn,
  onRequestEditProfile,
  onCancelEditProfile,
  onConfirmEditProfile,
  form,
}: NewRoomScreenViewProps) {
  const footerReserve = form.isFirstPage ? form.bottomPadding + 156 : form.bottomPadding + 96;

  if (!session) {
    return (
      <SafeAreaView className="flex-1 bg-white" edges={['top', 'bottom']}>
        <View className="flex-1 items-center justify-center gap-4 p-10">
          <Text className="text-base text-neutral-500">방을 등록하려면 로그인이 필요해요</Text>
          <Pressable onPress={onSignIn} className="rounded-full bg-yellow-300 px-5 py-3">
            <Text className="text-sm font-medium text-neutral-900">카카오로 시작하기</Text>
          </Pressable>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-white" edges={['top']}>
      <View className="relative h-12 items-center justify-center px-3">
        <HeaderBackButton onPress={onBack} color="#404047" className="absolute left-3" />
        <Text className="text-base font-semibold text-neutral-900">게시글 등록</Text>
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
            loading={lifestyleLoading}
            error={lifestyleError}
            onRetry={reloadLifestyle}
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
        {form.isFirstPage ? (
          <View className="gap-2">
            <WizardButton label="다음으로" onPress={form.goNext} disabled={!form.canProceed} />
            <Pressable
              onPress={onRequestEditProfile}
              accessibilityRole="button"
              className="h-12 items-center justify-center rounded-lg border border-[#256EF4] bg-white active:bg-[#ECF2FE]"
            >
              <Text className="text-[15px] font-semibold text-[#256EF4]">
                마이페이지에서 정보 수정하기
              </Text>
            </Pressable>
          </View>
        ) : (
          <View className="flex-row gap-2">
            <Pressable
              onPress={form.goPrev}
              accessibilityRole="button"
              className="h-12 flex-1 items-center justify-center rounded-lg border border-[#256EF4] bg-white active:bg-[#ECF2FE]"
            >
              <Text className="text-[15px] font-semibold text-[#256EF4]">이전으로</Text>
            </Pressable>
            <WizardButton
              label={form.isLastPage ? '등록하기' : '다음으로'}
              onPress={form.goNext}
              disabled={!form.canProceed || submitting}
              loading={form.isLastPage && submitting}
              grow
            />
          </View>
        )}
      </View>

      <RoomRegionSheet
        open={form.regionSheetOpen}
        onOpenChange={form.setRegionSheetOpen}
        value={form.selectedRegion}
        onSelect={form.selectRegion}
      />

      <ReadyConfirmDialog
        open={mypageDialogOpen}
        title="마이페이지로 이동하시겠어요?"
        description="해당 페이지를 나가면 작성한 글이 사라져요"
        cancelLabel="취소"
        confirmLabel="확인"
        onCancel={onCancelEditProfile}
        onConfirm={onConfirmEditProfile}
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
      <ReadyToast visible={successToastVisible} message="게시글이 등록되었어요" tone="success" />
    </SafeAreaView>
  );
}

export function StepTabs({
  activeStep,
  visitedStep,
  onTabPress,
}: {
  activeStep: number;
  visitedStep: number;
  onTabPress: (stepIndex: number) => void;
}) {
  return (
    <View className="flex-row border-b border-[#ECECF3]">
      {STEP_TABS.map((tab, index) => {
        const active = index === activeStep;
        const visited = index <= visitedStep;
        const enabled = index <= visitedStep;
        return (
          <Pressable
            key={tab.no}
            onPress={() => onTabPress(index)}
            disabled={!enabled}
            accessibilityRole="tab"
            accessibilityState={{ selected: active, disabled: !enabled }}
            className={`flex-1 gap-0.5 px-5 pb-2.5 pt-3 ${
              active ? 'border-b-2 border-[#256EF4]' : ''
            }`}
          >
            <Text
              className={
                visited ? 'text-[13px] font-semibold text-[#17171B]' : 'text-[13px] text-[#AAAABA]'
              }
            >
              {tab.no}
            </Text>
            <Text
              className={
                visited ? 'text-[15px] font-semibold text-[#17171B]' : 'text-[15px] text-[#AAAABA]'
              }
            >
              {tab.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

function WizardButton({
  label,
  onPress,
  disabled,
  loading,
  grow,
}: {
  label: string;
  onPress: () => void;
  disabled?: boolean;
  loading?: boolean;
  grow?: boolean;
}) {
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      accessibilityRole="button"
      accessibilityLabel={label}
      className={`h-12 ${grow ? 'flex-1' : 'w-full'} items-center justify-center rounded-lg ${
        disabled ? 'bg-[#F1F1F6]' : 'bg-[#256EF4] active:opacity-85'
      }`}
    >
      {loading ? (
        <ActivityIndicator color="#FFFFFF" />
      ) : (
        <Text className={`text-[15px] font-semibold ${disabled ? 'text-[#AAAABA]' : 'text-white'}`}>
          {label}
        </Text>
      )}
    </Pressable>
  );
}

function Headline({ children }: { children: ReactNode }) {
  return <Text className="text-xl font-bold leading-[30px] text-[#17171B]">{children}</Text>;
}

export function LifestylePage({
  tiles,
  preferredLifestyles,
  importantConditions,
  loading,
  error,
  onRetry,
}: {
  tiles: UseNewRoomScreenReturn['lifestyleTiles'];
  preferredLifestyles: UseNewRoomScreenReturn['preferredLifestyles'];
  importantConditions: UseNewRoomScreenReturn['importantConditions'];
  loading: boolean;
  error: string | null;
  onRetry: () => void;
}) {
  return (
    <View>
      <Headline>생활 패턴과 룸메이트 정보를{'\n'}확인해주세요</Headline>

      {loading ? (
        <ReadyLoadingState label="내 정보를 불러오는 중이에요." compact />
      ) : error ? (
        <ReadyErrorState
          title="내 정보를 불러오지 못했어요"
          description="네트워크 상태를 확인한 뒤 다시 시도해주세요."
          onRetry={onRetry}
          compact
        />
      ) : (
        <>
          <Text className="mt-8 text-[15px] font-bold text-[#17171B]">생활 패턴</Text>
          <View className="mt-3 flex-row flex-wrap gap-2">
            {tiles.map((tile) => (
              <LifestyleTile key={tile.id} label={tile.label} value={tile.value} />
            ))}
          </View>

          <Text className="mt-8 text-[15px] font-bold text-[#17171B]">선호 룸메이트 조건</Text>
          {preferredLifestyles.length ? (
            <View className="mt-3 flex-row flex-wrap gap-2">
              {preferredLifestyles.map((item) => (
                <View
                  key={item.id}
                  className="h-[42px] flex-row items-center justify-center gap-2 rounded-lg border border-[#DADAE8] bg-white px-3"
                >
                  <PriorityArtwork
                    label={formatSelectionLabel(item.label, item.value)}
                    image={item.image}
                    size={22}
                  />
                  <Text className="text-[14px] font-medium leading-[21px] text-[#696976]">
                    {formatSelectionLabel(item.label, item.value)}
                  </Text>
                </View>
              ))}
            </View>
          ) : (
            <EmptyNotice message="아직 선호 룸메이트 조건을 입력하지 않았어요" />
          )}

          <Text className="mt-8 text-[16px] font-semibold text-[#256EF4]">우선순위</Text>
          {importantConditions.length ? (
            <View className="mt-3 flex-row flex-wrap gap-2">
              {importantConditions.map((condition) => (
                <View
                  key={condition.id}
                  className="h-[42px] flex-row items-center justify-center gap-2 rounded-lg bg-[#ECF2FE] px-3"
                >
                  <PriorityArtwork label={condition.name} image={condition.image} size={22} />
                  <Text className="text-[14px] font-medium leading-[21px] text-[#17171B]">
                    {condition.name}
                  </Text>
                </View>
              ))}
            </View>
          ) : (
            <EmptyNotice message="아직 우선순위를 선택하지 않았어요" />
          )}
        </>
      )}
    </View>
  );
}

function EmptyNotice({ message }: { message: string }) {
  return (
    <View className="mt-3 rounded-lg bg-[#F6F6FA] px-4 py-4">
      <Text className="text-[13px] text-[#696976]">{message}</Text>
    </View>
  );
}

function LifestyleTile({ label, value }: { label: string; value: string }) {
  return (
    <View className="min-w-[47%] flex-1 gap-1.5 rounded-lg bg-[#F6F6FA] px-4 py-4">
      <Text className="text-[13px] text-[#696976]">{label}</Text>
      <Text className="text-base font-semibold text-[#17171B]">{value}</Text>
    </View>
  );
}

export function RoomTypePage({ form }: { form: UseRoomPostFormReturn }) {
  return (
    <View>
      <Headline>거주하고 있는{'\n'}방 형태를 선택해주세요</Headline>
      {form.roomTypesLoading ? (
        <ReadyLoadingState label="방 형태를 불러오는 중이에요." compact />
      ) : form.roomTypesError ? (
        <ReadyErrorState
          title="방 형태를 불러오지 못했어요"
          onRetry={form.reloadRoomTypes}
          compact
        />
      ) : (
        <View className="mt-6 flex-row flex-wrap gap-2">
          {form.roomTypes.map((roomType) => {
            const selected = form.draft.roomType === roomType.value;
            return (
              <Pressable
                key={roomType.value}
                onPress={() => form.selectRoomType(roomType.value)}
                accessibilityRole="button"
                accessibilityState={{ selected }}
                className={`aspect-square w-[31%] items-center py-[8px] px-[7px] gap-2 rounded-lg border ${
                  selected ? 'border-[#256EF4] bg-[#ECF2FE]' : 'border-[#DADAE8] bg-white'
                } active:opacity-80`}
              >
                <RoomTypeArtwork label={roomType.label} image={roomType.image} size={60} />
                <Text
                  style={{ includeFontPadding: false, lineHeight: 18 }}
                  className={
                    selected
                      ? 'text-center text-[13px] font-semibold text-[#256EF4]'
                      : 'text-center text-[13px] text-[#696976]'
                  }
                >
                  {roomType.label}
                </Text>
              </Pressable>
            );
          })}
        </View>
      )}
    </View>
  );
}

export function LocationPage({ form }: { form: UseRoomPostFormReturn }) {
  return (
    <View>
      <Headline>거주하고 있는{'\n'}집의 주소를 선택해주세요</Headline>
      <View className="mt-6">
        <RegionSelectButton
          selected={form.selectedRegion}
          onPress={() => form.setRegionSheetOpen(true)}
        />
      </View>
      <View className="mt-4 w-full items-center rounded-lg">
        <RoomLocationArtwork size={180} />
      </View>
    </View>
  );
}

export function BudgetPage({ form }: { form: UseRoomPostFormReturn }) {
  return (
    <View>
      <Headline>거주하고 있는 집의{'\n'}예산을 선택해주세요</Headline>
      <View className="mt-8 gap-8">
        <MoneyField
          label="보증금"
          value={form.draft.deposit}
          onChange={form.setDeposit}
          error={form.depositError}
        />
        <MoneyField
          label="월세"
          value={form.draft.rent}
          onChange={form.setRent}
          error={form.rentError}
        />
        <MoneyField
          label="관리비"
          optional
          value={form.draft.maintenance}
          onChange={form.setMaintenance}
        />
      </View>
    </View>
  );
}

function MoneyField({
  label,
  optional,
  value,
  onChange,
  error,
}: {
  label: string;
  optional?: boolean;
  value: string;
  onChange: (next: string) => void;
  error?: string | null;
}) {
  return (
    <View className="gap-1">
      <View className="flex-row items-center gap-1">
        <Text className="text-[15px] font-bold text-[#17171B]">{label}</Text>
        {optional ? <Text className="text-xs text-[#AAAABA]">선택</Text> : null}
      </View>
      <View
        className={`flex-row items-center gap-2 border-b py-3 ${
          error ? 'border-[#E5484D]' : 'border-[#DADAE8]'
        }`}
      >
        <TextField
          value={value}
          onChangeValue={(next) => onChange(next.replace(/\D/g, ''))}
          keyboardType="number-pad"
          placeholder={label}
          className="h-7 flex-1 px-0 py-0 text-base text-[#17171B]"
          style={{ lineHeight: 22 }}
        />
        <Text className="text-[15px] text-[#AAAABA]">만원</Text>
      </View>
      <FieldError message={error ?? null} />
    </View>
  );
}

export function MoveInPage({ form }: { form: UseRoomPostFormReturn }) {
  const needsMoveInDate = form.draft.negotiable === false;

  return (
    <View>
      <Headline>입주 가능일을{'\n'}입력해주세요</Headline>
      <View className="mt-8 gap-3">
        <Text className="text-[15px] font-bold text-[#17171B]">협의 가능 여부</Text>
        <NegotiableSelector value={form.draft.negotiable} onChange={form.setNegotiable} />
      </View>
      {needsMoveInDate ? (
        <View className="mt-[38px] gap-2">
          <Text className="text-[15px] font-bold text-[#17171B]">입주 가능일</Text>
          <CalendarField
            value={form.moveInDate}
            onChange={form.selectMoveInDate}
            placeholder="날짜 선택"
          />
        </View>
      ) : null}
    </View>
  );
}

export function OptionsPage({ form }: { form: UseRoomPostFormReturn }) {
  return (
    <View>
      <Headline>
        방의{'\n'}옵션을 선택해주세요{' '}
        <Text className="text-sm font-normal text-[#AAAABA]">선택</Text>
      </Headline>
      <Text className="mt-2 text-sm text-[#696976]">해당되는 항목을 모두 선택해주세요</Text>
      {form.roomOptionsLoading ? (
        <ReadyLoadingState label="방 옵션을 불러오는 중이에요." compact />
      ) : form.roomOptionsError ? (
        <ReadyErrorState
          title="방 옵션을 불러오지 못했어요"
          onRetry={form.reloadRoomOptions}
          compact
        />
      ) : (
        <View className="mt-5 flex-row flex-wrap gap-3 items-center justify-center">
          {form.roomOptions.map((option) => {
            const selected = form.draft.options.includes(option.value);
            return (
              <Pressable
                key={option.value}
                onPress={() => form.toggleOption(option.value)}
                accessibilityRole="button"
                accessibilityState={{ selected }}
                className={`aspect-square w-[31%] gap-3 items-center justify-center rounded-lg border px-2 ${
                  selected ? 'border-[#256EF4] bg-[#ECF2FE]' : 'border-[#DADAE8] bg-white'
                } active:opacity-80`}
              >
                <RoomOptionArtwork label={option.label} image={option.image} size={40} />
                <Text
                  className={
                    selected
                      ? 'text-center text-[14px] text-[#256EF4]'
                      : 'text-center text-[14px] text-[#696976]'
                  }
                >
                  {option.label}
                </Text>
              </Pressable>
            );
          })}
        </View>
      )}
    </View>
  );
}

export function IntroPage({ form }: { form: UseRoomPostFormReturn }) {
  return (
    <View>
      <Headline>방을{'\n'}자유롭게 소개해주세요</Headline>

      <View className="mt-8 gap-1">
        <Text className="text-[15px] font-bold text-[#17171B]">제목</Text>
        {/* 제목이 길어지면 줄바꿈되면서 밑줄도 같이 내려가야 한다.
            그래서 높이를 고정하지 않고 multiline + 최소 높이로 둔다.
            (py-3 + lineHeight 24 = 한 줄일 때 기존 h-12 와 같은 높이) */}
        <TextField
          value={form.draft.title}
          onChangeValue={form.setTitle}
          placeholder="예) 신촌역 도보 5분, 풀옵션 원룸"
          multiline
          submitBehavior="blurAndSubmit"
          returnKeyType="done"
          className="min-h-12 border-b border-[#DADAE8] px-0 py-3 text-base text-[#17171B]"
          style={{ lineHeight: 24 }}
        />
      </View>

      <View className="mt-8 gap-1">
        <Text className="text-[15px] font-bold text-[#17171B]">내용</Text>
        <TextField
          value={form.draft.description}
          onChangeValue={form.setDescription}
          placeholder="함께 지낼 룸메이트에게 방과 생활 환경을 소개해주세요"
          multiline
          numberOfLines={8}
          maxLength={MAX_ROOM_DESCRIPTION_LENGTH}
          className="min-h-[160px] border-b border-[#DADAE8] px-0 py-3 text-base leading-6 text-[#17171B]"
        />
        <Text className="self-end text-xs">
          <Text className={form.draft.description.length > 0 ? 'text-[#256EF4]' : 'text-[#AAAABA]'}>
            {form.draft.description.length}
          </Text>
          <Text className="text-[#AAAABA]">/{MAX_ROOM_DESCRIPTION_LENGTH}</Text>
        </Text>
      </View>

      <View className="mt-6 gap-3">
        <View className="flex-row items-center gap-1">
          <Text className="text-[15px] font-bold text-[#17171B]">사진</Text>
          <Text className="text-xs text-[#AAAABA]">선택</Text>
        </View>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerClassName="gap-2"
        >
          {form.photoCount < MAX_ROOM_PHOTOS ? (
            <Pressable
              onPress={form.addPhotos}
              disabled={form.selectingPhotos}
              accessibilityRole="button"
              accessibilityLabel="사진 추가"
              className="h-20 w-20 items-center justify-center gap-1 rounded border border-[#DADAE8] bg-white active:opacity-70"
            >
              <Ionicons name="camera-outline" size={24} color="#AAAABA" />
              <Text className="text-xs text-[#AAAABA]">
                {form.photoCount}/{MAX_ROOM_PHOTOS}
              </Text>
            </Pressable>
          ) : null}
          {form.draft.imageUris.map((uri, index) => (
            <PhotoSlot
              key={`${uri}-${index}`}
              uri={uri}
              index={index}
              onRemove={form.removePhoto}
            />
          ))}
        </ScrollView>
      </View>
    </View>
  );
}
