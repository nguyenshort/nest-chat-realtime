import { Module } from '@nestjs/common'
import { NotesService } from './notes.service'
import { NotesResolver } from './notes.resolver'
import { MongooseModule } from '@nestjs/mongoose'
import { Image, ImageEntity } from '@app/images/entities/image.entity'
import { UsersModule } from '@app/users/users.module'
import { RoomModule } from '@app/room/room.module'

@Module({
  imports: [
    MongooseModule.forFeature([
      {
        name: Image.name,
        schema: ImageEntity
      }
    ]),
    UsersModule,
    RoomModule
  ],
  providers: [NotesResolver, NotesService]
})
export class NotesModule {}
