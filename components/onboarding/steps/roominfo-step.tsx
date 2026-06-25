import { RoomInfoStepView } from './roominfo-step.view';
import { useRoomInfoStep, type UseRoomInfoStepProps } from './use-roominfo-step';

export type RoomInfoStepProps = UseRoomInfoStepProps;

export function RoomInfoStep(props: RoomInfoStepProps) {
  const asks = useRoomInfoStep(props);
  return <RoomInfoStepView {...asks} />;
}
