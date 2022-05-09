import { Module } from '@nestjs/common'
import { MessageService } from './message.service'
import { MessageResolver } from './message.resolver'
import { MongooseModule } from '@nestjs/mongoose'
import { Message, MessageEntity } from '@app/message/entities/message.entity'

@Module({
  imports: [
    MongooseModule.forFeature([
      {
        name: Message.name,
        schema: MessageEntity
      }
    ])
  ],
  providers: [MessageResolver, MessageService]
})
export class MessageModule {}
