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
import { AttachResolver } from '@shared/attach/attach.resolver'

@Resolver(() => Image)
export class ImagesResolver extends AttachResolver {
  constructor(
    @Inject(PUB_SUB) private pubSub: RedisPubSub,
    readonly attchService: ImagesService,
    readonly usersService: UsersService,
    readonly roomService: RoomService
  ) {
    super(attchService, usersService, roomService)
  }

  @Mutation(() => Image)
  @UseGuards(JWTAuthGuard)
  async imageMessageSend(
    @Args('input', new InputValidator()) input: CreateImageInput,
    @CurrentLicense() license: LicenseDocument,
    @Args('roomId', new InputValidator()) roomId: string
  ) {
    return super.attachSend<CreateImageInput>(
      input,
      license,
      roomId,
      (user) => ({
        from: user._id,
        images: input.images
      })
    )
  }
}
