import { Module } from '@nestjs/common'
import { RoomService } from './room.service'
import { RoomResolver } from './room.resolver'
import { MongooseModule } from '@nestjs/mongoose'
import { Room, RoomEntity } from '@app/room/entities/room.entity'
import { UsersModule } from '@app/users/users.module'
import { RedisCacheModule } from '@cache/cache.module'

@Module({
  imports: [
    MongooseModule.forFeature([
      {
        name: Room.name,
        schema: RoomEntity
      }
    ]),
    UsersModule,
    RedisCacheModule
  ],
  providers: [RoomResolver, RoomService],
  exports: [RoomService]
})
export class RoomModule {}
