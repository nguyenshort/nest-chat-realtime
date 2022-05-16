import { InputType, Field } from '@nestjs/graphql'
import { CreateAttachInput } from '@shared/attach/dto/create-attach.input'

@InputType()
export class CreateNoteInput extends CreateAttachInput {
  @Field(() => String, { description: 'Nọi dung gi chú' })
  note: string
}
