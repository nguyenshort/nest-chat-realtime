import { RoomDocument } from '@app/room/entities/room.entity'
import { LicenseDocument } from '@app/license/entities/license.entity'
import { UserDocument } from '@app/users/entities/user.entity'

export interface IRoomServices {
  create: (
    license: LicenseDocument,
    users: UserDocument[],
    doc: ICreateRoom
  ) => Promise<RoomDocument>
}

export interface ICreateRoom {
  name: string
  avatar: string
}
