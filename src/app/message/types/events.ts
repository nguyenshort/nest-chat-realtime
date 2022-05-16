import { MessageDocument } from '@app/message/entities/message.entity'

export interface IAddedMessageEvent {
  message: MessageDocument
}
