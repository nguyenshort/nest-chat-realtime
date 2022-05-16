import { Module } from '@nestjs/common'
import { MessageService } from './message.service'
import { MessageResolver } from './message.resolver'
import { MongooseModule } from '@nestjs/mongoose'
import { Message, MessageEntity } from '@app/message/entities/message.entity'
import { UsersModule } from '@app/users/users.module'
import { RoomModule } from '@app/room/room.module'
import { MessageEvent } from '@app/message/message.event'

@Module({
  imports: [
    MongooseModule.forFeature([
      {
        name: Message.name,
        schema: MessageEntity
      }
    ]),
    UsersModule,
    RoomModule
  ],
  providers: [MessageResolver, MessageService, MessageEvent],
  exports: [MessageService]
})
export class MessageModule {}
