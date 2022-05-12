import { ObjectType, Field } from '@nestjs/graphql'
import { Message } from '@app/message/entities/message.entity'
import { Room } from '@app/room/entities/room.entity'

@ObjectType()
export class RoomMessages {
  @Field(() => Room)
  room: Room

  @Field(() => [Message])
  messages: Message[]
}
