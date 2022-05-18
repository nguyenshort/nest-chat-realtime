import { Resolver, Mutation, Args, Query } from '@nestjs/graphql'
import { MessageService } from './message.service'
import { Message } from './entities/message.entity'
import { CreateMessageInput } from '@app/message/dto/create-message.input'
import { InputValidator } from '@shared/validator/input.validator'
import { Inject, UseGuards } from '@nestjs/common'
import { PUB_SUB } from '@apollo/pubsub.module'
import { RedisPubSub } from 'graphql-redis-subscriptions'
import { UsersService } from '@app/users/users.service'
import { JWTAuthGuard } from '@guards/jwt.guard'
import { LicenseDocument } from '@app/license/entities/license.entity'
import { CurrentLicense } from '@decorators/license.decorator'
import { ForbiddenError } from 'apollo-server-express'
import { RoomService } from '@app/room/room.service'
import mongoose from 'mongoose'
import { EventEmitter2 } from '@nestjs/event-emitter'
import { ReadMessageInput } from '@app/message/dto/read-message.input'
import { GetMessagesInput } from '@app/message/dto/messages.input'
import { GetRoomsInput } from '@app/room/dto/rooms-get.input'
import { RoomMessages } from '@app/room/entities/room-messages.entity'
import { AttachResolver } from '@shared/attach/attach.resolver'
import { IInboxAdded, InboxEventEnum } from '@app/inbox/types/event'

@Resolver(() => Message)
export class MessageResolver extends AttachResolver {
  constructor(
    readonly messageService: MessageService,
    readonly usersService: UsersService,
    readonly roomService: RoomService,
    @Inject(PUB_SUB) private pubSub: RedisPubSub,
    private eventEmitter: EventEmitter2
  ) {
    super(messageService, usersService, roomService)
  }

  @Mutation(() => Message)
  @UseGuards(JWTAuthGuard)
  async messageSend(
    @Args('input', new InputValidator()) input: CreateMessageInput,
    @Args('roomId', new InputValidator()) roomId: string,
    @CurrentLicense() license: LicenseDocument
  ) {
    const message = await super.attachSend<CreateMessageInput>(
      input,
      license,
      roomId,
      (user) => ({
        from: user._id,
        content: input.content
      })
    )

    this.eventEmitter.emit(InboxEventEnum.ADD, {
      attach: message,
      type: 'message'
    } as IInboxAdded)

    return message
  }

  @Mutation(() => [Message])
  @UseGuards(JWTAuthGuard)
  async messageRead(
    @Args('input', new InputValidator()) input: ReadMessageInput,
    @CurrentLicense() license: LicenseDocument
  ) {
    const _user = await super.getUser(input.userID, license)

    if (!mongoose.Types.ObjectId.isValid(input.anchor)) {
      throw new ForbiddenError(
        'You are not allowed to send message to this room'
      )
    }

    const _anchor = await this.messageService.getOne({
      _id: input.anchor,
      license: license._id
    })

    if (!_anchor) {
      throw new ForbiddenError('You message is not valid')
    }

    // Danh sách tin nhắn chưa đọc tính từ điểm neo _anchor <=
    const _messages = await this.messageService.findMany({
      room: _anchor.room._id,
      createdAt: { $lte: _anchor.createdAt },
      'readAt.user': { $ne: _user._id }
    })

    await this.messageService.read(
      { _id: { $in: _messages.map((e) => e._id) } },
      _user
    )

    return this.messageService.findMany({
      _id: { $in: _messages.map((e) => e._id) }
    })
  }

  // todo: remove => inbox
  @Query(() => [Message])
  @UseGuards(JWTAuthGuard)
  async messagesByRoom(
    @Args('filter', new InputValidator()) filter: GetMessagesInput,
    @CurrentLicense() license: LicenseDocument
  ) {
    if (!mongoose.Types.ObjectId.isValid(filter.roomID)) {
      throw new ForbiddenError(
        'You are not allowed to send message to this room'
      )
    }

    const _room = await this.roomService.getOne({ _id: filter.roomID })
    if (!_room) {
      throw new ForbiddenError(
        'You are not allowed to send message to this room'
      )
    }

    return (
      await this.messageService.getMany(
        { room: _room._id },
        filter.offset,
        filter.limit
      )
    ).reverse()
  }
}
