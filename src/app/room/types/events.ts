import { RoomDocument } from '@app/room/entities/room.entity'
import { UserDocument } from '@app/users/entities/user.entity'

export interface IRoomOnlinesEvent {
  room: RoomDocument
}

export interface IRoomJoinEvent {
  room: RoomDocument
  user: UserDocument
}

export type IRoomLeftEvent = IRoomJoinEvent
