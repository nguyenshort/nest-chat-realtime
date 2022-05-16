import { Resolver } from '@nestjs/graphql'
import { AttachService } from './attach.service'
import { Attach } from './entities/attach.entity'
import { UsersService } from '@app/users/users.service'
import { RoomService } from '@app/room/room.service'
import { ForbiddenError } from 'apollo-server-express'
import { LicenseDocument } from '@app/license/entities/license.entity'
import mongoose from 'mongoose'
import { CreateAttachInput } from '@shared/attach/dto/create-attach.input'
import { AttachSendBuilder } from '@shared/attach/types/resolver'

@Resolver(() => Attach)
export class AttachResolver {
  constructor(
    readonly attchService: AttachService,
    readonly usersService: UsersService,
    readonly roomService: RoomService
  ) {}

  protected async attachSend<T extends CreateAttachInput>(
    input: T,
    license: LicenseDocument,
    roomId: string,
    builder: AttachSendBuilder<T>
  ) {
    const _user = await this.getUser(input.from, license)

    const _room = await this.getRoom(roomId, license)

    return this.attchService.create(
      license,
      _room,
      builder(_user, _room, input)
    )
  }

  protected async getUser(userID: string, license: LicenseDocument) {
    const _user = await this.usersService.findOne({
      userID,
      license: license._id
    })
    if (!_user) {
      throw new ForbiddenError('To send message, you must be logged in')
    }

    return _user
  }

  protected async getRoom(roomID: string, license: LicenseDocument) {
    if (!mongoose.Types.ObjectId.isValid(roomID)) {
      throw new ForbiddenError(
        'You are not allowed to send message to this room'
      )
    }

    const _room = await this.roomService.getOne({
      _id: roomID,
      license: license._id
    })
    if (!_room) {
      throw new ForbiddenError(
        'You are not allowed to send message to this room'
      )
    }

    return _room
  }
}
