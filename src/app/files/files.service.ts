import { Injectable } from '@nestjs/common'
import { CreateFileInput } from './dto/create-file.input'
import { UpdateFileInput } from './dto/update-file.input'
import { InjectModel } from '@nestjs/mongoose'
import { File, FileDocument } from '@app/files/entities/file.entity'
import { Model } from 'mongoose'
import { LicenseDocument } from '@app/license/entities/license.entity'
import { RoomDocument } from '@app/room/entities/room.entity'

@Injectable()
export class FilesService {
  constructor(@InjectModel(File.name) private model: Model<FileDocument>) {}
  async create(
    license: LicenseDocument,
    room: RoomDocument,
    input: CreateFileInput
  ): Promise<FileDocument> {
    return this.model.create({
      from: input.from,
      file: input.file,
      room: room._id,
      license: license._id,
      createdAt: Date.now()
    })
  }

  findAll() {
    return `This action returns all files`
  }

  findOne(id: number) {
    return `This action returns a #${id} file`
  }

  update(id: number, updateFileInput: UpdateFileInput) {
    return `This action updates a #${id} file`
  }

  remove(id: number) {
    return `This action removes a #${id} file`
  }
}
