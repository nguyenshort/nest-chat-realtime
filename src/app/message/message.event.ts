import { Inject, Injectable } from '@nestjs/common'
import { OnEvent } from '@nestjs/event-emitter'
import { PUB_SUB } from '@apollo/pubsub.module'
import { RedisPubSub } from 'graphql-redis-subscriptions'
import { IAddedMessageEvent } from '@app/message/types/events'
import ChanelEnum from '@apollo/chanel.enum'

@Injectable()
export class MessageEvent {
  constructor(@Inject(PUB_SUB) private pubSub: RedisPubSub) {}

  @OnEvent('message:added')
  async onAddedMessage({ message }: IAddedMessageEvent) {
    await this.pubSub.publish(ChanelEnum.ROOM, { roomSubMessage: message })
  }
}
