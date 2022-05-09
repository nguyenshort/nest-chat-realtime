import { Resolver, Query, Mutation, Args, Int } from '@nestjs/graphql'
import { MessageService } from './message.service'
import { Message, MessageDocument } from './entities/message.entity'
import { CreateMessageInput } from './dto/create-message.input'
import { UpdateMessageInput } from './dto/update-message.input'
import { IMessageResolver } from '@app/message/types/resolver'

@Resolver(() => Message)
export class MessageResolver implements IMessageResolver {
  constructor(private readonly messageService: MessageService) {}

  createMessage(): Promise<MessageDocument> {
    return Promise.resolve(undefined)
  }
}
