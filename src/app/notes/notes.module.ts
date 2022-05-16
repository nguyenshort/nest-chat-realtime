import { Module } from '@nestjs/common'
import { NotesService } from './notes.service'
import { NotesResolver } from './notes.resolver'
import { MongooseModule } from '@nestjs/mongoose'
import { UsersModule } from '@app/users/users.module'
import { RoomModule } from '@app/room/room.module'
import { Note, NoteEntity } from '@app/notes/entities/note.entity'

@Module({
  imports: [
    MongooseModule.forFeature([
      {
        name: Note.name,
        schema: NoteEntity
      }
    ]),
    UsersModule,
    RoomModule
  ],
  providers: [NotesResolver, NotesService]
})
export class NotesModule {}
