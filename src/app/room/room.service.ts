import { Injectable } from '@nestjs/common'
import { Model } from 'mongoose'
import { InjectModel } from '@nestjs/mongoose'
import { Room, RoomDocument } from '@app/room/entities/room.entity'
import { ICreateRoom, IRoomServices } from '@app/room/types/services'
import { LicenseDocument } from '@app/license/entities/license.entity'
import { UserDocument } from '@app/users/entities/user.entity'

@Injectable()
export class RoomService implements IRoomServices {
  constructor(@InjectModel(Room.name) private roomModel: Model<RoomDocument>) {}

  async create(
    license: LicenseDocument,
    users: UserDocument[],
    doc: ICreateRoom
  ) {
    return this.roomModel.create({
      ...doc,
      users: users.map((e) => e._id),
      license: license._id,
      createdAt: Date.now()
    })
  }

  async getOne(filter: object): Promise<RoomDocument> {
    return this.roomModel.findOne(filter)
  }

  async update(room: RoomDocument, doc: object): Promise<RoomDocument> {
    return this.roomModel.findOneAndUpdate(room._id, doc, { new: true })
  }
}
