import { InputType, Field } from '@nestjs/graphql'
import { IsNotEmpty } from 'class-validator'
import { CreateUserInput } from '@app/users/dto/create-user.input'

@InputType()
export class CreateConnectInput {
  @Field(() => CreateUserInput, { description: 'Thông tin của thành viên' })
  @IsNotEmpty({ message: 'Thông tin của thành viên không được để trống' })
  user: CreateUserInput
}
