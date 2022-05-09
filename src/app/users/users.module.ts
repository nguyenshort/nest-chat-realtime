import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { UsersResolver } from './users.resolver';
import { MongooseModule } from '@nestjs/mongoose'
import { User, UserEntity } from '@app/users/entities/user.entity';

@Module({
  imports: [
    MongooseModule.forFeature([
      {
        name: User.name,
        schema: UserEntity
      },
    ])
  ],
  providers: [UsersResolver, UsersService]
})
export class UsersModule {}
