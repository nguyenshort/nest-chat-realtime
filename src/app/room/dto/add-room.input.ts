import { InputType, Field } from '@nestjs/graphql'
import { IsNotEmpty } from 'class-validator'

@InputType()
export class KickRoomInput {
  @IsNotEmpty()
  @Field(() => String)
  roomID: string

  @IsNotEmpty()
  @Field(() => [String])
  userIDs: string[]
}
