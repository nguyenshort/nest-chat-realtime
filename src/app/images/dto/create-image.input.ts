import { InputType, Field } from '@nestjs/graphql'
import { IsNotEmpty } from 'class-validator'

@InputType()
export class CreateImageInput {
  @IsNotEmpty()
  @Field(() => String, { description: 'User ID người gửi' })
  from: string

  @Field(() => [String], { description: 'Hình ảnh tin nhắn' })
  content: string[]
}
