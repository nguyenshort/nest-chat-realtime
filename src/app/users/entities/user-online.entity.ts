import { Field, ObjectType } from '@nestjs/graphql'
import { User, UserDocument } from '@app/users/entities/user.entity'

@ObjectType()
export class UserOnline {
  @Field(() => User)
  user: UserDocument

  @Field(() => Boolean)
  isOnline: boolean
}
