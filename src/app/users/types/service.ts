import { UserDocument } from '@app/users/entities/user.entity'
import { LicenseDocument } from '@app/license/entities/license.entity'

export interface IUserService {
  create: (
    license: LicenseDocument,
    input: ICreateUserInput
  ) => Promise<UserDocument>

  upsert: (
    license: LicenseDocument,
    input: ICreateUserInput
  ) => Promise<UserDocument>

  update: (user: UserDocument, doc: IUpdateUserInput) => Promise<UserDocument>

  remove: (user: UserDocument) => Promise<UserDocument>

  findOne: (filter: object) => Promise<UserDocument>
}

export interface ICreateUserInput {
  name: string
  avatar?: string
  userID: string
}

export interface IUpdateUserInput {
  name?: string
  avatar?: string
}
