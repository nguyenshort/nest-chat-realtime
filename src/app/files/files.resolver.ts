import { Resolver, Query, Mutation, Args, Int } from '@nestjs/graphql'
import { FilesService } from './files.service'
import { File } from './entities/file.entity'
import { CreateFileInput } from './dto/create-file.input'
import { UpdateFileInput } from './dto/update-file.input'
import { InputValidator } from '@shared/validator/input.validator'
import { CurrentLicense } from '@decorators/license.decorator'
import { LicenseDocument } from '@app/license/entities/license.entity'
import { ForbiddenError } from 'apollo-server-express'
import { UsersService } from '@app/users/users.service'

import mongoose from 'mongoose'
import { RoomService } from '@app/room/room.service'
import { UseGuards } from '@nestjs/common'
import { JWTAuthGuard } from '@guards/jwt.guard'

@Resolver(() => File)
export class FilesResolver {
  constructor(
    private readonly filesService: FilesService,
    private readonly usersService: UsersService,
    private readonly roomService: RoomService
  ) {}

  @Mutation(() => File)
  @UseGuards(JWTAuthGuard)
  async fileCreate(
    @Args('input') input: CreateFileInput,
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
    return this.filesService.create(license, _room, {
      from: _user._id,
      file: input.file
    })
  }

  @Query(() => [File], { name: 'files' })
  findAll() {
    return this.filesService.findAll()
  }

  @Query(() => File, { name: 'file' })
  findOne(@Args('id', { type: () => Int }) id: number) {
    return this.filesService.findOne(id)
  }

  @Mutation(() => File)
  updateFile(@Args('updateFileInput') updateFileInput: UpdateFileInput) {
    return this.filesService.update(updateFileInput.id, updateFileInput)
  }

  @Mutation(() => File)
  removeFile(@Args('id', { type: () => Int }) id: number) {
    return this.filesService.remove(id)
  }
}
