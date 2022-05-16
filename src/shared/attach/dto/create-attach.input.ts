import { InputType, Field } from '@nestjs/graphql'
import { IsNotEmpty } from 'class-validator'

@InputType()
export class CreateAttachInput {
  @IsNotEmpty()
  @Field(() => String, { description: 'User ID người gửi' })
  from: string
}
