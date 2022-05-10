import {
  Resolver,
  Mutation,
  Args,
  Query,
  Subscription,
  Context
} from '@nestjs/graphql'

import { LicenseService } from './license.service'
import { Token } from './entities/license.entity'
import { CreateLicenseInput } from './dto/create-license.input'
import { InputValidator } from '@shared/validator/input.validator'
import { PUB_SUB } from '@apollo/pubsub.module'
import { Inject } from '@nestjs/common'
import { RedisPubSub } from 'graphql-redis-subscriptions'
import ChanelEnum from '@apollo/chanel.enum'
import { User } from '@app/users/entities/user.entity'
import { CreateConnectInput } from '@app/license/dto/create-connect.input'

@Resolver(() => Token)
export class LicenseResolver {
  constructor(
    private readonly licenseService: LicenseService,
    @Inject(PUB_SUB) private pubSub: RedisPubSub
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
  async connect(
    @Args('input', new InputValidator()) input: CreateConnectInput
  ) {
    /**
     * Update lại user hiện có và đánh giấu online
     */
    return this.pubSub.asyncIterator(ChanelEnum.CONNECT)
  }

  @Query(() => String)
  hello(@Context() context: any) {
    console.log('context', context)
    return 'Hello World!'
  }
}
