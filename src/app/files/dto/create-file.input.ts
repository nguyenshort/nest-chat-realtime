import { InputType, Field } from '@nestjs/graphql'
import { CreateAttachInput } from '@shared/attach/dto/create-attach.input'

@InputType()
export class CreateFileInput extends CreateAttachInput {
  @Field(() => String, { description: 'link file', nullable: true })
  file: string
}
