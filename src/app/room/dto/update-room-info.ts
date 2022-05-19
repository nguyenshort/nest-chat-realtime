import { Field, InputType } from '@nestjs/graphql'
import { IsNotEmpty } from 'class-validator'

@InputType()
export class UpdateRoomInfoInput {
  @IsNotEmpty()
  @Field(() => String)
  userID: string

  @IsNotEmpty()
  @Field(() => String)
  roomID: string

  @Field(() => String)
  name: string

  @Field(() => String)
  avatar: string
}
