import { ObjectType, Field } from '@nestjs/graphql'
import { Room } from '@app/room/entities/room.entity'

@ObjectType()
export class RoomOnlines {
  @Field(() => Room)
  room: Room

  @Field(() => [String])
  onlines: string[]
}
