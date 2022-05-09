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
import { AuthModule } from '@app/auth/auth.module'

@Module({
  imports: [
    ConfigModule.forRoot(),
    DatabaseModule,
    ApolloModule,
    PubSubModule,
    EventEmitterModule.forRoot(),
    ScheduleModule.forRoot(),
    UsersModule,
    AuthModule
  ],
  controllers: [AppController],
  providers: [AppService]
})
export class AppModule {}
