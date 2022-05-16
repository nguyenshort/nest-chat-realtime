import { UserDocument } from '@app/users/entities/user.entity'

export interface IImageCreate {
  from: UserDocument
  images: string[]
}
