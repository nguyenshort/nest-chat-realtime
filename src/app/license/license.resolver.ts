import { Resolver, Mutation, Args, Query } from '@nestjs/graphql'

import { LicenseService } from './license.service'
import { Token } from './entities/license.entity'
import { CreateLicenseInput } from './dto/create-license.input'
import { InputValidator } from '@shared/validator/input.validator'

@Resolver(() => Token)
export class LicenseResolver {
  constructor(private readonly licenseService: LicenseService) {}

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

  @Query(() => String)
  hello() {
    return 'Hello World!'
  }
}
