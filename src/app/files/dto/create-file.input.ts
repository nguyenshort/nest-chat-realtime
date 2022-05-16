import { InputType, Int, Field } from '@nestjs/graphql'
import { IsNotEmpty } from 'class-validator'

@InputType()
export class CreateFileInput {
  @IsNotEmpty()
  @Field(() => String, { description: 'User ID người gửi' })
  from: string
  @Field(() => String, { description: 'link file', nullable: true })
  file: string
}
