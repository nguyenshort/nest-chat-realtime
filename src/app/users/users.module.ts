import { Module } from '@nestjs/common'
import { UsersService } from './users.service'
import { UsersResolver } from './users.resolver'
import { MongooseModule } from '@nestjs/mongoose'
import { User, UserEntity } from '@app/users/entities/user.entity'
import { RedisCacheModule } from '@cache/cache.module'

@Module({
  imports: [
    MongooseModule.forFeature([
      {
        name: User.name,
        schema: UserEntity
      }
    ]),
    RedisCacheModule
  ],
  providers: [UsersResolver, UsersService],
  exports: [UsersService]
})
export class UsersModule {}
