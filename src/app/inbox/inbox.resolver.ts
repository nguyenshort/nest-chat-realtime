import { Resolver, Query, Args, Subscription, Mutation } from '@nestjs/graphql'
import { InboxService } from './inbox.service'
import { Inbox, InboxUnion } from './entities/inbox.entity'
import { GetInboxsInput } from '@app/inbox/dto/inboxs.input'
import { InputValidator } from '@shared/validator/input.validator'
import { Inject, UseGuards } from '@nestjs/common'
import { JWTAuthGuard } from '@guards/jwt.guard'
import { CurrentLicense } from '@decorators/license.decorator'
import { LicenseDocument } from '@app/license/entities/license.entity'
import mongoose from 'mongoose'
import { ForbiddenError } from 'apollo-server-express'
import { RoomService } from '@app/room/room.service'
import { MessageService } from '@app/message/message.service'
import { ImagesService } from '@app/images/images.service'
import { FilesService } from '@app/files/files.service'
import { UsersService } from '@app/users/users.service'
import { PUB_SUB } from '@apollo/pubsub.module'
import { RedisPubSub } from 'graphql-redis-subscriptions'
import ChanelEnum from '@apollo/chanel.enum'
import { RoomDocument } from '@app/room/entities/room.entity'
import { AttachDocument } from '@shared/attach/entities/attach.entity'
import { SubscriptionGuard } from '@guards/subscription.guard'
import { SubscriptionLicense } from '@decorators/subscription-license.decorator'

@Resolver(() => Inbox)
export class InboxResolver {
  constructor(
    private readonly inboxService: InboxService,
    private readonly roomService: RoomService,
    private readonly filesService: FilesService,
    private readonly imagesService: ImagesService,
    private readonly messageService: MessageService,
    readonly usersService: UsersService,
    @Inject(PUB_SUB) private pubSub: RedisPubSub
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

    // không có tin nhắn
    if (!messs.length) {
      // chưa có tin nhắn -> lấy toàn bộ attach
      if (filter.offset) {
        return []
      }

      const { images, files } = await this.#getGroupAttach(_room, {
        gte: _room.createdAt,
        lte: Date.now()
      })
      return this.sortAttatch([...images, ...files])
    }

    // có >= 1 tin nhắn
    const { images, files } = await this.#getGroupAttach(_room, {
      gte: messs[messs.length - 1].createdAt,
      lte: filter.offset === 0 ? Date.now() : messs[0].createdAt
    })

    return this.sortAttatch([...messs, ...images, ...files])
  }

  protected sortAttatch(attachs: AttachDocument[]) {
    return [...attachs].sort((a, b) => a.createdAt - b.createdAt)
  }

  @Subscription(() => InboxUnion, {
    filter: (payload, variables) => {
      return payload.subUpdatingInbox.room.id === variables.roomID
    }
  })
  async subUpdatingInbox(@Args('roomID') roomID: string) {
    return this.pubSub.asyncIterator(ChanelEnum.UPDATING_INBOX)
  }

  @Mutation(() => InboxUnion)
  async removeInbox(@Args('id') id: string, @Args('group') group: string) {
    let _inbox = {}

    if (group === 'message') {
      _inbox = await this.messageService.removeById(id)
    } else if (group === 'images') {
      _inbox = await this.imagesService.removeById(id)
    } else if (group === 'files') {
      _inbox = await this.filesService.removeById(id)
    }

    await this.pubSub.publish(ChanelEnum.UPDATING_INBOX, {
      subUpdatingInbox: _inbox
    })

    return _inbox
  }

  async #getGroupAttach(
    _room: RoomDocument,
    timer: { gte: number; lte: number }
  ) {
    const [images, files] = await Promise.all([
      this.imagesService.findMany({ room: _room._id }, timer.gte, timer.lte),
      this.filesService.findMany({ room: _room._id }, timer.gte, timer.lte)
    ])
    return { images, files }
  }

  // hàm bị sai
  @Subscription(() => Inbox)
  @UseGuards(SubscriptionGuard)
  async subNewInbox(
    @SubscriptionLicense() license: LicenseDocument,
    @Args('userID') userID: string
  ) {
    await this.#getUser(userID, license)
    return this.pubSub.asyncIterator(ChanelEnum.NEW_INBOX)
  }

  @Subscription(() => InboxUnion, {
    filter: (payload, variables) => {
      return payload.subNewInboxByRoom.room.id === variables.roomID
    }
  })
  @UseGuards(SubscriptionGuard)
  async subNewInboxByRoom(
    @SubscriptionLicense() license: LicenseDocument,
    @Args('userID') userID: string,
    @Args('roomID') roomID: string
  ) {
    await Promise.all([
      this.#getUser(userID, license),
      this.#getRoom(roomID, license)
    ])
    return this.pubSub.asyncIterator(ChanelEnum.NEW_INBOX_BY_ROOM)
  }

  async #getUser(userID: string, license: LicenseDocument) {
    const _user = await this.usersService.findOne({
      userID,
      license: license._id
    })
    if (!_user) {
      throw new ForbiddenError('To send message, you must be logged in')
    }

    return _user
  }

  async #getRoom(roomID: string, license: LicenseDocument) {
    if (!mongoose.Types.ObjectId.isValid(roomID)) {
      throw new ForbiddenError(
        'You are not allowed to send message to this room'
      )
    }

    const _room = await this.roomService.getOne({
      _id: roomID,
      license: license._id
    })
    if (!_room) {
      throw new ForbiddenError(
        'You are not allowed to send message to this room'
      )
    }

    return _room
  }
}
