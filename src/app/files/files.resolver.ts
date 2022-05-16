import { Resolver, Mutation, Args } from '@nestjs/graphql'
import { FilesService } from './files.service'
import { File } from './entities/file.entity'
import { CreateFileInput } from './dto/create-file.input'
import { InputValidator } from '@shared/validator/input.validator'
import { CurrentLicense } from '@decorators/license.decorator'
import { LicenseDocument } from '@app/license/entities/license.entity'
import { UsersService } from '@app/users/users.service'

import { RoomService } from '@app/room/room.service'
import { UseGuards } from '@nestjs/common'
import { JWTAuthGuard } from '@guards/jwt.guard'
import { AttachResolver } from '@shared/attach/attach.resolver'

@Resolver(() => File)
export class FilesResolver extends AttachResolver {
  constructor(
    readonly filesService: FilesService,
    readonly usersService: UsersService,
    readonly roomService: RoomService
  ) {
    super(filesService, usersService, roomService)
  }

  @Mutation(() => File)
  @UseGuards(JWTAuthGuard)
  async fileCreate(
    @Args('input') input: CreateFileInput,
    @Args('roomId', new InputValidator()) roomId: string,
    @CurrentLicense() license: LicenseDocument
  ) {
    return super.attachSend<CreateFileInput>(
      input,
      license,
      roomId,
      (user) => ({
        from: user._id,
        file: input.file
      })
    )
  }
}
