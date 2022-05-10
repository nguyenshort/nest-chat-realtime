import { InputType, Field } from '@nestjs/graphql'

@InputType()
export class CreateRoomInput {
  @Field(() => String, {
    description: 'Tên nhóm',
    nullable: true
  })
  name: string

  @Field(() => String, { description: 'Ảnh đại diện', nullable: true })
  avatar: string

  @Field(() => [String], { description: 'Mảng userID' })
  users: string[]
}
