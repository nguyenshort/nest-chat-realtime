import { CreateInboxInput } from './create-inbox.input';
import { InputType, Field, Int, PartialType } from '@nestjs/graphql';

@InputType()
export class UpdateInboxInput extends PartialType(CreateInboxInput) {
  @Field(() => Int)
  id: number;
}
