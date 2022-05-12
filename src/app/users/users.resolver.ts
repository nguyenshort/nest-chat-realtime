import { Args, Mutation, Resolver, Subscription } from '@nestjs/graphql'
import { UsersService } from './users.service'
import { User } from './entities/user.entity'
import { CreateUserInput } from '@app/users/dto/create-user.input'
import { InputValidator } from '@shared/validator/input.validator'
import { UpdateUserInput } from '@app/users/dto/update-user.input'
import { Inject, UseGuards } from '@nestjs/common'
import { JWTAuthGuard } from '@guards/jwt.guard'
import { CurrentLicense } from '@decorators/license.decorator'
import { LicenseDocument } from '@app/license/entities/license.entity'
import { ForbiddenError } from 'apollo-server-express'
import { UpsertUsersInput } from '@app/users/dto/upserts-user.input'
import { UserOnline } from '@app/users/entities/user-online.entity'
import { SubscriptionGuard } from '@guards/subscription.guard'
import { SubscriptionLicense } from '@decorators/subscription-license.decorator'
import { PUB_SUB } from '@apollo/pubsub.module'
import { RedisPubSub } from 'graphql-redis-subscriptions'
import chanelEnum from '@apollo/chanel.enum'

@Resolver(() => User)
export class UsersResolver {
  constructor(
    private readonly usersService: UsersService,
    @Inject(PUB_SUB) private pubSub: RedisPubSub
  ) {}

  @Mutation(() => User)
  @UseGuards(JWTAuthGuard)
  async userCreate(
    @Args('input', new InputValidator()) input: CreateUserInput,
    @CurrentLicense() license: LicenseDocument
  ) {
    return this.usersService.create(license, input)
  }

  @Mutation(() => [User])
  @UseGuards(JWTAuthGuard)
  async upsertUsers(
    @CurrentLicense() license: LicenseDocument,
    @Args('input', new InputValidator()) { users }: UpsertUsersInput
  ) {
    return Promise.all(users.map((e) => this.usersService.upsert(license, e)))
  }

  @Mutation(() => User)
  @UseGuards(JWTAuthGuard)
  async userUpdate(
    @Args('input', new InputValidator()) input: UpdateUserInput,
    @Args('userID', { description: 'User ID' }) userID: string,
    @CurrentLicense() license: LicenseDocument
  ) {
    const _user = await this.#getUser(userID, license)

    const _merge = Object.assign({}, _user, input)

    return this.usersService.update(_user, {
      name: _merge.name,
      avatar: _merge.avatar
    })
  }

  @Mutation(() => User)
  @UseGuards(JWTAuthGuard)
  async userRemove(
    @Args('userID') userID: string,
    @CurrentLicense() license: LicenseDocument
  ) {
    const _user = await this.#getUser(userID, license)
    return this.usersService.remove(_user)
  }

  /**
   * Helper
   */
  async #getUser(userID: string, license: LicenseDocument) {
    const _user = await this.usersService.findOne({
      appID: license.appID,
      userID
    })

    if (!_user) {
      throw new ForbiddenError('User not found')
    }
    return _user
  }

  @Subscription(() => UserOnline)
  @UseGuards(SubscriptionGuard)
  async subUserOnline(
    @Args('userID') userID: string,
    @SubscriptionLicense() license: LicenseDocument
  ) {
    await this.#getUser(userID, license)

    return this.pubSub.asyncIterator(chanelEnum.USER_ONLINE)
  }
}
