import { UserDocument } from '@app/users/entities/user.entity'
import { RoomDocument } from '@app/room/entities/room.entity'

type AttachSendBuilder<T> = (
  user: UserDocument,
  room: RoomDocument,
  value: T
) => object
