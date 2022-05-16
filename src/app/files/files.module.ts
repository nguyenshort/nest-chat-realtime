import { Module } from '@nestjs/common'
import { FilesService } from './files.service'
import { FilesResolver } from './files.resolver'
import { MongooseModule } from '@nestjs/mongoose'
import { File, FileEntity } from '@app/files/entities/file.entity'
import { UsersModule } from '@app/users/users.module'
import { RoomModule } from '@app/room/room.module'

@Module({
  imports: [
    MongooseModule.forFeature([
      {
        name: File.name,
        schema: FileEntity
      }
    ]),
    UsersModule,
    RoomModule
  ],
  providers: [FilesResolver, FilesService],
  exports: [FilesService]
})
export class FilesModule {}
