import { InputType, Field } from '@nestjs/graphql'
import { CreateUserInput } from '@app/users/dto/create-user.input'

@InputType()
export class UpsertUsersInput {
  @Field(() => [CreateUserInput])
  users: CreateUserInput[]
}
