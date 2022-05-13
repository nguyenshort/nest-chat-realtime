import { CACHE_MANAGER, Inject, Injectable } from '@nestjs/common'
import { OnEvent } from '@nestjs/event-emitter'
import { PUB_SUB } from '@apollo/pubsub.module'
import { RedisPubSub } from 'graphql-redis-subscriptions'
import { IConnectOffline, IConnectOnline } from '@app/license/types/event'
import { Cache } from 'cache-manager'
import { UsersService } from '@app/users/users.service'
import chanelEnum from '@apollo/chanel.enum'
import { CacheKey } from '@cache/cache.key'

@Injectable()
export class LicenseEvent {
  constructor(
    @Inject(PUB_SUB) private pubSub: RedisPubSub,
    @Inject(CACHE_MANAGER) private readonly cache: Cache,
    private readonly usersService: UsersService
  ) {}

  @OnEvent('connect:online')
  async onOnline({ license, user }: IConnectOnline) {
    const appKey = CacheKey.appOnlines(license)

    const _online = (await this.cache.get<string[]>(appKey)) || []

    // gi đè filed nếu có
    const _newOnlines = [String(user.userID)].concat(_online)
    await this.cache.set(appKey, [...new Set(_newOnlines)])

    // cập nhật user
    const _user = await this.usersService.upsert(license, user)
    // bắn sự kiện online
    await this.pubSub.publish(chanelEnum.USER_ONLINE, {
      subUserOnline: { user: _user, isOnline: true }
    })
  }

  @OnEvent('connect:offline')
  async onOffline({ license, user }: IConnectOffline) {
    const appKey = CacheKey.appOnlines(license)

    const _online = (await this.cache.get<string[]>(appKey)) || []
    _online.splice(_online.indexOf(user.userID), 1)
    await this.cache.set(appKey, _online)

    // cập nhật user
    const _user = await this.usersService.findOne({
      userID: user.userID,
      licenseID: license._id
    })
    await this.pubSub.publish(chanelEnum.USER_ONLINE, {
      subUserOnline: { user: _user, isOnline: false }
    })
  }
}
