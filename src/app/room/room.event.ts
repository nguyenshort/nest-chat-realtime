import { Inject, Injectable } from '@nestjs/common'
import { OnEvent } from '@nestjs/event-emitter'
import { PUB_SUB } from '@apollo/pubsub.module'
import { RedisPubSub } from 'graphql-redis-subscriptions'
import ChanelEnum from '@apollo/chanel.enum'
import { RoomService } from '@app/room/room.service'
import { IRoomJoinEvent } from '@app/room/types/events'

@Injectable()
export class RoomEvent {
  constructor(
    @Inject(PUB_SUB) private pubSub: RedisPubSub,
    private readonly roomService: RoomService
  ) {}

  @OnEvent('room:joined')
  async afterJoinRoom({ room }: IRoomJoinEvent) {
    console.log(room)
  }
}
