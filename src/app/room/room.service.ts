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
    return this.roomModel.findByIdAndUpdate(room._id, doc, {
      returnOriginal: true
    })
  }

  async getMany(
    filter: object,
    skip: number,
    limit: number
  ): Promise<RoomDocument[]> {
    return this.roomModel
      .find(filter)
      .sort({ updatedAt: -1 })
      .skip(skip)
      .limit(limit)
  }

  // pipeline quá nhiều
  async getWidthMessage(
    filter: object,
    skip: number,
    limit: number
  ): Promise<RoomDocument[]> {
    return this.roomModel.aggregate([
      { $match: filter },
      {
        $lookup: {
          from: 'messages',
          localField: '_id',
          foreignField: 'room',
          as: 'messages',
          pipeline: [
            {
              $sort: {
                createdAt: -1
              }
            },
            {
              $limit: 1
            },
            {
              $lookup: {
                from: 'users',
                localField: 'from',
                foreignField: '_id',
                as: 'from'
              }
            },
            {
              $lookup: {
                from: 'licenses',
                localField: 'license',
                foreignField: '_id',
                as: 'license'
              }
            },
            {
              $unwind: '$from'
            },
            {
              $unwind: '$license'
            },
            {
              $replaceRoot: {
                newRoot: {
                  $mergeObjects: ['$$ROOT', { id: '$_id' }]
                }
              }
            }
          ]
        }
      },
      {
        $lookup: {
          from: 'users',
          localField: 'users',
          foreignField: '_id',
          as: 'users'
        }
      },
      {
        $unwind: '$messages'
      },
      { $sort: { updatedAt: -1 } },
      { $skip: skip },
      { $limit: limit }
    ])
  }
}
