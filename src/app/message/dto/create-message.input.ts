import { InputType, Field } from '@nestjs/graphql'
import { IsNotEmpty } from 'class-validator'

@InputType()
export class CreateMessageInput {
  @IsNotEmpty()
  @Field(() => String, { description: 'User ID người gửi' })
  from: string

  @Field(() => String, { description: 'Nội dung tin nhắn', nullable: true })
  content: string
}
