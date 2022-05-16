import { Resolver } from '@nestjs/graphql'
import { Note } from './entities/note.entity'
import { AttachResolver } from '@shared/attach/attach.resolver'
import { FilesService } from '@app/files/files.service'
import { UsersService } from '@app/users/users.service'
import { RoomService } from '@app/room/room.service'

@Resolver(() => Note)
export class NotesResolver extends AttachResolver {
  constructor(
    readonly filesService: FilesService,
    readonly usersService: UsersService,
    readonly roomService: RoomService
  ) {
    super(filesService, usersService, roomService)
  }
}
