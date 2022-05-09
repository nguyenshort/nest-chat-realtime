import { Injectable } from '@nestjs/common'
import { InjectModel } from '@nestjs/mongoose'
import { Model } from 'mongoose'
import { Message, MessageDocument } from '@app/message/entities/message.entity'
import { IMessageCreate, IMesssageService } from '@app/message/types/service'
import { UserDocument } from '@app/users/entities/user.entity'

@Injectable()
export class MessageService implements IMesssageService {
  constructor(
    @InjectModel(Message.name) private model: Model<MessageDocument>
  ) {}

  async create(input: IMessageCreate): Promise<MessageDocument> {
    return this.model.create({
      from: input.from._id,
      to: input.to._id,
      content: input.data.content,
      appID: input.appID,
      createdAt: Date.now()
    })
  }

  /**
   * Đọc tất cả message có thời gian nhỏ hơn message được chỉ định
   * Tìm kiếm các message có thời gian nhỏ hơn message được chỉ định và không con trong danh sách message đã đọc
   * Và thêm message đã đọc vào danh sách message đã đọc
   * @param user
   * @param anchor
   */
  async read(user: UserDocument, anchor: MessageDocument) {
    return this.model.updateMany(
      {
        roomID: anchor.roomID,
        createdAt: { $lt: anchor.createdAt },
        'readAt.user': { $ne: user._id }
      },
      { $push: { readAt: { user: user._id, time: Date.now() } } }
    )
  }

  async remove(
    user: UserDocument,
    message: MessageDocument
  ): Promise<MessageDocument> {
    return this.model.findOneAndDelete({})
  }
}
