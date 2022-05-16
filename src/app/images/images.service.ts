import { Injectable } from '@nestjs/common'
import { InjectModel } from '@nestjs/mongoose'
import { Model } from 'mongoose'
import { Image, ImageDocument } from '@app/images/entities/image.entity'
import { AttachService } from '@shared/attach/attach.service'

@Injectable()
export class ImagesService extends AttachService {
  constructor(@InjectModel(Image.name) readonly model: Model<ImageDocument>) {
    super(model)
  }
}
