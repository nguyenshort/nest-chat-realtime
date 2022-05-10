import { UserDocument } from '@app/users/entities/user.entity'
import { MessageDocument } from '@app/message/entities/message.entity'
import { LicenseDocument } from '@app/license/entities/license.entity'
import { RoomDocument } from '@app/room/entities/room.entity'

export interface IMesssageService {
  create: (input: IMessageCreate) => Promise<MessageDocument>
  read: (user: UserDocument, anchor: MessageDocument) => Promise<any>
  remove: (
    user: UserDocument,
    message: MessageDocument
  ) => Promise<MessageDocument>
  findMany: (filter: object) => Promise<MessageDocument[]>
}

export interface IMessageCreate {
  from: UserDocument
  to: UserDocument
  app: LicenseDocument
  content: string
  room: RoomDocument
}
