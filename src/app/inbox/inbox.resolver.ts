import { Resolver, Query, Args } from '@nestjs/graphql'
import { InboxService } from './inbox.service'
import { Inbox, InboxUnion } from './entities/inbox.entity'
import { GetInboxsInput } from '@app/inbox/dto/inboxs.input'
import { InputValidator } from '@shared/validator/input.validator'
import { UseGuards } from '@nestjs/common'
import { JWTAuthGuard } from '@guards/jwt.guard'
import { CurrentLicense } from '@decorators/license.decorator'
import { LicenseDocument } from '@app/license/entities/license.entity'
import mongoose from 'mongoose'
import { ForbiddenError } from 'apollo-server-express'
import { RoomService } from '@app/room/room.service'
import { MessageService } from '@app/message/message.service'
import { ImagesService } from '@app/images/images.service'
import { FilesService } from '@app/files/files.service'

@Resolver(() => Inbox)
export class InboxResolver {
  constructor(
    private readonly inboxService: InboxService,
    private readonly roomService: RoomService,
    private readonly filesService: FilesService,
    private readonly imagesService: ImagesService,
    private readonly messageService: MessageService
  ) {}

  @Query(() => [InboxUnion])
  @UseGuards(JWTAuthGuard)
  async inboxsGet(
    @Args('filter', new InputValidator()) filter: GetInboxsInput,
    @CurrentLicense() license: LicenseDocument
  ) {
    if (!mongoose.Types.ObjectId.isValid(filter.roomID)) {
      throw new ForbiddenError(
        'You are not allowed to send message to this room'
      )
    }

    const _room = await this.roomService.getOne({
      _id: filter.roomID,
      license: license._id
    })
    if (!_room) {
      throw new ForbiddenError(
        'You are not allowed to send message to this room'
      )
    }

    // Cái này sẽ order thời gian theo thứ tự lớn nhất đầu tiên
    const messs = await this.messageService.getMany(
      { room: _room._id },
      filter.offset,
      filter.limit
    )

    if (!messs.length) {
      return []
    }

    const timer = {
      gte: 0,
      lte: 0
    }

    // => order nhỏ dần => thời gian lớn nhất là đầu tiên => endTime
    if (messs.length <= 1) {
      // nếu chỉ có 1 phần tử => khoảng thời gian = tin nhắn đó => hiện tại
      timer.gte = Date.now()
      timer.lte = messs[0].createdAt
    } else {
      timer.gte = messs[messs.length - 1].createdAt
      timer.lte = messs[0].createdAt
    }

    const [_images, _files] = await Promise.all([
      this.imagesService.findMany({ room: _room._id }, timer.gte, timer.lte),
      this.filesService.findMany({ room: _room._id }, timer.gte, timer.lte)
    ])

    return [...messs, ..._images, ..._files].sort(
      (a, b) => a.createdAt - b.createdAt
    )
  }
}
