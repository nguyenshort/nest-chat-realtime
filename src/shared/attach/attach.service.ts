import { Injectable } from '@nestjs/common'
import { InjectModel } from '@nestjs/mongoose'
import { Model } from 'mongoose'
import { Attach, AttachDocument } from '@shared/attach/entities/attach.entity'
import { LicenseDocument } from '@app/license/entities/license.entity'
import { RoomDocument } from '@app/room/entities/room.entity'

@Injectable()
export class AttachService {
  constructor(
    @InjectModel(Attach.name) readonly model: Model<AttachDocument>
  ) {}

  async create(license: LicenseDocument, room: RoomDocument, doc: object) {
    return this.model.create({
      ...doc,
      room: room._id,
      license: license._id,
      createdAt: Date.now()
    })
  }
}
