import { Field, Float, ObjectType } from '@nestjs/graphql'
import { Prop } from '@nestjs/mongoose'
import { Types } from 'mongoose'
import { User, UserDocument } from '@app/users/entities/user.entity'

@ObjectType()
export class ReadAt {
  @Prop({ type: Types.ObjectId, ref: User.name, autopopulate: true })
  @Field(() => User)
  user: UserDocument

  @Prop()
  @Field(() => Float)
  time: number
}
