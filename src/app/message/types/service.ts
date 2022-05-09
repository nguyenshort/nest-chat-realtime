import { UserDocument } from '@app/users/entities/user.entity'
import { CreateMessageInput } from '@app/message/dto/create-message.input'
import { MessageDocument } from '@app/message/entities/message.entity'

export interface IMesssageService {
  create: (input: IMessageCreate) => Promise<MessageDocument>
  read: (user: UserDocument, anchor: MessageDocument) => Promise<any>
  remove: (
    user: UserDocument,
    message: MessageDocument
  ) => Promise<MessageDocument>
}

export interface IMessageCreate {
  from: UserDocument
  to: UserDocument
  appID: string
  data: CreateMessageInput
}
