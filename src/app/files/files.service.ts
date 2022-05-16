import { Injectable } from '@nestjs/common'
import { InjectModel } from '@nestjs/mongoose'
import { File, FileDocument } from '@app/files/entities/file.entity'
import { Model } from 'mongoose'
import { AttachService } from '@shared/attach/attach.service'

@Injectable()
export class FilesService extends AttachService {
  constructor(@InjectModel(File.name) model: Model<FileDocument>) {
    super(model)
  }
}
