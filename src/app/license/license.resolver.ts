import { Resolver, Mutation, Args, Query, Subscription } from '@nestjs/graphql'
import { Cache } from 'cache-manager'

import { LicenseService } from './license.service'
import { Token } from './entities/license.entity'
import { CreateLicenseInput } from './dto/create-license.input'
import { InputValidator } from '@shared/validator/input.validator'
import { PUB_SUB } from '@apollo/pubsub.module'
import { CACHE_MANAGER, Inject, UseGuards } from '@nestjs/common'
import { RedisPubSub } from 'graphql-redis-subscriptions'
import ChanelEnum from '@apollo/chanel.enum'
import { User } from '@app/users/entities/user.entity'
import { CreateConnectInput } from '@app/license/dto/create-connect.input'
import { SubscriptionLicense } from '@decorators/subscription-license.decorator'
import { SubscriptionGuard } from '@guards/subscription.guard'
import { withCancel } from '@apollo/with-cancel'
import { EventEmitter2 } from '@nestjs/event-emitter'

@Resolver(() => Token)
export class LicenseResolver {
  constructor(
    private readonly licenseService: LicenseService,
    @Inject(PUB_SUB) private pubSub: RedisPubSub,
    private eventEmitter: EventEmitter2,
    @Inject(CACHE_MANAGER) private readonly cache: Cache
  ) {}

  @Mutation(() => Token)
  async licenseCreate(
    @Args('input', new InputValidator()) input: CreateLicenseInput
  ) {
    const check = await this.licenseService.getOne({ appID: input.appID })
    if (check) {
      return {
        token: await this.licenseService.JWTGenerator(check)
      }
    }

    const license = await this.licenseService.create(input)

    return {
      token: await this.licenseService.JWTGenerator(license)
    }
  }

  @Subscription(() => User)
  @UseGuards(SubscriptionGuard)
  async connect(
    @Args('input', new InputValidator()) input: CreateConnectInput,
    @SubscriptionLicense() license
  ) {
    // bắn sự kiện online
    this.eventEmitter.emit('connect:online', { license, user: input.user })
    return withCancel(this.pubSub.asyncIterator(ChanelEnum.CONNECT, {}), () =>
      // clear data
      this.eventEmitter.emit('connect:offline', { license, user: input.user })
    )
  }

  @Query(() => String)
  version() {
    return '0.0.1'
  }
}
