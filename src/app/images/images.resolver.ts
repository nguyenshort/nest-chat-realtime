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
  imageMessageSend(
    @Args('input', new InputValidator())
    input: CreateImageInput,
    @CurrentLicense() license: LicenseDocument
  ) {
    console.log(license)
  }
}
