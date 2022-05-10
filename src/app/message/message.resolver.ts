import { Resolver, Query, Mutation, Args, Int } from '@nestjs/graphql'
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

@Resolver(() => Message)
export class MessageResolver {
  constructor(
    private readonly messageService: MessageService,
    private readonly usersService: UsersService,
    private readonly roomService: RoomService,
    @Inject(PUB_SUB) private pubSub: RedisPubSub
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

    return this.messageService.create(license, _room, {
      from: _user,
      content: input.content
    })
  }
}
