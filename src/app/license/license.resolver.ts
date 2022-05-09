import { Resolver, Mutation, Args } from '@nestjs/graphql'
import { UserInputError } from 'apollo-server-express'

import { LicenseService } from './license.service'
import { License } from './entities/license.entity'
import { CreateLicenseInput } from './dto/create-license.input'
import { InputValidator } from '@shared/validator/input.validator'

@Resolver(() => License)
export class LicenseResolver {
  constructor(private readonly licenseService: LicenseService) {}

  @Mutation(() => License)
  async createLicense(
    @Args('input', new InputValidator()) input: CreateLicenseInput
  ) {
    const check = await this.licenseService.getOne({ appID: input.appID })
    if (check) {
      throw new UserInputError('AppID ' + input.appID + ' đã tồn tại')
    }

    return this.licenseService.create(input)
  }
}
