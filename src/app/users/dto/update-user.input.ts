import { CreateUserInput } from './create-user.input'
import { InputType, Field, Int, PartialType, ID } from '@nestjs/graphql'
import GraphQLJSON from 'graphql-type-json'

@InputType()
export class UpdateUserInput extends PartialType(CreateUserInput) {
  @Field(() => ID, { description: 'id người dùng' })
  id: string
  @Field(() => String, { description: 'tên người dùng' })
  name: string
  @Field(() => String, { description: 'ảnh đại diện người dùng' })
  avatar: string
  @Field(() => String, { description: 'id người dùng thật' })
  userID: string
  @Field(() => GraphQLJSON, { description: 'thông tin cá nhân' })
  meta: JSON
}
