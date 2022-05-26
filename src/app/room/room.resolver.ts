import {
  Resolver,
  Mutation,
  Args,
  Subscription,
  Query,
  Int
} from '@nestjs/graphql'
import { RoomService } from './room.service'
import { Room } from './entities/room.entity'
import { CreateRoomInput } from './dto/create-room.input'
import { InputValidator } from '@shared/validator/input.validator'
import { CACHE_MANAGER, Inject, UseGuards } from '@nestjs/common'
import { JWTAuthGuard } from '@guards/jwt.guard'
import { CurrentLicense } from '@decorators/license.decorator'
import { LicenseDocument } from '@app/license/entities/license.entity'
import { UsersService } from '@app/users/users.service'
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
import {
  IRoomJoinEvent,
  IRoomLeftEvent,
  IRoomOnlinesEvent
} from '@app/room/types/events'
import { withCancel } from '@apollo/with-cancel'
import { UserDocument } from '@app/users/entities/user.entity'
import { SubscriptionLicense } from '@decorators/subscription-license.decorator'
import { UpserRoomInput } from '@app/room/dto/upsert-room.input'
import { GetRoomsInput } from '@app/room/dto/rooms-get.input'
import { UpdateRoomInfoInput } from '@app/room/dto/update-room-info'
import { Cache } from 'cache-manager'

@Resolver(() => Room)
export class RoomResolver {
  constructor(
    private readonly roomService: RoomService,
    private readonly userService: UsersService,
    @Inject(PUB_SUB) private pubSub: RedisPubSub,
    private eventEmitter: EventEmitter2,
    @Inject(CACHE_MANAGER) private readonly cache: Cache
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

  @Query(() => [Room])
  @UseGuards(JWTAuthGuard)
  async getRooms(
    @Args('input', new InputValidator()) input: GetRoomsInput,
    @CurrentLicense() license: LicenseDocument
  ) {
    const _user = await this.#getUserByID(input.userID, license)
    return this.roomService.getMany(
      { users: _user._id },
      input.offset,
      input.limit
    )
  }

  @Mutation(() => Room, { description: 'Sẽ xoá trong các version sau' })
  @UseGuards(JWTAuthGuard)
  async roomCreate(
    @Args('input', new InputValidator()) input: CreateRoomInput,
    @CurrentLicense() license: LicenseDocument
  ) {
    const _users = await Promise.all(
      input.users.map((user) =>
        this.userService.upsert(license, { name: input.name, userID: user })
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
        this.userService.upsert(license, {
          name: user.name,
          userID: user.userID
        })
      )
    )

    const _room = await this.roomService.getOne({
      license: license._id,
      users: _users.map((user) => user._id)
    })

    if (_room) return _room

    return this.roomService.create(license, _users, {
      avatar: '',
      name: ''
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
    const _newRoom = await this.roomService.update(_room, {
      $pull: {
        users: { $in: _users.map((user) => user._id) }
      }
    })

    this.eventEmitter.emit('room:onlines', { room: _newRoom })

    return _newRoom
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
    const _users = await Promise.all(
      input.users.map((user) =>
        this.userService.upsert(license, {
          name: user.name,
          userID: user.userID
        })
      )
    )

    const newRoom = await this.roomService.update(room, {
      $addToSet: {
        users: { $each: _users.map((user) => user._id) }
      }
    })

    this.eventEmitter.emit('room:onlines', {
      room: newRoom
    } as IRoomOnlinesEvent)
    return newRoom
  }

  @Mutation(() => Room)
  @UseGuards(JWTAuthGuard)
  async roomUpdateInfo(
    @CurrentLicense() license: LicenseDocument,
    @Args('input', new InputValidator()) input: UpdateRoomInfoInput
  ) {
    const user = await this.#getUserByID(input.userID, license)
    const room = await this.#getRoomByID(input.roomID, license, user)

    const _newRoom = await this.roomService.update(room, {
      name: input.name,
      avatar: input.avatar
    })

    this.eventEmitter.emit('room:onlines', {
      room: _newRoom
    } as IRoomOnlinesEvent)
    return _newRoom
  }

  @Subscription(() => Room)
  async roomSub(
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
    return withCancel(
      this.pubSub.asyncIterator(ChanelEnum.ROOM_ONLINES),
      () => {
        this.eventEmitter.emit('room:left', { room, user } as IRoomLeftEvent)
      }
    )
  }

  @Subscription(() => Room, {})
  @UseGuards(SubscriptionGuard)
  async subWaitingCall(
    @Args('userID', new InputValidator()) userID: string,
    @SubscriptionLicense() license: LicenseDocument
  ) {
    return this.pubSub.asyncIterator(ChanelEnum.WAITING_CALLING)
  }

  @Subscription(() => Room, {})
  @UseGuards(SubscriptionGuard)
  async subMyRooms(
    @Args('userID', new InputValidator()) userID: string,
    @SubscriptionLicense() license: LicenseDocument
  ) {
    await this.#getUserByID(userID, license)
    return this.pubSub.asyncIterator(ChanelEnum.MY_ROOMS)
  }

  @Subscription(() => [String])
  async subCallingRooms(@Args('roomID') roomID: string) {
    return this.pubSub.asyncIterator(ChanelEnum.JOIN_CALL)
  }

  @Subscription(() => [String])
  async subCalling(
    @Args('roomID') roomID: string,
    @Args('userID') userID: string
  ) {
    // khi kết nôi => vào
    await this.joinCall(roomID, userID)

    return withCancel(
      this.pubSub.asyncIterator(ChanelEnum.CALLING, {}),
      async () => {
        await this.leftCall(roomID, userID)
      }
    )
  }

  @Query(() => [String])
  async getRoomCalling(@Args('roomID') roomID: string) {
    const roomCall = await this.cache.get<string[]>(`calling-${roomID}`)
    return roomCall || []
  }

  async joinCall(
    @Args('roomID') roomID: string,
    @Args('userID') userID: string
  ) {
    const roomCall = await this.cache.get<string[]>(`calling-${roomID}`)

    const newcalling = [userID]

    if (roomCall) {
      newcalling.push(...roomCall)
    }

    await this.pubSub.publish(ChanelEnum.JOIN_CALL, {
      subCallingRooms: newcalling
    })
    // bắn sự kiện call tới mọi user trong phòng nếu là tạo phòng gọi ==> length = 1
    if (newcalling.length === 1) {
      const room = await this.roomService.getOne({ _id: roomID })

      console.log(newcalling)

      await this.pubSub.publish(ChanelEnum.WAITING_CALLING, {
        subWaitingCall: room
      })
    }

    await this.cache.set<string[]>(`calling-${roomID}`, newcalling)

    return newcalling
  }

  async leftCall(
    @Args('roomID') roomID: string,
    @Args('userID') userID: string
  ) {
    const roomCall = await this.cache.get<string[]>(`calling-${roomID}`)

    if (!roomCall) {
      return []
    }

    const _index = roomCall.indexOf(userID)

    const _newCalling = roomCall.filter((_, index) => _index !== index)

    await this.pubSub.publish(ChanelEnum.JOIN_CALL, {
      subCallingRooms: _newCalling
    })

    await this.cache.set<string[]>(`calling-${roomID}`, _newCalling)

    return _newCalling
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
