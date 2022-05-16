import { InputType, Field } from '@nestjs/graphql'
import { IsNotEmpty } from 'class-validator'
import { CreateAttachInput } from '@shared/attach/dto/create-attach.input'

@InputType()
export class CreateImageInput extends CreateAttachInput {
  @Field(() => [String], { description: 'Hình ảnh tin nhắn' })
  images: string[]
}
