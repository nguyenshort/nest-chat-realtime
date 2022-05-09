import { InputType, Field } from '@nestjs/graphql'
import GraphQLJSON from 'graphql-type-json'

@InputType()
export class CreateUserInput {
  @Field(() => String, { description: 'tên người dùng' })
  name: string

  @Field(() => String, { description: 'ảnh đại diện người dùng' })
  avatar: string

  @Field(() => String, { description: 'id người dùng thật' })
  userID: string

  @Field(() => GraphQLJSON, {
    description: 'thông tin cá nhân',
    nullable: true
  })
  meta: JSON
}
