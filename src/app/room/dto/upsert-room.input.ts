import { InputType, Field } from '@nestjs/graphql'
import { CreateUserInput } from '@app/users/dto/create-user.input'
import { ArrayMinSize } from 'class-validator'

@InputType()
export class UpserRoomInput {
  @Field(() => [CreateUserInput], { description: 'Mảng User Data' })
  @ArrayMinSize(2, { message: 'Phòng phải có ít nhất 2 người' })
  users: CreateUserInput[]
}
