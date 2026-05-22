import { forwardRef, type ReactNode } from 'react';
import { Pressable, View, type View as RNView } from 'react-native';

import { Modal } from '../modal';

export type BottomSheetProps = {
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  trigger?: ReactNode;
  triggerClassName?: string;
  backdropClassName?: string;
  contentClassName?: string;
  handleClassName?: string;
  showHandle?: boolean;
  children?: ReactNode;
};

function Root({
  open,
  defaultOpen,
  onOpenChange,
  trigger,
  triggerClassName,
  backdropClassName = 'flex-1 justify-end bg-black/50',
  contentClassName = 'rounded-t-2xl bg-white p-5 pb-8',
  handleClassName = 'mx-auto mb-3 h-1.5 w-10 rounded-full bg-neutral-300',
  showHandle = true,
  children,
}: BottomSheetProps) {
  return (
    <Modal.Root
      open={open}
      defaultOpen={defaultOpen}
      onOpenChange={onOpenChange}
    >
      {trigger ? (
        <Modal.Trigger className={triggerClassName}>{trigger}</Modal.Trigger>
      ) : null}
      <Modal.Portal animationType="slide">
        <Modal.Backdrop className={backdropClassName}>
          <Pressable
            onPress={(e) => e.stopPropagation()}
            accessibilityViewIsModal
          >
            <View className={contentClassName}>
              {showHandle ? <View className={handleClassName} /> : null}
              {children}
            </View>
          </Pressable>
        </Modal.Backdrop>
      </Modal.Portal>
    </Modal.Root>
  );
}

const Close = forwardRef<
  RNView,
  React.ComponentProps<typeof Modal.Close>
>(function Close(props, ref) {
  return <Modal.Close ref={ref} {...props} />;
});

export const BottomSheet = Object.assign(Root, { Close });
