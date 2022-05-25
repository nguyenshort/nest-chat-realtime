import { Inject, Injectable } from '@nestjs/common'
import { OnEvent } from '@nestjs/event-emitter'
import { PUB_SUB } from '@apollo/pubsub.module'
import { RedisPubSub } from 'graphql-redis-subscriptions'
import { RoomService } from '@app/room/room.service'
import { IInboxAdded, InboxEventEnum } from '@app/inbox/types/event'
import ChanelEnum from '@apollo/chanel.enum'

@Injectable()
export class InboxEvent {
  constructor(
    @Inject(PUB_SUB) private pubSub: RedisPubSub,
    private readonly roomService: RoomService
  ) {}

  @OnEvent(InboxEventEnum.ADD)
  async onAddedInbox({ attach }: IInboxAdded) {
    // await this.pubSub.publish(ChanelEnum.ROOM, { roomSubMessage: message })

    // Todo: update room
    /**
     * 1. Get room
     * 2. Update room
     * 3. Check users online in room
     * 4. Fire event to users online in room
     */
    const _room = await this.roomService.update(attach.room, {
      updatedAt: Date.now()
    })

    // cập nhật room:
    await Promise.all([
      this.pubSub.publish(ChanelEnum.ROOM, { roomSub: _room }),
      this.pubSub.publish(ChanelEnum.NEW_INBOX, { subInbox: attach }),
      this.pubSub.publish(ChanelEnum.NEW_INBOX_BY_ROOM, {
        subNewInboxByRoom: attach
      }),
      this.pubSub.publish(ChanelEnum.MY_ROOMS, {
        subMyRooms: _room
      })
    ])
  }
}
