import { Resolver, Mutation, Args, Subscription, Query } from '@nestjs/graphql'
import { RoomService } from './room.service'
import { Room } from './entities/room.entity'
import { CreateRoomInput } from './dto/create-room.input'
import { InputValidator } from '@shared/validator/input.validator'
import { Inject, UseGuards } from '@nestjs/common'
import { JWTAuthGuard } from '@guards/jwt.guard'
import { CurrentLicense } from '@decorators/license.decorator'
import { LicenseDocument } from '@app/license/entities/license.entity'
import { UsersService } from '@app/users/users.service'
import { Message } from '@app/message/entities/message.entity'
import { ForbiddenError } from 'apollo-server-express'
import mongoose from 'mongoose'
import { PUB_SUB } from '@apollo/pubsub.module'
import { RedisPubSub } from 'graphql-redis-subscriptions'
import ChanelEnum from '@apollo/chanel.enum'
import { KickRoomInput } from '@app/room/dto/kick-room.input'
import { AddToRoomInput } from '@app/room/dto/add-room.input'
import { RoomOnlines } from '@app/room/entities/room-info.entity'
import { SubscriptionGuard } from '@guards/subscription.guard'
import { EventEmitter2 } from '@nestjs/event-emitter'
import { IRoomJoinEvent, IRoomLeftEvent } from '@app/room/types/events'
import { withCancel } from '@apollo/with-cancel'
import { UserDocument } from '@app/users/entities/user.entity'
import { SubscriptionLicense } from '@decorators/subscription-license.decorator'
import { RoomMessages } from '@app/room/entities/room-messages.entity'
import { UpserRoomInput } from '@app/room/dto/upsert-room.input'

@Resolver(() => Room)
export class RoomResolver {
  constructor(
    private readonly roomService: RoomService,
    private readonly userService: UsersService,
    @Inject(PUB_SUB) private pubSub: RedisPubSub,
    private eventEmitter: EventEmitter2
  ) {}

  @Query(() => Room)
  @UseGuards(JWTAuthGuard)
  async roomGet(
    @Args('roomID', new InputValidator()) roomID: string,
    @Args('userID', new InputValidator()) userID: string,
    @CurrentLicense() license: LicenseDocument
  ) {
    const _user = await this.#getUserByID(userID, license)

    if (!mongoose.Types.ObjectId.isValid(roomID)) {
      throw new ForbiddenError(
        'You are not allowed to send message to this room'
      )
    }

    const _room = await this.roomService.getOne({
      _id: roomID,
      license: license._id, //, check if user is in room
      users: _user._id
    })
    if (!_room) {
      throw new ForbiddenError(
        'You are not allowed to send message to this room'
      )
    }

    this.eventEmitter.emit('room:joined', {
      room: _room,
      user: _user
    } as IRoomJoinEvent)

    return _room
  }

  @Mutation(() => Room)
  @UseGuards(JWTAuthGuard)
  async roomCreate(
    @Args('input', new InputValidator()) input: CreateRoomInput,
    @CurrentLicense() license: LicenseDocument
  ) {
    const _users = await Promise.all(
      input.users.map((user) =>
        this.userService.upsert(license, { name: '', userID: user })
      )
    )

    return this.roomService.create(license, _users, input)
  }

  @Mutation(() => Room)
  @UseGuards(JWTAuthGuard)
  async roomUpsert(
    @Args('input', new InputValidator()) input: UpserRoomInput,
    @CurrentLicense() license: LicenseDocument
  ) {
    const _users = await Promise.all(
      input.users.map((user) =>
        this.userService.upsert(license, { name: '', userID: user.userID })
      )
    )

    const _room = await this.roomService.getOne({
      license: license._id,
      users: _users.map((user) => user._id)
    })

    if (_room) return _room

    return this.roomService.create(license, _users, {
      avatar: '',
      name: 'Room Chat'
    })
  }

  @Mutation(() => Room)
  @UseGuards(JWTAuthGuard)
  async roomKick(
    @Args('input', new InputValidator()) input: KickRoomInput,
    @CurrentLicense() license: LicenseDocument
  ) {
    const _room = await this.roomService.getOne({
      _id: input.roomID,
      license: license._id
    })
    if (!_room) {
      throw new ForbiddenError(
        'You are not allowed to send message to this room'
      )
    }
    const _users = await this.userService.findMany({
      userID: { $in: input.userIDs },
      license: license._id
    })
    return this.roomService.update(_room, {
      $pull: {
        users: { $in: _users.map((user) => user._id) }
      }
    })
  }

  @Mutation(() => Room)
  @UseGuards(JWTAuthGuard)
  async roomAdd(
    @Args('input', new InputValidator()) input: AddToRoomInput,
    @CurrentLicense() license: LicenseDocument
  ) {
    const room = await this.roomService.getOne({
      _id: input.roomID,
      license: license._id
    })
    if (!room) {
      throw new ForbiddenError(
        'You are not allowed to send message to this room'
      )
    }
    const _users = await this.userService.findMany({
      userID: { $in: input.userIDs },
      license: license._id
    })

    return this.roomService.update(room, {
      $addToSet: {
        users: { $each: _users.map((user) => user._id) }
      }
    })
  }

  @Subscription(() => Message)
  async roomSubMessage(
    @Args('roomID') roomID: string,
    @Args('userID', new InputValidator()) userID: string,
    @SubscriptionLicense() license: LicenseDocument
  ) {
    const _user = await this.#getUserByID(userID, license)
    await this.#getRoomByID(roomID, license, _user)

    return this.pubSub.asyncIterator(ChanelEnum.ROOM)
  }

  @Subscription(() => RoomOnlines)
  @UseGuards(SubscriptionGuard)
  async roomOnlines(
    @Args('roomID') roomID: string,
    @Args('userID', new InputValidator()) userID: string,
    @SubscriptionLicense() license: LicenseDocument
  ) {
    const user = await this.#getUserByID(userID, license)
    const room = await this.#getRoomByID(roomID, license, user)
    //Bắn về chính event sau 1 giây
    setTimeout(() => {
      // Do something after 1 second
      this.eventEmitter.emit('room:joined', { room, user } as IRoomJoinEvent)
    }, 2000)
    return withCancel(
      this.pubSub.asyncIterator(ChanelEnum.ROOM_ONLINES),
      () => {
        this.eventEmitter.emit('room:left', { room, user } as IRoomLeftEvent)
      }
    )
  }

  @Subscription(() => RoomMessages)
  @UseGuards(SubscriptionGuard)
  async subMyRooms(
    @Args('userID', new InputValidator()) userID: string,
    @SubscriptionLicense() license: LicenseDocument
  ) {
    await this.#getUserByID(userID, license)
    return this.pubSub.asyncIterator(ChanelEnum.MY_ROOMS)
  }

  /**
   * Helper
   */
  async #getRoomByID(
    roomID: string,
    license: LicenseDocument,
    user: UserDocument
  ) {
    if (!mongoose.Types.ObjectId.isValid(roomID)) {
      throw new ForbiddenError(
        'You are not allowed to send message to this room'
      )
    }

    const _room = await this.roomService.getOne({
      _id: roomID,
      license: license._id,
      users: user._id
    })
    if (!_room) {
      throw new ForbiddenError(
        'You are not allowed to send message to this room'
      )
    }
    return _room
  }

  async #getUserByID(userID: string, license: LicenseDocument) {
    const _user = await this.userService.findOne({
      userID,
      license: license._id
    })

    if (!_user) {
      throw new ForbiddenError('User not found')
    }
    return _user
  }
}
