import { InputType, Field } from '@nestjs/graphql'
import { CreateAttachInput } from '@shared/attach/dto/create-attach.input'

@InputType()
export class CreateMessageInput extends CreateAttachInput {
  @Field(() => String, { description: 'Nội dung tin nhắn', nullable: true })
  content: string
}
