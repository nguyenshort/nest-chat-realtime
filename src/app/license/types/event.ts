import { LicenseDocument } from '@app/license/entities/license.entity'
import { CreateUserInput } from '@app/users/dto/create-user.input'

export interface IConnectOnline {
  license: LicenseDocument
  user: CreateUserInput
}

export type IConnectOffline = IConnectOnline
