import { InputType, Field } from '@nestjs/graphql'
import { IsNotEmpty } from 'class-validator'

@InputType()
export class ReadMessageInput {
  @IsNotEmpty()
  @Field(() => String, { description: 'Điểm neo' })
  anchor: string

  @IsNotEmpty()
  @Field(() => String, { description: 'ID người đọc' })
  userID: string
}
