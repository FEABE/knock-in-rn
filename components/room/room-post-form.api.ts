import {
  compactNumbers,
  regionBackendId,
  roomTypeBackendId,
  type BoardWriteRequest,
} from '@/lib/api';

import type { RoomFormValues } from './room-post-form.model';

type BoardWriteRequestWithOptions = BoardWriteRequest & {
  roomOption?: number[];
};

export function roomFormValuesToBoardWriteRequest(values: RoomFormValues): BoardWriteRequest {
  const imageUrls = values.imageUrls.filter(Boolean);
  const roomOption = compactNumbers(values.options);
  const body: BoardWriteRequestWithOptions = {
    title: values.title,
    contents: values.description,
    deposit: values.deposit,
    mountlyRent: values.monthlyRent,
    monthlyRent: values.monthlyRent,
    managementCost: values.maintenanceFee ?? 0,
    roomType: roomTypeBackendId(values.roomType),
    roomTypeId: roomTypeBackendId(values.roomType),
    region: regionBackendId(values.region),
    regionId: regionBackendId(values.region),
    comeableAt: values.moveInDate ? values.moveInDate.toISOString() : undefined,
    comeableDate: values.moveInDate ? values.moveInDate.toISOString() : undefined,
  };
  if (imageUrls.length > 0) {
    body.images = imageUrls.map((image, index) => ({
      image,
      uri: image,
      fileIndex: index,
      thumbnail: index === 0,
      thumnail: index === 0,
    }));
  }
  if (roomOption.length > 0) {
    body.roomOption = roomOption;
  }
  return body;
}
