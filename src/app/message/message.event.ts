import { Inject, Injectable } from '@nestjs/common'
import { OnEvent } from '@nestjs/event-emitter'
import { PUB_SUB } from '@apollo/pubsub.module'
import { RedisPubSub } from 'graphql-redis-subscriptions'
import { IAddedMessageEvent } from '@app/message/types/events'
import ChanelEnum from '@apollo/chanel.enum'
import { RoomService } from '@app/room/room.service'

@Injectable()
export class MessageEvent {
  constructor(
    @Inject(PUB_SUB) private pubSub: RedisPubSub,
    private readonly roomService: RoomService
  ) {}

  @OnEvent('message:added')
  async onAddedMessage({ message }: IAddedMessageEvent) {
    await this.pubSub.publish(ChanelEnum.ROOM, { roomSubMessage: message })

    // Todo: update room
    /**
     * 1. Get room
     * 2. Update room
     * 3. Check users online in room
     * 4. Fire event to users online in room
     */
    const _room = await this.roomService.update(message.room, {
      updatedAt: Date.now()
    })
  }
}
