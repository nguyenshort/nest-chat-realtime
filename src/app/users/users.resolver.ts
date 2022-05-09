import { Args, Mutation, Query, Resolver } from '@nestjs/graphql'
import { UsersService } from './users.service'
import { User } from './entities/user.entity'
import { CreateUserInput } from '@app/users/dto/create-user.input'
import { InputValidator } from '@shared/validator/input.validator'
import { UpdateUserInput } from '@app/users/dto/update-user.input'

@Resolver(() => User)
export class UsersResolver {
  constructor(private readonly usersService: UsersService) {}

  @Mutation(() => User)
  async userCreate(
    @Args('input', new InputValidator()) input: CreateUserInput
  ) {
    return this.usersService.create(input)
  }

  @Mutation(() => User)
  async userUpdate(
    @Args('input', new InputValidator()) input: UpdateUserInput
  ) {
    return this.usersService.update(input)
  }

  @Mutation(() => User)
  async userRemove(@Args('id') id: string) {
    return this.usersService.remove(id)
  }

  @Query(() => User)
  userDetail(@Args('id', { type: () => String }) userID: string) {
    return this.usersService.findOne(userID)
  }
}
