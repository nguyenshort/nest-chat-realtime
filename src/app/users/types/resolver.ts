import { UserDocument } from '@app/users/entities/user.entity'

export interface IUserResolver {
  userCreate: () => Promise<UserDocument>
}
