import { Field, InputType } from '@nestjs/graphql'
import { CreateUserInput } from '@app/users/dto/create-user.input'
import { ArrayMinSize, IsNotEmpty } from 'class-validator'

@InputType()
export class AddToRoomInput {
  @IsNotEmpty()
  @Field(() => String)
  roomID: string

  @Field(() => [CreateUserInput], { description: 'Mảng User Data' })
  @ArrayMinSize(1, { message: 'Phòng phải có ít nhất 2 người' })
  users: CreateUserInput[]
}
