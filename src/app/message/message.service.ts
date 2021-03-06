import { Injectable } from '@nestjs/common'
import { InjectModel } from '@nestjs/mongoose'
import { Model } from 'mongoose'
import { Message, MessageDocument } from '@app/message/entities/message.entity'
import { UserDocument } from '@app/users/entities/user.entity'
import { AttachService } from '@shared/attach/attach.service'

@Injectable()
export class MessageService extends AttachService {
  constructor(
    @InjectModel(Message.name) readonly model: Model<MessageDocument>
  ) {
    super(model)
  }

  /**
   * Đọc tất cả message có thời gian nhỏ hơn message được chỉ định
   * Tìm kiếm các message có thời gian nhỏ hơn message được chỉ định và không con trong danh sách message đã đọc
   * Và thêm message đã đọc vào danh sách message đã đọc
   * @param filter
   * @param user
   */
  async read(filter: object, user: UserDocument) {
    return this.model.updateMany(filter, {
      $push: { readAt: { user: user._id, time: Date.now() } }
    })
  }

  async remove(
    user: UserDocument,
    message: MessageDocument
  ): Promise<MessageDocument> {
    return this.model.findOneAndDelete({ from: user._id, _id: message._id })
  }

  async findMany(filter: object): Promise<MessageDocument[]> {
    return this.model.find(filter)
  }

  async getOne(filter: object): Promise<MessageDocument> {
    return this.model.findOne(filter)
  }

  async getMany(
    filter: object,
    skip: number,
    limit: number
  ): Promise<MessageDocument[]> {
    return this.model
      .find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
  }
}
