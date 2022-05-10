import { Injectable } from '@nestjs/common'
import { Model } from 'mongoose'
import { User, UserDocument } from '@app/users/entities/user.entity'
import { InjectModel } from '@nestjs/mongoose'
import {
  ICreateUserInput,
  IUpdateUserInput,
  IUserService
} from '@app/users/types/service'
import { LicenseDocument } from '@app/license/entities/license.entity'

@Injectable()
export class UsersService implements IUserService {
  constructor(@InjectModel(User.name) private userModel: Model<UserDocument>) {}

  async create(license: LicenseDocument, input: ICreateUserInput) {
    return this.userModel.create({
      ...input,
      license: license._id,
      createdAt: Date.now()
    })
  }

  async findOne(filter: object) {
    return this.userModel.findOne(filter)
  }

  async remove(user: UserDocument) {
    return this.userModel.findByIdAndDelete(user._id)
  }

  async update(user: UserDocument, doc: IUpdateUserInput) {
    return this.userModel.findByIdAndUpdate(user._id, doc, {
      returnOriginal: false
    })
  }

  async upsert(
    license: LicenseDocument,
    input: ICreateUserInput
  ): Promise<UserDocument> {
    return this.userModel.findOneAndUpdate(
      {
        userID: input.userID,
        license: license._id
      },
      {
        name: input.name,
        avatar: input.avatar,
        $setOnInsert: {
          createdAt: Date.now()
        }
      },
      {
        returnOriginal: false,
        upsert: true,
        new: true,
        setDefaultsOnInsert: true
      }
    )
  }
}
