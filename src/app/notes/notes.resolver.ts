import { Args, Mutation, Resolver } from '@nestjs/graphql'
import { Note } from './entities/note.entity'
import { AttachResolver } from '@shared/attach/attach.resolver'
import { UsersService } from '@app/users/users.service'
import { RoomService } from '@app/room/room.service'
import { UseGuards } from '@nestjs/common'
import { JWTAuthGuard } from '@guards/jwt.guard'
import { InputValidator } from '@shared/validator/input.validator'
import { CurrentLicense } from '@decorators/license.decorator'
import { LicenseDocument } from '@app/license/entities/license.entity'
import { CreateNoteInput } from '@app/notes/dto/create-note.input'
import { NotesService } from '@app/notes/notes.service'

@Resolver(() => Note)
export class NotesResolver extends AttachResolver {
  constructor(
    readonly notesService: NotesService,
    readonly usersService: UsersService,
    readonly roomService: RoomService
  ) {
    super(notesService, usersService, roomService)
  }

  @Mutation(() => Note)
  @UseGuards(JWTAuthGuard)
  async noteCreate(
    @Args('input') input: CreateNoteInput,
    @Args('roomId', new InputValidator()) roomId: string,
    @CurrentLicense() license: LicenseDocument
  ) {
    return super.attachSend<CreateNoteInput>(
      input,
      license,
      roomId,
      (user) => ({
        from: user._id,
        note: input.note
      })
    )
  }
}
