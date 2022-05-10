import { MessageDocument } from '@app/message/entities/message.entity'
import { CreateMessageInput } from '@app/message/dto/create-message.input'
import { LicenseDocument } from '@app/license/entities/license.entity'
import { RoomDocument } from '@app/room/entities/room.entity'

export interface IMessageResolver {
  messageSend: (
    license: LicenseDocument,
    room: RoomDocument,
    input: CreateMessageInput
  ) => Promise<MessageDocument>
}
