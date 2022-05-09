import { MessageDocument } from '@app/message/entities/message.entity'

export interface IMessageResolver {
  createMessage: () => Promise<MessageDocument>
}
