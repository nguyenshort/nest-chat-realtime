import { Resolver, Mutation, Args, Subscription } from '@nestjs/graphql'
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

@Resolver(() => Room)
export class RoomResolver {
  constructor(
    private readonly roomService: RoomService,
    private readonly userService: UsersService,
    @Inject(PUB_SUB) private pubSub: RedisPubSub
  ) {}

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

  @Subscription(() => Message)
  async roomSubMessage(@Args('roomID') roomID: string) {
    if (!mongoose.Types.ObjectId.isValid(roomID)) {
      throw new ForbiddenError(
        'You are not allowed to send message to this room'
      )
    }

    const _room = await this.roomService.getOne({ _id: roomID })
    if (!_room) {
      throw new ForbiddenError(
        'You are not allowed to send message to this room'
      )
    }

    return this.pubSub.asyncIterator(ChanelEnum.ROOM)
  }
}
