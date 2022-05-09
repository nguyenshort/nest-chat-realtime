import { Injectable } from '@nestjs/common'
import { CreateUserInput } from './dto/create-user.input'
import { Model, Types } from 'mongoose'
import { User, UserDocument } from '@app/users/entities/user.entity'
import { InjectModel } from '@nestjs/mongoose'
import { UpdateUserInput } from '@app/users/dto/update-user.input'

@Injectable()
export class UsersService {
  constructor(@InjectModel(User.name) private userModel: Model<UserDocument>) {}

  async create(input: CreateUserInput) {
    return this.userModel.create({
      ...input,
      createdAt: Date.now()
    })
  }

  async update(input: UpdateUserInput) {
    return this.userModel.findByIdAndUpdate(
      input.id,
      { ...input },
      { returnOriginal: false }
    )
  }

  async remove(id: string) {
    return this.userModel.findOneAndDelete(id as unknown as Types.ObjectId)
  }
}
