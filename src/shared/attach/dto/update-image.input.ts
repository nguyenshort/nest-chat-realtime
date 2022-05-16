import { CreateAttachInput } from './create-attach.input';
import { InputType, Field, Int, PartialType } from '@nestjs/graphql';

@InputType()
export class UpdateImageInput extends PartialType(CreateAttachInput) {
  @Field(() => Int)
  id: number;
}
