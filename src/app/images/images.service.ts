import { Injectable } from '@nestjs/common'
import { InjectModel } from '@nestjs/mongoose'
import { Model } from 'mongoose'
import { Image, ImageDocument } from '@app/images/entities/image.entity'
import { LicenseDocument } from '@app/license/entities/license.entity'
import { RoomDocument } from '@app/room/entities/room.entity'
import { IImageCreate } from '@app/images/types/service'
import { AttachService } from '@shared/attach/attach.service'

@Injectable()
export class ImagesService extends AttachService {
  constructor(@InjectModel(Image.name) readonly model: Model<ImageDocument>) {
    super(model)
  }

  async create(
    license: LicenseDocument,
    room: RoomDocument,
    input: IImageCreate
  ) {
    return this.model.create({
      from: input.from._id,
      images: input.images,
      room: room._id,
      license: license._id,
      createdAt: Date.now()
    })
  }

  async findMany(
    filter: object,
    gte: number,
    lte: number
  ): Promise<ImageDocument[]> {
    return this.model
      .find({
        ...filter,
        createdAt: {
          // lớn hơn hoặc bằng
          $gte: gte,
          // nhỏ hơn hoặc abnwgf
          $lte: lte
        }
      })
      .sort({
        createdAt: 1
      })
  }
}
