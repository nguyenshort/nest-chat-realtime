import { InputType, Field } from '@nestjs/graphql'
import { CreateAttachInput } from '@shared/attach/dto/create-attach.input'

@InputType()
export class CreateImageInput extends CreateAttachInput {
  @Field(() => [String], { description: 'Hình ảnh tin nhắn' })
  images: string[]
}
