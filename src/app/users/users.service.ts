import { Injectable } from '@nestjs/common'
import { CreateUserInput } from './dto/create-user.input'
import { Model } from 'mongoose'
import { User, UserDocument } from '@app/users/entities/user.entity'
import { InjectModel } from '@nestjs/mongoose'

@Injectable()
export class UsersService {
  constructor(@InjectModel(User.name) private userModel: Model<UserDocument>) {}

  async create(createUserInput: CreateUserInput) {
    return 'This action adds a new user'
  }
}
