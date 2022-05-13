import { CACHE_MANAGER, Inject, Injectable } from '@nestjs/common'
import { EventEmitter2, OnEvent } from '@nestjs/event-emitter'
import { PUB_SUB } from '@apollo/pubsub.module'
import { RedisPubSub } from 'graphql-redis-subscriptions'
import ChanelEnum from '@apollo/chanel.enum'
import { RoomService } from '@app/room/room.service'
import {
  IRoomJoinEvent,
  IRoomLeftEvent,
  IRoomOnlinesEvent
} from '@app/room/types/events'
import { Cache } from 'cache-manager'
import { CacheKey } from '@cache/cache.key'

@Injectable()
export class RoomEvents {
  constructor(
    @Inject(PUB_SUB) private pubSub: RedisPubSub,
    private readonly roomService: RoomService,
    private eventEmitter: EventEmitter2,
    @Inject(CACHE_MANAGER) private readonly cache: Cache
  ) {}

  @OnEvent('room:joined')
  async afterJoinRoom({ room, user }: IRoomJoinEvent) {
    // sau khi vào phòng.
    // gi vào phòng chat
    const roomOnlineKey = CacheKey.roomOnlines(room)
    const roomOnlines = await this.cache.get<string[]>(roomOnlineKey)

    const _newOnlines = [String(user.userID)].concat(roomOnlines || [])
    // Só thành viên của phòng vào redis
    await this.cache.set(roomOnlineKey, [...new Set(_newOnlines)])

    // Bắn thông báo online cho các thành viên của phòng
    this.eventEmitter.emit('room:onlines', { room } as IRoomOnlinesEvent)
  }

  @OnEvent('room:onlines')
  async onlines({ room }: IRoomOnlinesEvent) {
    const roomOnlineKey = CacheKey.roomOnlines(room)
    const roomOnlines = await this.cache.get<string[]>(roomOnlineKey)

    await this.pubSub.publish(ChanelEnum.ROOM_ONLINES, {
      roomOnlines: { room, onlines: roomOnlines || [] }
    })
  }

  @OnEvent('room:left')
  async left({ room, user }: IRoomLeftEvent) {
    const roomOnlineKey = CacheKey.roomOnlines(room)
    const roomOnlines = await this.cache.get<string[]>(roomOnlineKey)

    const _newOnlines = (roomOnlines || []).filter((e) => e !== user.userID)

    if (_newOnlines.length) {
      await this.cache.set(roomOnlineKey, _newOnlines)
      this.eventEmitter.emit('room:onlines', { room } as IRoomOnlinesEvent)
    } else {
      // xoá key nếu không còn có ai nữa
      await this.cache.del(roomOnlineKey)
    }
  }
}
