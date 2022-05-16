import { Resolver, Mutation, Args } from '@nestjs/graphql'
import { ImagesService } from './images.service'
import { Image } from './entities/image.entity'
import { CreateImageInput } from './dto/create-image.input'
import { InputValidator } from '@shared/validator/input.validator'
import { Inject, UseGuards } from '@nestjs/common'
import { JWTAuthGuard } from '@guards/jwt.guard'
import { CurrentLicense } from '@decorators/license.decorator'
import { LicenseDocument } from '@app/license/entities/license.entity'
import { UsersService } from '@app/users/users.service'
import { RoomService } from '@app/room/room.service'
import { PUB_SUB } from '@apollo/pubsub.module'
import { RedisPubSub } from 'graphql-redis-subscriptions'
import { EventEmitter2 } from '@nestjs/event-emitter'
import { ForbiddenError } from 'apollo-server-express'
import mongoose from 'mongoose'

@Resolver(() => Image)
export class ImagesResolver {
  constructor(
    private readonly imagesService: ImagesService,
    private readonly usersService: UsersService,
    private readonly roomService: RoomService,
    @Inject(PUB_SUB) private pubSub: RedisPubSub,
    private eventEmitter: EventEmitter2
  ) {}

  @Mutation(() => Image)
  @UseGuards(JWTAuthGuard)
  async imageMessageSend(
    @Args('input', new InputValidator()) input: CreateImageInput,
    @CurrentLicense() license: LicenseDocument,
    @Args('roomId', new InputValidator()) roomId: string
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

    return this.imagesService.create(license, _room, {
      from: _user,
      images: input.images
    })
  }
}
