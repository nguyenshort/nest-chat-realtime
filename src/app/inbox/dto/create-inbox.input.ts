import { InputType, Int, Field } from '@nestjs/graphql';

@InputType()
export class CreateInboxInput {
  @Field(() => Int, { description: 'Example field (placeholder)' })
  exampleField: number;
}
