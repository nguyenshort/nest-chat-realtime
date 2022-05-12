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

@Resolver(() => Message)
export class MessageResolver {
  constructor(
    private readonly messageService: MessageService,
    private readonly usersService: UsersService,
    private readonly roomService: RoomService,
    @Inject(PUB_SUB) private pubSub: RedisPubSub,
    private eventEmitter: EventEmitter2
  ) {}

  @Mutation(() => Message)
  @UseGuards(JWTAuthGuard)
  async messageSend(
    @Args('input', new InputValidator()) input: CreateMessageInput,
    @Args('roomId', new InputValidator()) roomId: string,
    @CurrentLicense() license: LicenseDocument
  ) {
    const _user = await this.usersService.findOne({
      userID: input.from,
      license: license._id
    })
    if (!_user) {
      throw new ForbiddenError('To send message, you must be logged in')
    }

    if (!mongoose.Types.ObjectId.isValid(roomId)) {
      throw new ForbiddenError(
        'You are not allowed to send message to this room'
      )
    }

    const _room = await this.roomService.getOne({ _id: roomId })
    if (!_room) {
      throw new ForbiddenError(
        'You are not allowed to send message to this room'
      )
    }

    const message = await this.messageService.create(license, _room, {
      from: _user,
      content: input.content
    })

    this.eventEmitter.emit('message:added', { message })

    return message
  }

  @Mutation(() => [Message])
  @UseGuards(JWTAuthGuard)
  async messageRead(
    @Args('input', new InputValidator()) input: ReadMessageInput,
    @CurrentLicense() license: LicenseDocument
  ) {
    const _user = await this.usersService.findOne({
      userID: input.userID,
      license: license._id
    })
    if (!_user) {
      throw new ForbiddenError('To send message, you must be logged in')
    }

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

  @Query(() => [RoomMessages])
  @UseGuards(JWTAuthGuard)
  async getRooms(@Args('input', new InputValidator()) input: GetRoomsInput) {
    const _user = await this.usersService.findOne({ userID: input.userID })
    if (!_user) {
      throw new ForbiddenError('User not found')
    }
    const _rooms = await this.roomService.getMany(
      { users: _user._id },
      input.offset,
      input.limit
    )
    return Promise.all(
      _rooms.map(async (room) => ({
        room,
        messages: await this.messageService.getMany({ room: room._id }, 0, 1)
      }))
    )
  }
}
