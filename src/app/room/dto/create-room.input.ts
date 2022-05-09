import { InputType, Int, Field, ID } from '@nestjs/graphql'
import GraphQLJSON from 'graphql-type-json'

@InputType()
export class CreateRoomInput {
  @Field(() => String, { description: 'tên nhóm' })
  name: string
  @Field(() => String, { description: 'ảnh đại diện' })
  avatar: string
  @Field(() => [String], { description: 'id users ' })
  users: string[]
}
