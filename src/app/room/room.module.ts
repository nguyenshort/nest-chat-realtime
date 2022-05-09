import { Module } from '@nestjs/common'
import { RoomService } from './room.service'
import { RoomResolver } from './room.resolver'
import { MongooseModule } from '@nestjs/mongoose'
import { Room, RoomEntity } from '@app/room/entities/room.entity'

@Module({
  imports: [
    MongooseModule.forFeature([
      {
        name: Room.name,
        schema: RoomEntity
      }
    ])
  ],
  providers: [RoomResolver, RoomService]
})
export class RoomModule {}
