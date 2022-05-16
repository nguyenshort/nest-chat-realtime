import { Module } from '@nestjs/common'
import { ImagesService } from './images.service'
import { ImagesResolver } from './images.resolver'
import { UsersModule } from '@app/users/users.module'
import { MongooseModule } from '@nestjs/mongoose'
import { Image, ImageEntity } from '@app/images/entities/image.entity'
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
  providers: [ImagesResolver, ImagesService]
})
export class ImagesModule {}
