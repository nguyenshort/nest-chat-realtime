import { Module } from '@nestjs/common'
import { AppController } from './app.controller'
import { AppService } from './app.service'
import { ConfigModule } from '@nestjs/config'
import { DatabaseModule } from './database/database.module'
import { ApolloModule } from '@apollo/apollo.module'
import { PubSubModule } from '@apollo/pubsub.module'
import { EventEmitterModule } from '@nestjs/event-emitter'
import { ScheduleModule } from '@nestjs/schedule'
import { UsersModule } from '@app/users/users.module'
import { LicenseModule } from '@app/license/license.module'
import { MessageModule } from '@app/message/message.module'
import { RoomModule } from '@app/room/room.module'

@Module({
  imports: [
    ConfigModule.forRoot(),
    DatabaseModule,
    ApolloModule,
    PubSubModule,
    EventEmitterModule.forRoot(),
    ScheduleModule.forRoot(),
    UsersModule,
    LicenseModule,
    MessageModule,
    RoomModule
  ],
  controllers: [AppController],
  providers: [AppService]
})
export class AppModule {}
