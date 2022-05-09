import { InputType, Field } from '@nestjs/graphql'

@InputType()
export class CreateMessageInput {
  @Field(() => String, { description: 'Nội dung tin nhắn' })
  content: string

  @Field(() => String, { description: 'ID Phòng' })
  roomID: string
}
