import { Args, Mutation, Resolver } from '@nestjs/graphql'
import { UsersService } from './users.service'
import { User } from './entities/user.entity'
import { CreateUserInput } from '@app/users/dto/create-user.input'
import { InputValidator } from '@shared/validator/input.validator'
import { UpdateUserInput } from '@app/users/dto/update-user.input'
import { UseGuards } from '@nestjs/common'
import { JWTAuthGuard } from '@guards/jwt.guard'
import { CurrentLicense } from '@decorators/license.decorator'
import { LicenseDocument } from '@app/license/entities/license.entity'

@Resolver(() => User)
export class UsersResolver {
  constructor(private readonly usersService: UsersService) {}

  @Mutation(() => User)
  @UseGuards(JWTAuthGuard)
  async userCreate(
    @Args('input', new InputValidator()) input: CreateUserInput,
    @CurrentLicense() license: LicenseDocument
  ) {
    // todo: add appID
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
}
